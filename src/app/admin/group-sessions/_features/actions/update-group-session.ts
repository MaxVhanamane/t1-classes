"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { requireStaffServerOnly } from "@/src/lib/auth/claims/require-role-server-only";
import { ServerActionResponse } from "@/src/types/server-action";

import {
  updateGroupSessionSchema,
  UpdateGroupSessionSchema,
} from "../zod/create-group-session.schema";

type UpdateGroupSessionInput = UpdateGroupSessionSchema & {
  meeting_id: string | null;
  meeting_pwd: string | null;
  meeting_passcode: string | null;
};

export async function updateGroupSession(
  sessionId: string,
  input: unknown,
): Promise<ServerActionResponse<void>> {
  /* ---------- Auth ---------- */
  const staff = await requireStaffServerOnly();

  try {
    /* ---------- Validate ---------- */
    // FIX: Use the UPDATE schema (allows past dates)
    const parsed = updateGroupSessionSchema.safeParse(input);

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Invalid session data",
      };
    }

    const values = input as UpdateGroupSessionInput;

    /* ---------- DB ---------- */
    const supabase = await createServerSupabaseClient();

    /* ---------- Existing Session ---------- */
    let query = supabase
      .from("group_sessions")
      .select(`
        id,
        batch_id
      `)
      .eq("id", sessionId);

    /* ---------- Teacher Scope ---------- */
    if (staff.role === "teacher") {
      query = query.eq("created_by", staff.userId);
    }

    const { data: existingSession, error: existingSessionError } =
      await query.single();

    if (existingSessionError || !existingSession) {
      return {
        error: "Group session not found",
      };
    }

    /* ---------- Batch Immutable ---------- */
    if (values.batch_id !== existingSession.batch_id) {
      return {
        error: "Batch cannot be changed after creation",
      };
    }

    /* ---------- Update Session ---------- */
    const { error: updateSessionError } = await supabase
      .from("group_sessions")
      .update({
        title: values.title,
        description: values.description || null,
        starts_at: values.starts_at.toISOString(),
        expected_duration_minutes: values.expected_duration_minutes,
        audience_type: values.audience_type,
        meeting_id: values.meeting_id,
        meeting_pwd: values.meeting_pwd,
        meeting_passcode: values.meeting_passcode,
      })
      .eq("id", sessionId);

    if (updateSessionError) {
      console.error("[UPDATE_GROUP_SESSION_ERROR]", updateSessionError);
      return {
        error: "Failed to update group session",
      };
    }

    /* ---------- Students ---------- */
    const { error: deleteStudentsError } = await supabase
      .from("group_session_students")
      .delete()
      .eq("session_id", sessionId);

    if (deleteStudentsError) {
      console.error("[DELETE_GROUP_STUDENTS_ERROR]", deleteStudentsError);
      return {
        error: "Failed to update students",
      };
    }

    /* ---------- Insert New ---------- */
    if (
      values.audience_type === "selected_students" &&
      values.student_ids.length > 0
    ) {
      const { error: insertStudentsError } = await supabase
        .from("group_session_students")
        .insert(
          values.student_ids.map((studentId) => ({
            session_id: sessionId,
            student_id: studentId,
          })),
        );

      if (insertStudentsError) {
        console.error("[INSERT_GROUP_STUDENTS_ERROR]", insertStudentsError);
        return {
          error: "Failed to update students",
        };
      }
    }

    return {
      data: undefined,
    };
  } catch (error) {
    console.error("[UPDATE_GROUP_SESSION_FATAL]", error);
    return {
      error: "Something went wrong. Please try again.",
    };
  }
}
