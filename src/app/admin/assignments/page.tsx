"use client";

import dynamic from "next/dynamic";
import CenteredLoader from "@/src/components/ui/loading/centered-loader";

const AssignmentsClient = dynamic(
  () =>
    import("./_features/components/assignments-client").then((mod) => ({
      default: mod.AssignmentsClient,
    })),
  {
    ssr: false,
    loading: () => <CenteredLoader />,
  },
);

const Page = () => {
  return <AssignmentsClient />;
};

export default Page;
