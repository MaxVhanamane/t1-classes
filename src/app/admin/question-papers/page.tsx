"use client";

import CenteredLoader from "@/src/components/ui/loading/centered-loader";
import dynamic from "next/dynamic";

const QuestionPapersPage = dynamic(
  () =>
    import("./_features/components/question-papers-page").then(
      (mod) => mod.QuestionPapersPage,
    ),
  {
    ssr: false,
    loading: () => <CenteredLoader />,
  },
);

export default function Page() {
  return <QuestionPapersPage />;
}
