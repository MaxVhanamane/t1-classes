import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ExportResultRow {
    student_name: string;
    rank: number | null;
    obtained_marks: number;
    total_marks: number;
    correct_count: number;
    partial_correct_count: number;
    wrong_count: number;
    unanswered_count: number;
    performance_label: string | null;
    batch_title: string | null;
    subjects: string | null;
}

// Helper to safely truncate long strings for the PDF
const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength - 3) + "..." : text;
};

export function exportResultsToPDF(
    testTitle: string,
    batchName: string | undefined = "Batch Report",
    data: ExportResultRow[]
) {
    const doc = new jsPDF("p", "mm", "a4");

    // Title (Truncated to 70 chars so it doesn't run off the page)
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text(truncateText(testTitle, 70), 14, 22);

    // Subtitle (Dynamic Batch & Subjects + Date)
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    const date = new Intl.DateTimeFormat("en-US", {
        month: "short", day: "numeric", year: "numeric",
    }).format(new Date());

    // Extract dynamic context and safely truncate
    const rawBatchName = data.length > 0 && data[0].batch_title ? data[0].batch_title : batchName;
    const actualBatchName = truncateText(rawBatchName || "Batch Report", 40);

    let testSubjects = "";
    if (data.length > 0 && data[0].subjects) {
        const subjectArray = data[0].subjects.split(",").map((s) => s.trim());
        const formattedSubjects = subjectArray
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
            .join(", ");

        // Truncate subjects if there are too many
        const safeSubjects = truncateText(formattedSubjects, 35);
        const subjectLabel = subjectArray.length > 1 ? "Subjects" : "Subject";
        testSubjects = ` | ${subjectLabel}: ${safeSubjects}`;
    }

    doc.text(`${actualBatchName}${testSubjects} • Generated on ${date}`, 14, 30);

    // Breakdown Legend 
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(148, 163, 184);
    doc.text("Breakdown: C = Correct / W = Wrong / P = Partial / U = Unattempted", 14, 35);

    // Reset font style for table
    doc.setFont("helvetica", "normal");

    // Column Headers 
    const tableColumn = [
        "Rank",
        "Student Name",
        "Score",
        "Percentage",
        "C / W / P / U",
        "Remark"
    ];

    const tableRows = data.map((row) => {
        const percentage = row.total_marks > 0
            ? ((row.obtained_marks / row.total_marks) * 100).toFixed(1) + "%"
            : "0%";

        const breakdown = `${row.correct_count} / ${row.wrong_count} / ${row.partial_correct_count} / ${row.unanswered_count}`;

        let formattedLabel = "—";
        if (row.performance_label) {
            formattedLabel = row.performance_label
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        }

        return [
            row.rank ? `#${row.rank}` : "—",
            row.student_name,
            `${row.obtained_marks} / ${row.total_marks}`,
            percentage,
            breakdown,
            formattedLabel
        ];
    });

    autoTable(doc, {
        startY: 40,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: "bold" },
        styles: { fontSize: 9, cellPadding: 4 },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        columnStyles: {
            0: { fontStyle: "bold", halign: "center" },
            2: { halign: "center" },
            3: { fontStyle: "bold", halign: "center" },
            4: { halign: "center" },
        },
    });

    const safeTitle = truncateText(testTitle, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`${safeTitle}_results_${date.replace(/ /g, "_")}.pdf`);
}
