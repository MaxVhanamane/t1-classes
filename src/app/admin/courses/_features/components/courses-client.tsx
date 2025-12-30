"use client";

import { useState } from "react";

import { CoursesTable } from "./courses-table";
import { CourseDialog } from "./course-dialog";
import { Button } from "@/src/components/ui/button";
import { Course } from "../actions/actions";

interface CoursesClientProps {
  courses: Course[];
}

export function CoursesClient({ courses }: CoursesClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  return (
    <div className="space-y-6">
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

      <CourseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        course={selectedCourse}
      />
    </div>
  );
}
