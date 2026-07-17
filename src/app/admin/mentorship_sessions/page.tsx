import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { getAuth } from "@/src/lib/auth/get-auth";
import { MentorshipClient } from "./_features/components/mentorship-client";

export default async function MentorshipSessionsPage() {
  const auth = await getAuth();

  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", "mentorship_sessions_enabled")
    .single();

  const mentorshipSessionsEnabled = data?.value === true;

  const isAdmin = auth?.role === "admin";

  return (
    <div className="space-y-6 p-4 md:p-6">
      <MentorshipClient
        isAdmin={isAdmin}
        mentorshipSessionsEnabled={mentorshipSessionsEnabled}
      />
    </div>
  );
}

// <div className="overflow-hidden rounded-xl border bg-card">
//   <div className="flex items-center gap-2 border-b px-4 py-3">
//     <span className="text-sm font-medium">Mentorship session</span>
//     <span className="ml-auto text-xs text-muted-foreground">
//       Powered by Zoom
//     </span>
//   </div>
//   <div className="relative w-full" style={{ height: "600px" }}>
//     <iframe
//       src="https://zoom.us/wc/join/85329765861?pwd=SGV8akFynM2HzS0EGgSwv4PLT8QXTy.1"
//       allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write; encrypted-media; picture-in-picture"
//       allowFullScreen
//       className="absolute inset-0 h-full w-full border-none"
//     />
//   </div>
// </div>
