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

  // Read the provider from the environment
  const videoProvider = process.env.NEXT_PUBLIC_VIDEO_PROVIDER || "agora";

  // Determine the correct route
  const joinHref =
    videoProvider === "agora"
      ? `/admin/mentorship/live-agora/${sessionId}`
      : `/admin/mentorship/live/${sessionId}`;

  return <MentorshipPrecallSetup joinHref={joinHref} />;
}
