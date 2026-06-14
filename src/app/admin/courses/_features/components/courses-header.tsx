"use client";

import { Button } from "@/src/components/ui/button";

type Props = {
  onCreate: () => void;
};

export function CoursesHeader({ onCreate }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Courses</h1>

        <p className="text-muted-foreground text-sm hidden md:block">
          Manage your courses and their details.
        </p>
      </div>

      <Button onClick={onCreate} className="cursor-pointer">
        Create Course
      </Button>
    </div>
  );
}
