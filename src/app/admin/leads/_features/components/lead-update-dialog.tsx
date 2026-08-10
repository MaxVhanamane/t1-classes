"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import { updateLead } from "../actions/update-lead";
import { LeadRow } from "../types/lead.types";
import {
  UpdateLeadInput,
  updateLeadSchema,
  leadStatusOptions,
} from "../zod-schema/leads.schema";

import { localDateTimeToUTCISO, toDateTimeLocal } from "@/src/lib/date";
import { callServerAction } from "@/src/lib/actions/call-server-action";

type LeadUpdateDialogProps = {
  lead?: LeadRow | null;
  onClose: () => void;
};

export function LeadUpdateDialog({ lead, onClose }: LeadUpdateDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<UpdateLeadInput>({
    resolver: zodResolver(updateLeadSchema),
    defaultValues: {
      status: "new",
      next_follow_up_at: "",
      lost_reason: "",
    },
  });

  // Reset form when the lead prop changes
  useEffect(() => {
    if (lead) {
      form.reset({
        status: lead.status,
        next_follow_up_at: lead.next_follow_up_at
          ? toDateTimeLocal(lead.next_follow_up_at)
          : "",
        lost_reason: lead.lost_reason ?? "",
      });
    }
  }, [lead, form]);

  const currentStatus = useWatch({ control: form.control, name: "status" });
  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = form.handleSubmit(
    async (values) => {
      if (!lead) return;

      const toastId = toast.loading("Updating lead...");

      try {
        const payload: UpdateLeadInput = {
          ...values,
          next_follow_up_at: values.next_follow_up_at
            ? localDateTimeToUTCISO(values.next_follow_up_at)
            : null,
        };

        const { error } = await callServerAction(updateLead(lead.id, payload));

        if (error) {
          toast.error(error, { id: toastId });
          return;
        }

        toast.success("Lead updated successfully", { id: toastId });

        await queryClient.invalidateQueries({
          queryKey: ["admin", "leads"],
        });

        onClose();
      } catch {
        toast.error("Something went wrong", { id: toastId });
      }
    },
    (errors) => {
      const firstError = Object.values(errors)[0];
      toast.error(firstError?.message ?? "Please fix form errors");
    },
  );

  if (!lead) return null;

  return (
    <Dialog
      open={!!lead}
      onOpenChange={(nextOpen) => {
        if (isSubmitting) return;
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-md max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>Update Lead: {lead.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          {/* STATUS */}
          <div className="space-y-2">
            <Label>Lead Status</Label>
            <Select
              value={currentStatus}
              onValueChange={(v) =>
                form.setValue("status", v as UpdateLeadInput["status"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {leadStatusOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* NEXT FOLLOW UP */}
          <div className="space-y-2">
            <Label>
              Next Follow-up Date & Time
              <span className="ml-1 text-muted-foreground">(optional)</span>
            </Label>
            <Input
              type="datetime-local"
              {...form.register("next_follow_up_at")}
            />
          </div>

          {/* LOST REASON - Only show if marked as Not Interested */}
          {currentStatus === "not_interested" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label>Reason for dropping</Label>
              <Textarea
                placeholder="Why did they decide not to enroll?"
                {...form.register("lost_reason")}
              />
              <p className="text-xs text-muted-foreground">
                This helps track objections and improve marketing.
              </p>
            </div>
          )}

          {currentStatus === "enrolled" && (
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-800 dark:text-emerald-300">
              Note: Marking a lead as enrolled here is for tracking. You still
              need to create their actual enrollment in the Enrollments tab if
              you haven&apos;t already.
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
