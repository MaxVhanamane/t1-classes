"use client";

import dynamic from "next/dynamic";

import CenteredLoader from "@/src/components/ui/loading/centered-loader";

const QuestionBuilderClient = dynamic(
  () =>
    import("./_features/components/question-builder-client").then(
      (mod) => mod.QuestionBuilderClient,
    ),
  {
    ssr: false,
    loading: () => <CenteredLoader />,
  },
);

export default function SectionBuilderPage() {
  return <QuestionBuilderClient />;
}
