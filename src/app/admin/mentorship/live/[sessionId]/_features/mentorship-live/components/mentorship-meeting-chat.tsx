"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";

import { Send } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

interface ChatMessage {
  id: string;

  senderId: string;

  senderName: string;

  message: string;

  timestamp: number;
}

export function MentorshipMeetingChat() {
  const { localParticipant } = useMeeting();

  const [message, setMessage] = useState("");

  const [persistedMessages, setPersistedMessages] = useState<ChatMessage[]>([]);

  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { publish } = usePubSub("MENTORSHIP_CHAT", {
    onOldMessagesReceived(oldMessages) {
      try {
        const parsed = oldMessages
          .map((msg) => {
            try {
              return JSON.parse(msg.message) as ChatMessage;
            } catch {
              return null;
            }
          })
          .filter(Boolean) as ChatMessage[];

        setPersistedMessages(parsed);
      } catch (error) {
        console.error("[OLD_MESSAGES_ERROR]", error);
      }
    },

    onMessageReceived(sdkMessage) {
      try {
        const parsed = JSON.parse(sdkMessage.message) as ChatMessage;

        setLiveMessages((prev) => {
          const exists = prev.some((msg) => msg.id === parsed.id);

          if (exists) {
            return prev;
          }

          return [...prev, parsed];
        });
      } catch (error) {
        console.error("[LIVE_MESSAGE_ERROR]", error);
      }
    },
  });

  const messages = useMemo(() => {
    const merged = [...persistedMessages, ...liveMessages];

    const unique = merged.filter(
      (message, index, self) =>
        index === self.findIndex((m) => m.id === message.id),
    );

    return unique.sort((a, b) => a.timestamp - b.timestamp);
  }, [persistedMessages, liveMessages]);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current?.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    const trimmed = message.trim();

    if (!trimmed) {
      return;
    }

    const chatMessage: ChatMessage = {
      id: crypto.randomUUID(),

      senderId: localParticipant?.id ?? "unknown",

      senderName: localParticipant?.displayName ?? "Participant",

      message: trimmed,

      timestamp: Date.now(),
    };

    try {
      await publish(JSON.stringify(chatMessage), {
        persist: true,
      });

      setMessage("");
    } catch (error) {
      console.error("[SEND_MESSAGE_ERROR]", error);
    }
  }, [message, publish, localParticipant]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="rounded-2xl border border-dashed px-5 py-4 text-center text-sm text-muted-foreground">
              No messages yet
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === localParticipant?.id;

            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "border bg-card"
                  }`}
                >
                  {!isOwn && (
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">
                      {msg.senderName}
                    </p>
                  )}

                  <p className="wrap-break-word text-sm leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="sticky bottom-0 border-t bg-muted-soft p-3 backdrop-blur">
        <div className="flex items-center gap-2">
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
            className="h-11 rounded-xl"
          />

          <Button
            onClick={() => {
              void handleSendMessage();
            }}
            size="icon"
            className="size-11 shrink-0 rounded-xl"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
