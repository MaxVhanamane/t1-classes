"use client";

import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import { ROUTES } from "@/src/lib/constants/route-constants";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/src/lib/supabase/supabase-client";
import { PUSH_STORAGE_KEY } from "@/src/hooks/student/notifications/use-register-push";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DottedBackground from "../dotted-background";

export function LogoutButton() {
  const supabase = createBrowserSupabaseClient();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      localStorage.removeItem(PUSH_STORAGE_KEY);

      queryClient.clear();

      toast.success("Logged out successfully");

      window.location.href = ROUTES.login;
    } catch {
      toast.error("Failed to log out");
      // Only reset loading on failure — on success we're navigating away
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start text-sm text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-inverse">
        <div className="absolute inset-0 -z-10">
          <DottedBackground className="opacity-40" />
        </div>
        <AlertDialogHeader>
          <AlertDialogTitle>Log out of your account?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to log out?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // keep dialog open until we know the outcome
              void handleLogout();
            }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging out...
              </>
            ) : (
              "Log out"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
