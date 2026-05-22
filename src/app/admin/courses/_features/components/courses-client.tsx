"use client";

import { useState } from "react";

import { CoursesTable } from "./courses-table";
import { Button } from "@/src/components/ui/button";
import { CourseDialog } from "./course-dialog";
import { CourseRow } from "../actions/get-courses";

interface CoursesClientProps {
  courses: CourseRow[];
}

export function CoursesClient({ courses }: CoursesClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseRow | null>(null);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Courses</h1>

        <Button
          onClick={() => {
            setSelectedCourse(null);
            setDialogOpen(true);
          }}
          className="cursor-pointer"
        >
          Create Course
        </Button>
      </div>

      <CoursesTable
        data={courses}
        onEdit={(course) => {
          setSelectedCourse(course);
          setDialogOpen(true);
        }}
      />
      {dialogOpen && (
        <CourseDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);

            if (!open) {
              setSelectedCourse(null);
            }
          }}
          course={selectedCourse}
        />
      )}
    </div>
  );
}
