
import { transporter } from "./smtp";

type SendEmailOptions = {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
};

export async function sendEmail({
    to,
    subject,
    html,
    text,
}: SendEmailOptions) {
    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html,
        text,
    });
}
