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

  // Determine if Agora is configured based on the environment variable
  const videoProvider = process.env.NEXT_PUBLIC_VIDEO_PROVIDER || "agora";

  // Route dynamically to /live-agora or /live depending on the provider configuration
  const joinHref =
    videoProvider === "agora"
      ? `/student/mentorship/live-agora/${sessionId}`
      : `/student/mentorship/live/${sessionId}`;

  return <MentorshipPrecallSetup joinHref={joinHref} />;
}
