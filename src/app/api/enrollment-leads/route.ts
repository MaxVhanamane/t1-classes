import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/supabase-server";
import { enrollmentLeadSchema } from "./zod/enrollment-lead.schema";
import { rateLimit } from "@/src/lib/security/rate-limit";
import { sendEmail } from "@/src/lib/email/send-email";
import { leadAdminTemplate } from "@/src/lib/email/templates/lead-admin";
import { leadTelegramTemplate } from "@/src/lib/telegram/templates/lead-admin";
import { sendTelegramMessage } from "@/src/lib/telegram/send-telegram";

export async function POST(req: Request) {
    try {
        /* Rate limit (5 requests per minute per IP) */

        const rl = await rateLimit(req, {
            limit: 5,
            windowMs: 60_000,
        });

        if (!rl.success) {
            return new NextResponse(
                JSON.stringify({
                    error:
                        "Too many requests. Please try again later.",
                }),
                {
                    status: 429,
                    headers: {
                        "Content-Type": "application/json",
                        "Retry-After": "60",
                    },
                }
            );
        }

        /* Parse body */

        const body = await req.json();

        /* Honeypot check */

        if (body.website) {
            return NextResponse.json(
                { error: "Spam detected" },
                { status: 400 }
            );
        }

        /* Turnstile verification */

        const token = body.captchaToken;

        if (!token) {
            return NextResponse.json(
                { error: "Captcha verification failed" },
                { status: 400 }
            );
        }

        const verifyRes = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    secret:
                        process.env.TURNSTILE_SECRET_KEY!,
                    response: token,
                }),
            }
        );

        const verifyData = await verifyRes.json();

        if (!verifyData.success) {
            return NextResponse.json(
                { error: "Captcha verification failed" },
                { status: 400 }
            );
        }

        /* Validate input */

        const parsed =
            enrollmentLeadSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid input" },
                { status: 400 }
            );
        }

        const data = parsed.data;

        /* Insert into database */

        const supabase =
            await createServerSupabaseClient();

        const { data: existing } = await supabase
            .from("enrollment_leads")
            .select("id")
            .eq("phone", data.phone)
            .or(
                `course_id.eq.${data.course_id},batch_id.eq.${data.batch_id}`
            )
            .limit(1);

        if (existing?.length) {
            return NextResponse.json(
                {
                    error:
                        "You have already submitted an inquiry. Our team will contact you shortly.",
                },
                { status: 409 }
            );
        }

        const { error } = await supabase
            .from("enrollment_leads")
            .insert({
                course_id: data.course_id ?? null,
                batch_id: data.batch_id ?? null,
                name: data.name,
                phone: data.phone,
                email: data.email ?? null,
                message: data.message ?? null,
            });

        if (error) {
            console.error(
                "Insert error:",
                error.message
            );
            return NextResponse.json(
                { error: "Failed to create lead" },
                { status: 500 }
            );
        }

        let courseInfo: { title: string, price: number, course_type: string, class_level: number, target_exam: string } | null = null;
        let batchInfo: { name: string, price: number, mode: string, start_date: string, center_name: string } | null = null;

        if (data.course_id) {
            const { data: course } = await supabase
                .from("courses")
                .select("title, price, course_type, class_level, target_exam")
                .eq("id", data.course_id)
                .single();

            courseInfo = course ?? null;
        }

        if (data.batch_id) {
            const { data: batch } = await supabase
                .from("batches")
                .select("name, price, mode, start_date, center_name")
                .eq("id", data.batch_id)
                .single();

            batchInfo = batch ?? null;
        }

        /* Send email notification to admins */

        try {
            await sendEmail({
                to: ["maxvhanamane@gmail.com"],
                subject: "New Enrollment Lead",
                html: leadAdminTemplate({
                    name: data.name,
                    phone: data.phone,
                    email: data.email,
                    message: data.message,
                    course: courseInfo,
                    batch: batchInfo,
                }),
            });

            /* Telegram */
            const telegramMessage = leadTelegramTemplate({
                name: data.name,
                phone: data.phone,
                email: data.email,
                message: data.message,
                course: courseInfo,
                batch: batchInfo,
            });

            await sendTelegramMessage(telegramMessage, data.phone);
        } catch (notifyError) {
            console.error("Notification error:", notifyError);
        }

        /* Success response */

        return NextResponse.json(
            { success: true },
            { status: 201 }
        );
    } catch (err) {
        console.error("API error:", err);

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
