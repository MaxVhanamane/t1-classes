import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// We can define a lighter type just for the export data
export interface ExportResultRow {
    student_name: string;
    rank: number | null;
    obtained_marks: number;
    total_marks: number;
    correct_count: number;
    partial_correct_count: number; // Added
    wrong_count: number;
    unanswered_count: number;
    performance_label: string | null;
}

export function exportResultsToPDF(
    testTitle: string,
    batchName: string | undefined = "Batch Report",
    data: ExportResultRow[]
) {
    const doc = new jsPDF("p", "mm", "a4");

    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text(testTitle, 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    const date = new Intl.DateTimeFormat("en-US", {
        month: "short", day: "numeric", year: "numeric",
    }).format(new Date());

    doc.text(`${batchName} • Generated on ${date}`, 14, 30);

    // Updated Column Headers to include "P" (Partial)
    const tableColumn = [
        "Rank",
        "Student Name",
        "Score",
        "Percentage",
        "C / P / W / U", // Correct / Partial / Wrong / Unanswered
        "Remark"
    ];

    const tableRows = data.map((row) => {
        const percentage = row.total_marks > 0
            ? ((row.obtained_marks / row.total_marks) * 100).toFixed(1) + "%"
            : "0%";

        // Included partial_correct_count
        const breakdown = `${row.correct_count} / ${row.partial_correct_count} / ${row.wrong_count} / ${row.unanswered_count}`;

        return [
            row.rank ? `#${row.rank}` : "—",
            row.student_name,
            `${row.obtained_marks} / ${row.total_marks}`,
            percentage,
            breakdown,
            row.performance_label || "—"
        ];
    });

    autoTable(doc, {
        startY: 38,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: "bold" },
        styles: { fontSize: 9, cellPadding: 4 }, // Slightly smaller font to fit extra column
        alternateRowStyles: { fillColor: [250, 250, 250] },
        columnStyles: {
            0: { fontStyle: "bold", halign: "center" },
            2: { halign: "center" },
            3: { fontStyle: "bold", halign: "center" },
            4: { halign: "center" },
        },
    });

    const safeTitle = testTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`${safeTitle}_results_${date.replace(/ /g, "_")}.pdf`);
}
