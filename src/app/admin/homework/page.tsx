"use client";

import CenteredLoader from "@/src/components/ui/loading/centered-loader";
import dynamic from "next/dynamic";

const HomeworkChaptersPage = dynamic(
  () =>
    import("./_features/components/homework-chapters-page").then(
      (mod) => mod.HomeworkChaptersPage,
    ),
  {
    ssr: false,
    loading: () => <CenteredLoader />,
  },
);

export default function Page() {
  return <HomeworkChaptersPage />;
}
