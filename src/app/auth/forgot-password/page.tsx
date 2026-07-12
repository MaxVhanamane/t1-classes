import { ShieldAlert, ArrowLeft } from "lucide-react";

import { StatusCard } from "@/src/components/ui/common/StatusCard";
import { Button } from "@/src/components/ui/button";
import { Link } from "@/src/components/ui/link";

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-x-hidden bg-background px-4">
      <div className="relative z-10 w-full max-w-md">
        <StatusCard
          fullscreen={false}
          title="Password Reset"
          description="For security reasons, automated password resets are disabled. Please contact your teacher or administrator to request a secure password reset link."
          icon={
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldAlert className="size-6" />
            </div>
          }
          footer={
            <div className="flex w-full pt-2">
              <Button asChild variant="outline" className="h-11 w-full">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="size-4" />
                  Back to login
                </Link>
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
}
