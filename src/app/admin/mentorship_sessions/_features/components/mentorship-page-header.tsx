"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/src/components/ui/button";
import { Switch } from "@/src/components/ui/switch";
import { Label } from "@/src/components/ui/label";

import { toggleMentorshipSessions } from "../actions/toggle-mentorship-sessions";
import { callServerAction } from "@/src/lib/actions/call-server-action";
import { MentorshipSessionDialog } from "./mentorship-session-dialog";
import { QueryKey } from "@tanstack/react-query";
import { RefreshButton } from "@/src/components/ui/common/refresh-button";

interface MentorshipPageHeaderProps {
  isAdmin: boolean;
  mentorshipSessionsEnabled: boolean;
  isFetching: boolean;
  queryKey: QueryKey;
}

export function MentorshipPageHeader({
  isAdmin,
  mentorshipSessionsEnabled,
  isFetching,
  queryKey,
}: MentorshipPageHeaderProps) {
  const [enabled, setEnabled] = useState(mentorshipSessionsEnabled);
  const [isPending, setIsPending] = useState(false);
  const [open, setOpen] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setIsPending(true);
    const toastId = toast.loading("Updating setting...");

    try {
      setEnabled(checked);
      const { error } = await callServerAction(
        toggleMentorshipSessions(checked),
      );

      if (error) {
        setEnabled(!checked);
        toast.error(error, { id: toastId });
        return;
      }

      toast.success("Setting updated", { id: toastId });
    } catch {
      setEnabled(!checked);
      toast.error("Failed to update setting", { id: toastId });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Mentorship Sessions
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage mentorship and student guidance sessions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {isAdmin && (
            <div className="flex w-full sm:w-auto items-center justify-between gap-4 rounded-lg border px-4 py-2">
              <div className="space-y-0.5">
                <Label>Session Creation</Label>
                <p className="text-xs text-muted-foreground">
                  Allow teachers to create new sessions
                </p>
              </div>

              <Switch
                checked={enabled}
                disabled={isPending}
                onCheckedChange={handleToggle}
              />
            </div>
          )}

          <RefreshButton queryKey={queryKey} isFetching={isFetching} />

          <Button
            onClick={() => setOpen(true)}
            className="ml-auto shrink-0 sm:ml-0"
          >
            <Plus className="mr-2 size-4" />
            Create Session
          </Button>
        </div>
      </div>

      <MentorshipSessionDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
