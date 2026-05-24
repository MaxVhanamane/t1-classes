import { MentorshipPageHeader } from "./_features/components/mentorship-page-header";

import { MentorshipSessionsTable } from "./_features/components/mentorship-sessions-table";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";

import { getAuth } from "@/src/lib/auth/get-auth";

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
      <MentorshipPageHeader
        isAdmin={isAdmin}
        mentorshipSessionsEnabled={mentorshipSessionsEnabled}
      />

      <MentorshipSessionsTable />
    </div>
  );
}
