"use client";

import dynamic from "next/dynamic";

const StudentProgressClient = dynamic(
  () =>
    import("./_features/components/client-wrapper").then((mod) => ({
      default: mod.StudentProgressClient,
    })),
  {
    ssr: false,
  },
);

const Page = () => {
  return <StudentProgressClient />;
};

export default Page;
