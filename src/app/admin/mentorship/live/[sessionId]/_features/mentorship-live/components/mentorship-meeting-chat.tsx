"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";

// Added Loader2 for the loading state
import { AlertCircle, RotateCcw, Send, Loader2 } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

type MessageStatus = "sending" | "sent" | "failed";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
  status?: MessageStatus;
}

export function MentorshipMeetingChat() {
  const { localParticipant } = useMeeting();

  const [message, setMessage] = useState("");

  const [persistedMessages, setPersistedMessages] = useState<ChatMessage[]>([]);
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);

  const [isFetchingHistory, setIsFetchingHistory] = useState(true);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { publish } = usePubSub("MENTORSHIP_CHAT", {
    onOldMessagesReceived(oldMessages) {
      try {
        const parsed = oldMessages
          .map((msg) => {
            try {
              return {
                ...(JSON.parse(msg.message) as ChatMessage),
                status: "sent" as const,
              };
            } catch {
              return null;
            }
          })
          .filter(Boolean) as ChatMessage[];

        setPersistedMessages(parsed);
      } catch (error) {
        console.error("[OLD_MESSAGES_ERROR]", error);
      } finally {
        // Turn off loader as soon as history arrives
        setIsFetchingHistory(false);
      }
    },

    onMessageReceived(sdkMessage) {
      try {
        const parsed = JSON.parse(sdkMessage.message) as ChatMessage;

        setLiveMessages((prev) => {
          const existingIndex = prev.findIndex((msg) => msg.id === parsed.id);

          if (existingIndex !== -1) {
            return prev.map((msg) =>
              msg.id === parsed.id
                ? {
                    ...msg,
                    status: "sent",
                  }
                : msg,
            );
          }

          return [
            ...prev,
            {
              ...parsed,
              status: "sent",
            },
          ];
        });
      } catch (error) {
        console.error("[LIVE_MESSAGE_ERROR]", error);
      }
    },
  });

  // Fallback: If there are 0 old messages, the pubsub callback might not fire at all.
  // This ensures the loader goes away after 1 second max.
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setIsFetchingHistory(false);
    }, 1000);

    return () => clearTimeout(fallbackTimer);
  }, []);

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
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages]);

  const sendMessage = useCallback(
    async (chatMessage: ChatMessage) => {
      try {
        await publish(JSON.stringify(chatMessage), {
          persist: true,
        });

        setLiveMessages((prev) =>
          prev.map((msg) =>
            msg.id === chatMessage.id
              ? {
                  ...msg,
                  status: "sent",
                }
              : msg,
          ),
        );
      } catch (error) {
        console.error("[SEND_MESSAGE_ERROR]", error);

        setLiveMessages((prev) =>
          prev.map((msg) =>
            msg.id === chatMessage.id
              ? {
                  ...msg,
                  status: "failed",
                }
              : msg,
          ),
        );
      }
    },
    [publish],
  );

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
      status: "sending",
    };

    setLiveMessages((prev) => [...prev, chatMessage]);
    setMessage("");
    void sendMessage(chatMessage);
  }, [message, localParticipant, sendMessage]);

  const handleRetry = useCallback(
    (messageId: string) => {
      const failedMessage = liveMessages.find((msg) => msg.id === messageId);

      if (!failedMessage) {
        return;
      }

      setLiveMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                status: "sending",
              }
            : msg,
        ),
      );

      void sendMessage({
        ...failedMessage,
        status: "sending",
      });
    },
    [liveMessages, sendMessage],
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-4"
      >
        {/* NEW: 3-Tier Rendering (Loading -> Empty -> Messages) */}
        {isFetchingHistory ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
          </div>
        ) : messages.length === 0 ? (
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
                <div className="max-w-[85%]">
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-sm ${
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

                  {isOwn && msg.status === "sending" && (
                    <p className="mt-1 text-right text-xs text-muted-foreground">
                      Sending...
                    </p>
                  )}

                  {isOwn && msg.status === "failed" && (
                    <div className="mt-1 flex items-center justify-end gap-2">
                      <span className="flex items-center gap-1 text-xs text-destructive">
                        <AlertCircle className="size-3" />
                        Failed
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          handleRetry(msg.id);
                        }}
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <RotateCcw className="size-3" />
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="sticky bottom-0 border-t  p-3 backdrop-blur">
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
            disabled={!message.trim()}
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
