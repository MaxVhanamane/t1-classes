"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@/src/types/user";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { createAdminSupabaseClient } from "@/src/lib/supabase/supabase-admin";
import { getCurrentAdmin } from "@/src/lib/helper-functions/getCurrentAdmin";

export async function updateUserProfile(
  userId: string,
  data: {
    full_name?: string;
    phone?: string;
  },
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
  role: "student" | "teacher" | "admin",
) {
  const supabase = await createServerSupabaseClient();

  await supabase.from("users").update({ role }).eq("id", userId);

  revalidatePath("/admin/users");
}

export async function updateUserStatus(
  userId: string,
  status: "active" | "inactive" | "blocked",
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
  // 1 Verify caller is admin
  await getCurrentAdmin();

  const adminSupabase = await createAdminSupabaseClient();

  // 2 Normalize email
  const email = data.email.trim().toLowerCase();

  // 3 Check if user already exists in app DB
  const { data: existingUser, error: existingError } = await adminSupabase
    .from("users")
    .select("id, status")
    .eq("email", email)
    .maybeSingle();

  if (existingError) {
    throw new Error("Failed to check existing user");
  }

  if (existingUser) {
    if (existingUser.status === "active") {
      throw new Error("User with this email already exists");
    }

    if (existingUser.status === "invited") {
      throw new Error("User has already been invited");
      // later you can add: resend invite logic
    }

    throw new Error("User already exists");
  }

  // 4 Safe redirect construction
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
  if (!SITE_URL) {
    throw new Error("NEXT_PUBLIC_SITE_URL is not set");
  }

  const redirectTo = new URL("/auth/callback", SITE_URL).toString();

  // 5 Send invite
  const { data: inviteData, error } =
    await adminSupabase.auth.admin.inviteUserByEmail(email, {
      redirectTo,
    });

  if (error || !inviteData.user) {
    throw new Error(error?.message || "Failed to invite user");
  }

  const userId = inviteData.user.id;

  // 6 Create / update app-level user row
  await adminSupabase
    .from("users")
    .update({
      email,
      full_name: data.full_name,
      phone: data.phone ?? null,
      role: data.role,
      status: "invited",
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
  const adminSupabase = await createAdminSupabaseClient();

  const { data: authUser, error } =
    await adminSupabase.auth.admin.getUserById(userId);

  if (error || !authUser.user?.email) {
    throw new Error("User email not found");
  }

  // 3 Re-invite
  await adminSupabase.auth.admin.inviteUserByEmail(authUser.user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  });

  revalidatePath("/admin/users");
}
