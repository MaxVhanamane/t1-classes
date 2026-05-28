"use client";

import { useEffect, useRef, useState } from "react";

import {
  AlertCircle,
  Check,
  Clock3,
  Copy,
  Expand,
  ExternalLink,
  Shrink,
  Video,
  VideoOff,
} from "lucide-react";

import { toast } from "sonner";

import { cn } from "@/src/lib/utils";

import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Link } from "@/src/components/ui/link";

interface Session {
  title: string;
  description?: string | null;
  starts_at: string;
  batch_id: string;
  meeting_passcode: string | null;
}

interface GroupSessionLiveViewProps {
  session: Session;
  joinUrl: string;
  externalJoinUrl: string;
}

function SessionStateCard({
  icon,
  title,
  description,
  backHref,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  backHref: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-muted">
            {icon}
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>

          <Button variant="outline" className="mt-6 rounded-xl" asChild>
            <Link href={backHref}>Back</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function GroupSessionLiveView({
  session,
  joinUrl,
  externalJoinUrl,
}: GroupSessionLiveViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [isExpanded, setIsExpanded] = useState(false);

  const [copied, setCopied] = useState(false);

  const copyPasscode = async () => {
    if (!session.meeting_passcode) {
      return;
    }

    await navigator.clipboard.writeText(session.meeting_passcode);

    setCopied(true);

    toast.success("Passcode copied");

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  /* ---------- Fullscreen State ---------- */

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsExpanded(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  /* ---------- Back Button ---------- */

  useEffect(() => {
    if (isExpanded) {
      window.history.pushState({ expanded: true }, "");
    }

    const handlePopState = async () => {
      if (isExpanded) {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }

        setIsExpanded(false);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isExpanded]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col bg-background transition-all duration-300",
        isExpanded ? "h-screen bg-black" : "h-(--h-viewport-minus-navbar)",
      )}
    >
      {/* ---------- Header ---------- */}

      {!isExpanded && (
        <div className="shrink-0 border-b bg-background/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
            <div className="flex min-w-0 items-center gap-3 overflow-hidden">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Video className="size-4.5" />
              </div>

              <div className="min-w-0 overflow-hidden">
                <h1 className="truncate text-sm font-semibold sm:text-base">
                  {session.title}
                </h1>

                <div className="mt-0.5 flex items-center gap-2 overflow-hidden text-[11px] text-muted-foreground sm:text-xs">
                  <span className="shrink-0">Group Session</span>

                  <span className="shrink-0 text-muted-foreground/50">•</span>

                  <span className="truncate">
                    Starts{" "}
                    {new Date(session.starts_at).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href={externalJoinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-xl px-3 text-xs"
              >
                <ExternalLink className="mr-1.5 size-3.5" />
                Zoom
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* ---------- Content ---------- */}

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          isExpanded ? "p-0" : "p-2 sm:p-4 lg:p-6",
        )}
      >
        <div
          className={cn(
            "flex min-h-0 w-full flex-1 flex-col",
            isExpanded ? "" : "mx-auto max-w-7xl",
          )}
        >
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-hidden border bg-card",
              isExpanded
                ? "rounded-none border-0 shadow-none"
                : "rounded-2xl shadow-sm sm:rounded-3xl sm:shadow-2xl",
            )}
          >
            {/* ---------- Toolbar ---------- */}

            <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2 sm:px-4">
              <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                <div className="size-2 shrink-0 rounded-full bg-emerald-500" />

                {session.meeting_passcode && (
                  <>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      Passcode
                    </span>

                    <span className="truncate rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground">
                      {session.meeting_passcode}
                    </span>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0 rounded-lg"
                      onClick={copyPasscode}
                    >
                      {copied ? (
                        <Check className="size-3.5" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
                onClick={async () => {
                  try {
                    if (!document.fullscreenElement) {
                      await containerRef.current?.requestFullscreen();
                    } else {
                      await document.exitFullscreen();
                    }
                  } catch (error) {
                    console.error("Fullscreen failed", error);
                  }
                }}
                title={isExpanded ? "Exit fullscreen" : "Expand"}
              >
                {isExpanded ? (
                  <Shrink className="size-4" />
                ) : (
                  <Expand className="size-4" />
                )}
              </Button>
            </div>

            {/* ---------- iframe ---------- */}

            <div className="relative min-h-0 flex-1 bg-black">
              <iframe
                src={joinUrl}
                title={session.title}
                loading="eager"
                allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>

            {/* ---------- Footer ---------- */}

            {!isExpanded && (
              <div className="border-t bg-muted/10 px-3 py-1.5 text-center text-[10px] text-muted-foreground">
                If the meeting does not load correctly, try opening it in the
                Zoom app.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  STATES                                    */
/* -------------------------------------------------------------------------- */

export function NotStartedCard({ backHref }: { backHref: string }) {
  return (
    <SessionStateCard
      icon={<Clock3 className="size-7 text-muted-foreground" />}
      title="Session Not Started"
      description="The teacher has not started this group session yet. Please wait for the session to begin."
      backHref={backHref}
    />
  );
}

export function EndedCard({ backHref }: { backHref: string }) {
  return (
    <SessionStateCard
      icon={<VideoOff className="size-7 text-muted-foreground" />}
      title="Session Ended"
      description="This group session has already ended and is no longer available."
      backHref={backHref}
    />
  );
}

export function ForbiddenCard({ backHref }: { backHref: string }) {
  return (
    <SessionStateCard
      icon={<AlertCircle className="size-7 text-destructive" />}
      title="Access Denied"
      description="You do not have permission to access this group session."
      backHref={backHref}
    />
  );
}
