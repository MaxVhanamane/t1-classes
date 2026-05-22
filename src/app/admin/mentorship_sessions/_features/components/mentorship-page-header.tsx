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

interface MentorshipPageHeaderProps {
  isAdmin: boolean;

  mentorshipSessionsEnabled: boolean;
}

export function MentorshipPageHeader({
  isAdmin,

  mentorshipSessionsEnabled,
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

        toast.error(error, {
          id: toastId,
        });

        return;
      }

      toast.success("Setting updated", {
        id: toastId,
      });
    } catch {
      setEnabled(!checked);

      toast.error("Failed to update setting", {
        id: toastId,
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Mentorship Sessions
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage mentorship and student guidance sessions.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <div className="flex items-center gap-3 rounded-lg border px-4 py-2">
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

          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 size-4" />
            Create Session
          </Button>
        </div>
      </div>

      <MentorshipSessionDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
