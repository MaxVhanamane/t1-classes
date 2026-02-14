"use client";

import Link from "next/link";
import { Button } from "@/src/components/ui/button";

type Props = {
  status: number;
  message: string;
};

export function CourseErrorState({ status, message }: Props) {
  let title = "Something went wrong";

  if (status === 404) title = "Course not found";
  if (status === 403) title = "Access denied";

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground max-w-md">{message}</p>

      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
