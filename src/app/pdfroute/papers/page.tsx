"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PreviousYearPapersPage() {
  const router = useRouter();
  const [cls, setCls] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 flex items-center justify-center">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Previous Year Question Papers
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Select the class, subject, and year to view the question paper.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="space-y-5">
            <FormSelect label="Class" onChange={(e) => setCls(e.target.value)}>
              <option>10</option>
              <option>12</option>
            </FormSelect>

            <FormSelect
              label="Subject"
              onChange={(e) => setSubject(e.target.value)}
            >
              <option>Mathematics</option>
              <option>Physics</option>
              <option>Chemistry</option>
            </FormSelect>

            <FormSelect label="Year" onChange={(e) => setYear(e.target.value)}>
              <option>Select Year</option>
              <option>2023</option>
              <option>2022</option>
              <option>2021</option>
            </FormSelect>

            <button
              onClick={() => {
                if (!cls || !subject || !year) return;
                router.push(
                  `/student/papers/view?class=${cls}&subject=${subject}&year=${year}`
                );
              }}
              className="mt-4 w-full cursor-pointer rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              View Question Paper
            </button>
          </div>
        </div>

        {/* Helper Text */}
        <p className="mt-4 text-center text-xs text-gray-500">
          Papers are available for in-app viewing only.
        </p>
      </div>
    </div>
  );
}

/* ---------- Components ---------- */

function FormSelect({
  label,
  children,
  onChange,
}: {
  label: string;
  children: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        onChange={onChange}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
      >
        {children}
      </select>
    </div>
  );
}
