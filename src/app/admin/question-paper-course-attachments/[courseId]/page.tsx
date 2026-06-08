"use client";

import dynamic from "next/dynamic";

import CenteredLoader from "@/src/components/ui/loading/centered-loader";

import { useParams } from "next/navigation";

const CourseAttachmentPage = dynamic(
  () =>
    import("./_features/components/course-attanchment-page").then(
      (mod) => mod.CourseAttachmentPage,
    ),
  {
    ssr: false,
    loading: () => (
      <CenteredLoader message="Preparing attachment management..." />
    ),
  },
);

export default function Page() {
  const params = useParams<{
    courseId: string;
  }>();

  return <CourseAttachmentPage courseId={params.courseId} />;
}
