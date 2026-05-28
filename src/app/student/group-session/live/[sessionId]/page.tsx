import { redirect } from "next/navigation";
import { getStudentGroupSessionAccess } from "./_features/server-only/get-student-group-session-access";
import {
  GroupSessionLiveView,
  NotStartedCard,
  EndedCard,
  ForbiddenCard,
} from "./_features/components/group-session-live-view";

interface GroupSessionLivePageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function GroupSessionLivePage({
  params,
}: GroupSessionLivePageProps) {
  const { sessionId } = await params;
  const access = await getStudentGroupSessionAccess({ sessionId });

  if (!access) redirect("/login");

  const backHref =
    access.status === "allowed"
      ? `/student/batches/${access.session.batch_id}`
      : "/student/dashboard";

  if (access.status === "not_started")
    return <NotStartedCard backHref={backHref} />;
  if (access.status === "ended") return <EndedCard backHref={backHref} />;
  if (access.status === "forbidden")
    return <ForbiddenCard backHref={backHref} />;

  return (
    <GroupSessionLiveView
      session={access.session}
      joinUrl={access.joinUrl}
      externalJoinUrl={access.externalJoinUrl}
    />
  );
}
