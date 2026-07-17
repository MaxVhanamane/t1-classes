"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, RotateCcw, Send } from "lucide-react";
import { useRTCClient } from "agora-rtc-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

// The hard limit for Agora Stream Message is 1024 bytes (including the JSON envelope)
const MAX_MESSAGE_LENGTH = 500;

type MessageStatus = "sending" | "sent" | "failed";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
  status?: MessageStatus;
}

type RTCClientType = ReturnType<typeof useRTCClient>;

interface AgoraMeetingChatProps {
  localUid: string;
  participantName: string;
  client: RTCClientType;
}

interface AgoraMessagingClient {
  sendStreamMessage(msg: Uint8Array): Promise<void>;
}

export function AgoraMeetingChat({
  localUid,
  participantName,
  client,
}: AgoraMeetingChatProps) {
  const [message, setMessage] = useState("");
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [liveMessages.length]);

  useEffect(() => {
    const handleStreamMessage = (uid: number | string, payload: Uint8Array) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(payload));
        if (data.type === "CHAT_MESSAGE") {
          setLiveMessages((prev) => [
            ...prev,
            {
              id: data.id,
              senderId: uid.toString(),
              senderName: data.senderName,
              message: data.message,
              timestamp: data.timestamp,
              status: "sent",
            },
          ]);
        }
      } catch (error) {
        console.error("[CHAT_RECEIVE_ERROR]", error);
      }
    };

    client.on("stream-message", handleStreamMessage);
    return () => {
      client.off("stream-message", handleStreamMessage);
    };
  }, [client]);

  const sendMessage = useCallback(
    async (chatMessage: ChatMessage) => {
      const payload = JSON.stringify({
        type: "CHAT_MESSAGE",
        id: chatMessage.id,
        senderName: chatMessage.senderName,
        message: chatMessage.message,
        timestamp: chatMessage.timestamp,
      });

      try {
        const msgClient = client as unknown as AgoraMessagingClient;
        await msgClient.sendStreamMessage(new TextEncoder().encode(payload));

        setLiveMessages((prev) =>
          prev.map((msg) =>
            msg.id === chatMessage.id ? { ...msg, status: "sent" } : msg,
          ),
        );
      } catch (error) {
        console.error("[SEND_MESSAGE_ERROR]", error);
        setLiveMessages((prev) =>
          prev.map((msg) =>
            msg.id === chatMessage.id ? { ...msg, status: "failed" } : msg,
          ),
        );
      }
    },
    [client],
  );

  const handleSendMessage = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const chatMessage: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: localUid,
      senderName: participantName,
      message: trimmed,
      timestamp: Date.now(),
      status: "sending",
    };

    setLiveMessages((prev) => [...prev, chatMessage]);
    setMessage("");
    void sendMessage(chatMessage);
  }, [message, localUid, participantName, sendMessage]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto scrollbar-thin px-4 py-5 sm:px-5"
      >
        {liveMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="rounded-2xl border border-dashed px-5 py-4 text-center text-sm text-muted-foreground shadow-sm">
              No messages yet
            </div>
          </div>
        ) : (
          liveMessages.map((msg) => {
            const isOwn = msg.senderId === localUid;

            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[85%]">
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-sm ${
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "border bg-card"
                    }`}
                  >
                    {!isOwn && (
                      <p className="mb-1 text-xs font-semibold opacity-70">
                        {msg.senderName}
                      </p>
                    )}
                    <p className="wrap-break-word text-sm leading-relaxed">
                      {msg.message}
                    </p>
                  </div>

                  {isOwn && msg.status === "failed" && (
                    <div className="mt-1 flex items-center justify-end gap-2">
                      <span className="flex items-center gap-1 text-xs text-destructive">
                        <AlertCircle className="size-3" /> Failed
                      </span>
                      <button
                        type="button"
                        onClick={() => void sendMessage(msg)}
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <RotateCcw className="size-3" /> Retry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="sticky bottom-0 border-t bg-muted-soft/95 p-3 backdrop-blur">
        <div className="relative flex items-center gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleSendMessage();
              }
            }}
            placeholder="Send a message..."
            className="h-11 rounded-xl pr-16 bg-background shadow-sm"
            maxLength={MAX_MESSAGE_LENGTH}
          />

          <span
            className={`absolute right-16 text-[10px] pointer-events-none transition-opacity duration-150 ${
              message.length > 0 ? "opacity-100" : "opacity-0"
            } ${
              message.length >= MAX_MESSAGE_LENGTH
                ? "text-destructive font-bold"
                : "text-muted-foreground"
            }`}
          >
            {message.length}/{MAX_MESSAGE_LENGTH}
          </span>

          <Button
            disabled={!message.trim()}
            onClick={() => void handleSendMessage()}
            size="icon"
            className="size-11 shrink-0 rounded-xl shadow-sm"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
