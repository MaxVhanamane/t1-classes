import { MentorshipPrecallSetup } from "./_features/components/mentorship-precall-setup";

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
    <MentorshipPrecallSetup joinHref={`/admin/mentorship/live/${sessionId}`} />
  );
}
