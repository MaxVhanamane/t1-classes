type LeadAdminTemplateProps = {
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;

  course?: {
    title: string;
    price: number;
    category?: string | null;
    class_level?: number | null;
    target_exam?: string | null;
  } | null;

  batch?: {
    name: string;
    price: number;
    mode?: string | null;
    start_date?: string | null;
    center_name?: string | null;
  } | null;
};

export function leadAdminTemplate({
  name,
  phone,
  email,
  message,
  course,
  batch,
}: LeadAdminTemplateProps) {
  return `
  <div style="
    font-family: Arial, sans-serif;
    background:#f9fafb;
    padding:24px;
  ">

    <div style="
      max-width:560px;
      margin:auto;
      background:#ffffff;
      border-radius:12px;
      padding:24px;
      border:1px solid #e5e7eb;
    ">

      <h2 style="
        margin:0 0 16px;
        font-size:20px;
        color:#111827;
      ">
        New Enrollment Lead
      </h2>

      <table style="width:100%;border-collapse:collapse;font-size:14px">

        <tr>
          <td style="padding:8px 0;color:#6b7280">Name</td>
          <td style="padding:8px 0;font-weight:600">${name}</td>
        </tr>

        <tr>
          <td style="padding:8px 0;color:#6b7280">Phone</td>
          <td style="padding:8px 0;font-weight:600">${phone}</td>
        </tr>

        <tr>
          <td style="padding:8px 0;color:#6b7280">Email</td>
          <td style="padding:8px 0">
            ${email ?? "N/A"}
          </td>
        </tr>

      </table>

      ${course
      ? `
        <div style="margin-top:20px">
          <h3 style="margin-bottom:8px;font-size:15px">
            Course Details
          </h3>

          <p><strong>${course.title}</strong></p>
          <p>Price: ₹${course.price}</p>

          ${course.category
        ? `<p>Category: ${course.category}</p>`
        : ""
      }

          ${course.class_level
        ? `<p>Class: ${course.class_level}</p>`
        : ""
      }

          ${course.target_exam
        ? `<p>Exam: ${course.target_exam}</p>`
        : ""
      }
        </div>
      `
      : ""
    }

      ${batch
      ? `
        <div style="margin-top:20px">
          <h3 style="margin-bottom:8px;font-size:15px">
            Batch Details
          </h3>

          <p><strong>${batch.name}</strong></p>
          <p>Price: ₹${batch.price}</p>

          ${batch.mode
        ? `<p>Mode: ${batch.mode}</p>`
        : ""
      }

          ${batch.start_date
        ? `<p>Starts: ${batch.start_date}</p>`
        : ""
      }

          ${batch.center_name
        ? `<p>Center: ${batch.center_name}</p>`
        : ""
      }
        </div>
      `
      : ""
    }

      ${message
      ? `
        <div style="
          margin-top:20px;
          padding:12px;
          background:#f3f4f6;
          border-radius:8px;
        ">
          <strong>Student Message</strong>
          <p style="margin-top:6px">${message}</p>
        </div>
      `
      : ""
    }

      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb"/>

      <p style="font-size:12px;color:#6b7280">
        Manage this lead from the admin panel.
      </p>

    </div>
  </div>
  `;
}
