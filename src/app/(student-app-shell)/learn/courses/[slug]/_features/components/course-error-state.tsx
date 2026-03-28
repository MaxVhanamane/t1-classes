"use client";

import { Link } from "@/src/components/ui/link";
import { Button } from "@/src/components/ui/button";
import { BookX, LockKeyhole, ServerCrash, CircleAlert } from "lucide-react";

type Props = {
  status: number;
  message: string;
};

type ErrorConfig = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

function getErrorConfig(status: number, message: string): ErrorConfig {
  switch (status) {
    case 404:
      return {
        title: "Course not found",
        description: "This course doesn't exist or may have been removed.",
        icon: <BookX className="h-10 w-10 text-muted-foreground" />,
      };
    case 401:
    case 403:
      return {
        title: "Access denied",
        description:
          "You don't have access to this course. Please enroll to continue.",
        icon: <LockKeyhole className="h-10 w-10 text-muted-foreground" />,
      };
    case 500:
      return {
        title: "Something went wrong",
        description:
          "We're having trouble loading this course. Please try again.",
        icon: <ServerCrash className="h-10 w-10 text-muted-foreground" />,
      };
    default:
      return {
        title: "Something went wrong",
        description: message,
        icon: <CircleAlert className="h-10 w-10 text-muted-foreground" />,
      };
  }
}

export function CourseErrorState({ status, message }: Props) {
  const { title, description, icon } = getErrorConfig(status, message);

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center gap-6 text-center px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex gap-3">
        {status === 401 || status === 403 ? (
          <>
            <Button variant="outline" asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
            <Button asChild>
              <Link href="/student/dashboard">My Learning</Link>
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" asChild>
              <Link href="/student/dashboard">My Learning</Link>
            </Button>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
