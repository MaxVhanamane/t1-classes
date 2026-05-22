import { MentorshipPrecallSetup } from "@/src/app/admin/mentorship/setup/[sessionId]/_features/components/mentorship-precall-setup";

interface MentorshipSetupPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function MentorshipSetupPage({
  params,
}: MentorshipSetupPageProps) {
  const { sessionId } = await params;

  return (
    <MentorshipPrecallSetup
      joinHref={`/student/mentorship/live/${sessionId}`}
    />
  );
}
