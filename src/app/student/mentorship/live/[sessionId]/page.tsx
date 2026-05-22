import { redirect } from "next/navigation";

import { AlertCircle, Clock3, VideoOff } from "lucide-react";

import { Card } from "@/src/components/ui/card";

import { Button } from "@/src/components/ui/button";

import { Link } from "@/src/components/ui/link";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { LiveRoomClient } from "@/src/app/admin/mentorship/live/[sessionId]/_features/mentorship-live/components/live-room-client";
import { getStudentLiveSessionAccess } from "@/src/app/student/mentorship/live/[sessionId]/_features/server-only/get-student-live-session-access";

interface LiveMentorshipPageProps {
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

export default async function LiveMentorshipPage({
  params,
}: LiveMentorshipPageProps) {
  const { sessionId } = await params;

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const access = await getStudentLiveSessionAccess({
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
        description="The teacher has not started this mentorship session yet. Please wait for the session to begin."
        backHref={backHref}
      />
    );
  }

  if (access.status === "ended") {
    return (
      <SessionStateCard
        icon={<VideoOff className="size-7 text-muted-foreground" />}
        title="Session Ended"
        description="This mentorship session has already ended and is no longer available to join."
        backHref={backHref}
      />
    );
  }

  if (access.status === "forbidden") {
    return (
      <SessionStateCard
        icon={<AlertCircle className="size-7 text-destructive" />}
        title="Access Denied"
        description="You do not have permission to join this mentorship session."
        backHref={backHref}
      />
    );
  }

  return (
    <LiveRoomClient
      meetingId={access.meetingId}
      token={access.token}
      participantName={access.participantName}
      isModerator={access.isModerator}
      isSessionOwner={access.isSessionOwner}
      sessionId={sessionId}
      endsAt={access.session.ends_at}
    />
  );
}
