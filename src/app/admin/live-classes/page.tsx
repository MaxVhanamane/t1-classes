"use client";
import dynamic from "next/dynamic";

import CenteredLoader from "@/src/components/ui/loading/centered-loader";

const LiveClassesPageClient = dynamic(
  () =>
    import("./_features/components/live-classes-page-client").then(
      (mod) => mod.LiveClassesPageClient,
    ),
  {
    ssr: false,
    loading: () => <CenteredLoader />,
  },
);

export default function Page() {
  return <LiveClassesPageClient />;
}
