"use client";

import dynamic from "next/dynamic";

const SyllabusProgressClient = dynamic(
  () =>
    import("./_features/components/client-wrapper").then((mod) => ({
      default: mod.SyllabusProgressClient,
    })),
  {
    ssr: false,
  },
);

const Page = () => {
  return <SyllabusProgressClient />;
};

export default Page;
