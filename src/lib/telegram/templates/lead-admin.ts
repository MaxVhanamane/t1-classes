type Props = {
    name: string;
    phone: string;
    email?: string | null;
    message?: string | null;
    course?: {
        title: string;
        price: number;
        course_type: string;
        class_level: number | null;
        target_exam: string | null;
    } | null;
    batch?: {
        name: string;
        price: number;
        mode: string;
        start_date: string | null;
        center_name: string | null;
    } | null;
};

export function leadTelegramTemplate({
    name,
    phone,
    email,
    message,
    course,
    batch,
}: Props) {
    const sections: string[] = [];

    /* Student Section */
    sections.push(`
<b>👤 Student Details</b>
<b>Name:</b> ${name}
<b>Phone:</b> <code>${phone}</code>
<b>Email:</b> ${email ?? "N/A"}
`.trim());

    /* Course Section */
    if (course) {
        sections.push(`
<b>📚 Course Details</b>
<b>Title:</b> ${course.title}
<b>Price:</b> ₹${course.price}
<b>Type:</b> ${capitalize(course.course_type)}
${course.class_level ? `<b>Class:</b> ${course.class_level}` : ""}
${course.target_exam ? `<b>Exam:</b> ${course.target_exam}` : ""}
`.trim());
    }

    /* Batch Section */
    if (batch) {
        sections.push(`
<b>🗓️ Batch Details</b>
<b>Name:</b> ${batch.name}
<b>Price:</b> ₹${batch.price}
<b>Mode:</b> ${capitalize(batch.mode)}
${batch.start_date ? `<b>Start Date:</b> ${formatDate(batch.start_date)}` : ""}
${batch.center_name ? `<b>Center:</b> ${batch.center_name}` : ""}
`.trim());
    }

    /* Message Section */
    if (message) {
        sections.push(`
<b>💬 Student Message</b>
<i>${escapeHtml(message)}</i>
`.trim());
    }

    return `
<b>🎓 New Enrollment Lead</b>
━━━━━━━━━━━━━━━━━━

${sections.join("\n\n")}

━━━━━━━━━━━━━━━━━━
<i>Submitted from website lead form</i>
`.trim();
}

/* Helpers */

function capitalize(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function escapeHtml(text: string) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
