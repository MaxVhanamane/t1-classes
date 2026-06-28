"use client";

import { Link } from "@/src/components/ui/link";
import { Button } from "@/src/components/ui/button";
import { BookX, LockKeyhole, ServerCrash, CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthClient } from "@/src/lib/auth/get-auth-client";

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
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getAuthClient();

        if (!user && (status === 401 || status === 403)) {
          setIsLoggedOut(true);

          // redirect after small delay
          setTimeout(() => {
            router.replace("/login");
          }, 1500);
        }
      } finally {
        setCheckingAuth(false);
      }
    }

    void checkAuth();
  }, [status, router]);

  //  Session expired UI
  if (!checkingAuth && isLoggedOut) {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center gap-6 text-center px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <LockKeyhole className="h-10 w-10 text-muted-foreground" />
        </div>

        <div className="space-y-2 max-w-md">
          <h1 className="text-xl font-semibold">Session expired</h1>
          <p className="text-sm text-muted-foreground">
            Your session has expired. Redirecting you to login...
          </p>
        </div>

        <Button asChild>
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    );
  }

  // default error UI
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
        <Button asChild>
          <Link href="/student/dashboard">My Learning</Link>
        </Button>
      </div>
    </div>
  );
}
