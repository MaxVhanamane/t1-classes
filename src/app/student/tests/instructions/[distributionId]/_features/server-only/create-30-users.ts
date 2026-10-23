"use server";

import { createServiceRoleSupabaseClient } from "@/src/lib/supabase/supabase-service-role";

const BATCH_ID = "73126474-224a-4602-9bfd-106103452134";
const ADMIN_ID = "cffad724-60dd-4377-a4de-a68ca4257aca";

// Clean array containing only 51 to 80
const names = [
    "Fifty One", "Fifty Two", "Fifty Three", "Fifty Four", "Fifty Five",
    "Fifty Six", "Fifty Seven", "Fifty Eight", "Fifty Nine", "Sixty",
    "Sixty One", "Sixty Two", "Sixty Three", "Sixty Four", "Sixty Five",
    "Sixty Six", "Sixty Seven", "Sixty Eight", "Sixty Nine", "Seventy",
    "Seventy One", "Seventy Two", "Seventy Three", "Seventy Four", "Seventy Five",
    "Seventy Six", "Seventy Seven", "Seventy Eight", "Seventy Nine", "Eighty"
];

export async function seed30Students() {
    const supabase = await createServiceRoleSupabaseClient();

    const accessStartsAt = new Date();
    accessStartsAt.setDate(accessStartsAt.getDate() - 1);

    const accessEndsAt = new Date(accessStartsAt);
    accessEndsAt.setMonth(accessEndsAt.getMonth() + 6);

    const { data: latestEnrollment } = await supabase
        .from("enrollments")
        .select("roll_number")
        .eq("batch_id", BATCH_ID)
        .order("roll_number", { ascending: false })
        .limit(1)
        .maybeSingle();

    let nextRollNumber = (latestEnrollment?.roll_number ?? 0) + 1;

    // Loop strictly for user51 -> user80
    for (let i = 51; i <= 80; i++) {
        try {
            const email = `user${i}@gmail.com`;
            const password = `user${i}@${i}`;
            // Mapped correctly: 51 - 51 = index 0 ("Fifty One")
            const full_name = `User ${names[i - 51]}`;

            let userId: string;

            const { data: existingUser, error: userLookupError } =
                await supabase
                    .from("users")
                    .select("id")
                    .eq("email", email)
                    .maybeSingle();

            if (userLookupError) {
                console.error(`Lookup failed: ${email}`, userLookupError);
                continue;
            }

            if (existingUser) {
                userId = existingUser.id;
            } else {
                const { data, error } =
                    await supabase.auth.admin.createUser({
                        email,
                        password,
                        email_confirm: true,
                    });

                if (error || !data?.user) {
                    console.error(`Create failed: ${email}`, error);
                    continue;
                }

                userId = data.user.id;

                // Give trigger a moment to create public.users row
                await new Promise((resolve) =>
                    setTimeout(resolve, 250)
                );
            }

            const { error: profileError } = await supabase
                .from("users")
                .update({
                    full_name,
                    role: "student",
                    status: "active",
                    guardian_phone: "9999999999",
                })
                .eq("id", userId);

            if (profileError) {
                console.error(
                    `Profile update failed: ${email}`,
                    profileError
                );
                continue;
            }

            const { data: existingEnrollment } =
                await supabase
                    .from("enrollments")
                    .select("id")
                    .eq("user_id", userId)
                    .eq("target_type", "batch")
                    .eq("batch_id", BATCH_ID)
                    .maybeSingle();

            if (!existingEnrollment) {
                const { error: enrollmentError } =
                    await supabase
                        .from("enrollments")
                        .insert({
                            user_id: userId,
                            batch_id: BATCH_ID,
                            target_type: "batch",
                            enrollment_type: "standard",
                            registration_channel: "offline",
                            is_active: true,
                            access_starts_at:
                                accessStartsAt.toISOString(),
                            access_ends_at:
                                accessEndsAt.toISOString(),
                            created_by: ADMIN_ID,
                            updated_by: ADMIN_ID,
                            roll_number: nextRollNumber++,
                            notes: "",
                        });

                if (enrollmentError) {
                    console.error(
                        `Enrollment failed: ${email}`,
                        enrollmentError
                    );
                    continue;
                }
            }

        } catch (error) {
            console.error(`Unexpected error for user${i}`, error);
        }
    }

}
