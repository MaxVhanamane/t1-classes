"use client";

import CenteredLoader from "@/src/components/ui/loading/centered-loader";
import dynamic from "next/dynamic";

const CoursesClient = dynamic(
  () =>
    import("./_features/components/courses-client").then(
      (mod) => mod.CoursesClient,
    ),
  {
    ssr: false,
    loading: () => <CenteredLoader />,
  },
);

export default function CoursesPage() {
  return (
    <div className="space-y-6 p-4 md:p-6 mb-10">
      <CoursesClient />
    </div>
  );
}
