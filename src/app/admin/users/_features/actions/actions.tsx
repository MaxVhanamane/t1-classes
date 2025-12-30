"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@/src/types/user";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { createAdminSupabaseClient } from "@/src/lib/supabase/admin.server";

export async function updateUserProfile(
  userId: string,
  data: {
    full_name?: string;
    phone?: string;
  }
) {
  const supabase = await createServerSupabaseClient();

  //  Guard: nothing to update
  if (!data.full_name && !data.phone) {
    return;
  }

  await supabase.from("users").update(data).eq("id", userId);

  revalidatePath("/admin/users");
}

export async function updateUserRole(
  userId: string,
  role: "student" | "teacher" | "admin"
) {
  const supabase = await createServerSupabaseClient();

  await supabase.from("users").update({ role }).eq("id", userId);

  revalidatePath("/admin/users");
}

export async function updateUserStatus(
  userId: string,
  status: "active" | "inactive" | "blocked"
) {
  const supabase = await createServerSupabaseClient();

  await supabase.from("users").update({ status }).eq("id", userId);

  revalidatePath("/admin/users");
}

export async function createUserAdmin(data: {
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
}) {
  //  Verify caller is admin
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: appUser } = await supabase
    .from("users")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!appUser || appUser.role !== "admin" || appUser.status !== "active") {
    throw new Error("Not authorized");
  }

  //  Invite user (THIS sends email)
  const adminSupabase = createAdminSupabaseClient();

  const { data: inviteData, error } =
    await adminSupabase.auth.admin.inviteUserByEmail(data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {
        full_name: data.full_name,
      },
    });

  if (error || !inviteData.user) {
    throw new Error(error?.message || "Failed to invite user");
  }

  const userId = inviteData.user.id;

  //  Update app-level user row
  await adminSupabase
    .from("users")
    .update({
      full_name: data.full_name,
      phone: data.phone ?? null,
      role: data.role,
      status: "active",
    })
    .eq("id", userId);

  revalidatePath("/admin/users");
}

export async function resendInvite(userId: string) {
  // 1 Verify admin
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: admin } = await supabase
    .from("users")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!admin || admin.role !== "admin" || admin.status !== "active") {
    throw new Error("Not authorized");
  }

  // 2 Get target user's email from auth
  const adminSupabase = createAdminSupabaseClient();

  const { data: authUser, error } = await adminSupabase.auth.admin.getUserById(
    userId
  );

  if (error || !authUser.user?.email) {
    throw new Error("User email not found");
  }

  // 3 Re-invite
  await adminSupabase.auth.admin.inviteUserByEmail(authUser.user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  });

  revalidatePath("/admin/users");
}
