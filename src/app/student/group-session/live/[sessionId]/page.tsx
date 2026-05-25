import { redirect } from "next/navigation";

import { AlertCircle, Clock3, Video, VideoOff } from "lucide-react";

import { Card } from "@/src/components/ui/card";

import { Button } from "@/src/components/ui/button";

import { Link } from "@/src/components/ui/link";

import { getStudentGroupSessionAccess } from "./_features/server-only/get-student-group-session-access";

interface GroupSessionLivePageProps {
  params: Promise<{
    sessionId: string;
  }>;
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

export default async function GroupSessionLivePage({
  params,
}: GroupSessionLivePageProps) {
  const { sessionId } = await params;

  const access = await getStudentGroupSessionAccess({
    sessionId,
  });

  if (!access) {
    redirect("/login");
  }

  const backHref =
    access.status === "allowed"
      ? `/student/batches/${access.session.batch_id}`
      : "/student/dashboard";

  if (access.status === "not_started") {
    return (
      <SessionStateCard
        icon={<Clock3 className="size-7 text-muted-foreground" />}
        title="Session Not Started"
        description="The teacher has not started this group session yet. Please wait for the session to begin."
        backHref={backHref}
      />
    );
  }

  if (access.status === "ended") {
    return (
      <SessionStateCard
        icon={<VideoOff className="size-7 text-muted-foreground" />}
        title="Session Ended"
        description="This group session has already ended and is no longer available."
        backHref={backHref}
      />
    );
  }

  if (access.status === "forbidden") {
    return (
      <SessionStateCard
        icon={<AlertCircle className="size-7 text-destructive" />}
        title="Access Denied"
        description="You do not have permission to access this group session."
        backHref={backHref}
      />
    );
  }

  const session = access.session;

  return (
    <div className="flex h-(--h-viewport-minus-navbar) flex-col bg-background">
      {/* ---------- Header ---------- */}

      <div className="shrink-0 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-3 py-2 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Video className="size-4" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold sm:text-base">
                {session.title}
              </h1>

              {session.description && (
                <p className="hidden truncate text-xs text-muted-foreground sm:block">
                  {session.description}
                </p>
              )}
            </div>
          </div>

          <div className="inline-flex items-center gap-1 rounded-lg border bg-card px-2.5 py-1 text-[11px] shadow-sm sm:text-xs">
            <Clock3 className="size-3.5 text-muted-foreground" />

            <span>
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

      {/* ---------- Content ---------- */}

      <div className="flex min-h-0 flex-1 flex-col p-2 sm:p-4 lg:p-6">
        <div className="flex w-full max-w-7xl min-h-0 flex-1 flex-col mx-auto">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm sm:rounded-3xl sm:shadow-2xl">
            <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-500" />

                <span className="text-sm font-medium">Live Session</span>
              </div>
            </div>

            <div className="relative min-h-0 flex-1 bg-black">
              <iframe
                src={access.joinUrl}
                title={session.title}
                allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>

            <div className="border-t bg-muted/20 px-4 py-2 text-center text-[11px] text-muted-foreground sm:text-xs">
              If the meeting does not load correctly, try refreshing the page.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
