"use client";

import CenteredLoader from "@/src/components/ui/loading/centered-loader";
import dynamic from "next/dynamic";

const ChapterMaterialsPage = dynamic(
  () =>
    import("./_features/components/homework-materials-page").then(
      (mod) => mod.ChapterMaterialsPage,
    ),
  {
    ssr: false,
    loading: () => <CenteredLoader />,
  },
);

export default function Page() {
  return <ChapterMaterialsPage />;
}
