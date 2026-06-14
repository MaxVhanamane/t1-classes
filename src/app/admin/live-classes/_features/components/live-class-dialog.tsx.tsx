"use client";

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";

import {
  createLiveClassSchema,
  CreateLiveClassInput,
} from "../zod/create-live-class.schema";

import { createLiveClass } from "../actions/create-live-class";
import { updateLiveClass } from "../actions/update-live-class";

import { BatchMultiSelect } from "./batch-multi-select";
import { extractFirstErrorMessage } from "@/src/lib/form/extract-first-error-message";
import { callServerAction } from "@/src/lib/actions/call-server-action";
import { useBatchOptions } from "@/src/hooks/use-batch-options";

interface EditValue {
  id: string;
  title: string;
  description: string | null;
  youtube_live_id: string;
  starts_at: string;
  ends_at: string;
  batch_ids: string[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  liveClass?: EditValue;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toInputDateTime(value: string): string {
  const date = new Date(value);

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toUtcIso(value: string): string {
  const [datePart, timePart] = value.split("T");

  const [year, month, day] = datePart.split("-").map(Number);

  const [hour, minute] = timePart.split(":").map(Number);

  const localDate = new Date(year, month - 1, day, hour, minute, 0, 0);

  return localDate.toISOString();
}

function extractYoutubeId(value: string): string {
  const input = value.trim();

  if (!input) {
    return "";
  }

  if (!input.includes("http") && !input.includes("/")) {
    return input;
  }

  try {
    const url = new URL(input);

    const host = url.hostname.replace("www.", "");

    if (host === "youtube.com" && url.pathname.startsWith("/live/")) {
      return url.pathname.replace("/live/", "").split("/")[0];
    }

    if (host === "youtube.com") {
      const id = url.searchParams.get("v");

      if (id) {
        return id;
      }
    }

    if (host === "youtu.be") {
      return url.pathname.replace("/", "").split("/")[0];
    }

    return input;
  } catch {
    return input;
  }
}

export function LiveClassDialog({ open, onOpenChange, liveClass }: Props) {
  const isEditMode = Boolean(liveClass);

  const queryClient = useQueryClient();

  const { data: batches = [], isLoading: loadingBatches } = useBatchOptions();

  const form = useForm<CreateLiveClassInput>({
    resolver: zodResolver(createLiveClassSchema),

    defaultValues: {
      title: "",
      batch_ids: [],
      starts_at: "",
      ends_at: "",
      youtube_live_id: "",
      description: "",
    },
  });

  const batchIds = useWatch({
    control: form.control,
    name: "batch_ids",
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (liveClass) {
      form.reset({
        title: liveClass.title,
        batch_ids: liveClass.batch_ids,
        starts_at: toInputDateTime(liveClass.starts_at),
        ends_at: toInputDateTime(liveClass.ends_at),
        youtube_live_id: liveClass.youtube_live_id,
        description: liveClass.description ?? "",
      });

      return;
    }

    form.reset({
      title: "",
      batch_ids: [],
      starts_at: "",
      ends_at: "",
      youtube_live_id: "",
      description: "",
    });
  }, [open, liveClass, form]);

  const mutation = useMutation({
    mutationFn: async (values: CreateLiveClassInput) => {
      const payload = {
        ...values,
        starts_at: toUtcIso(values.starts_at),
        ends_at: toUtcIso(values.ends_at),
      };

      if (liveClass) {
        return callServerAction(updateLiveClass(liveClass.id, payload));
      }

      return callServerAction(createLiveClass(payload));
    },
  });

  const onSubmit = form.handleSubmit(
    async (values) => {
      const toastId = toast.loading(
        isEditMode ? "Updating live class..." : "Creating live class...",
      );

      try {
        const { error } = await mutation.mutateAsync(values);

        if (error) {
          toast.error(error, { id: toastId });
          return;
        }

        await queryClient.invalidateQueries({
          queryKey: ["live-classes"],
        });

        toast.success(
          isEditMode ? "Live class updated" : "Live class created",
          { id: toastId },
        );

        form.reset();
        onOpenChange(false);
      } catch {
        toast.error("Save failed", { id: toastId });
      }
    },

    (errors) => {
      const message = extractFirstErrorMessage(errors);

      toast.dismiss();
      toast.error(message ?? "Please fix the form errors");
    },
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          form.reset();
        }

        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-lg bg-card"
      >
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Live Class" : "Create Live Class"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>

            <Input {...form.register("title")} />
          </div>

          <div className="space-y-2">
            <Label>Batches</Label>

            <BatchMultiSelect
              disabled={loadingBatches}
              batches={batches}
              value={batchIds}
              onChange={(value) =>
                form.setValue("batch_ids", value, {
                  shouldValidate: true,
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Starts At</Label>

              <Input type="datetime-local" {...form.register("starts_at")} />
            </div>

            <div className="space-y-2">
              <Label>Ends At</Label>

              <Input type="datetime-local" {...form.register("ends_at")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>YouTube Live Link / ID</Label>

            <Input
              placeholder="Paste YouTube live link or ID"
              {...form.register("youtube_live_id", {
                onBlur: (e) => {
                  const clean = extractYoutubeId(e.target.value);

                  form.setValue("youtube_live_id", clean, {
                    shouldValidate: true,
                  });
                },
              })}
            />

            <p className="text-xs text-muted-foreground">
              If you paste a YouTube link, the video ID will be extracted
              automatically.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>

            <Textarea rows={4} {...form.register("description")} />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={mutation.isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              {isEditMode ? "Update Live Class" : "Create Live Class"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
