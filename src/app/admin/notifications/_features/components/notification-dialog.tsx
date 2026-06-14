"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createNotification } from "../actions/create-notification";
import { updateNotification } from "../actions/update-notification";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import { toast } from "sonner";

import {
  notificationTypes,
  NotificationType,
} from "../types/notification.types";

import {
  NotificationFormValues,
  notificationSchema,
} from "../zod/notification.schema";

import { useQueryClient } from "@tanstack/react-query";

import { useBatchOptions } from "@/src/hooks/use-batch-options";

type NotificationRow = {
  id: string;
  title: string | null;
  message: string;
  type: NotificationType;
  batch_id: string | null;
};

type Props = {
  notification?: NotificationRow;
};

export function NotificationDialog({ notification }: Props) {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: batches = [] } = useBatchOptions();

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),

    defaultValues: {
      title: notification?.title ?? null,
      message: notification?.message ?? "",
      type: notification?.type ?? "announcement",

      // "" = no selection yet
      // "all" = all students
      // uuid = specific batch
      batch_id: notification?.batch_id ?? "",
    },
  });

  useEffect(() => {
    if (!open) {
      if (notification) {
        // edit mode

        form.reset({
          title: notification.title ?? null,
          message: notification.message,
          type: notification.type,
          batch_id: notification.batch_id ?? "",
        });
      } else {
        // create mode

        form.reset({
          title: null,
          message: "",
          type: "announcement",
          batch_id: "",
        });
      }
    }
  }, [open, notification, form]);

  async function onSubmit(values: NotificationFormValues) {
    try {
      const payload = {
        ...values,

        // convert UI state → DB state
        batch_id: values.batch_id === "all" ? null : values.batch_id || null,
      };

      if (notification) {
        await updateNotification(notification.id, payload);
      } else {
        await createNotification(payload);
      }

      await queryClient.invalidateQueries({
        queryKey: ["admin-notifications"],
      });

      toast.success(
        notification ? "Notification updated" : "Notification created",
      );

      setOpen(false);

      form.reset();
    } catch {
      toast.error("Failed to save notification");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{notification ? "Edit" : "Create Notification"}</Button>
      </DialogTrigger>

      <DialogContent className="space-y-6">
        <DialogHeader>
          <DialogTitle>
            {notification ? "Edit Notification" : "Create Notification"}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Title */}

          <div className="space-y-2">
            <Label>Title (optional)</Label>

            <Input
              placeholder="Example: Physics test tomorrow"
              {...form.register("title")}
            />
          </div>

          {/* Message */}

          <div className="space-y-2">
            <Label>Message *</Label>

            <Textarea
              placeholder="Write notification message"
              {...form.register("message")}
            />
          </div>

          {/* Type */}

          <div className="space-y-2">
            <Label>Type</Label>

            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value: NotificationType) =>
                    field.onChange(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {notificationTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Target */}

          <div className="space-y-2">
            <Label>Target</Label>

            <Controller
              control={form.control}
              name="batch_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select notification target" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Send To Everyone</SelectLabel>

                      <SelectItem value="all">All Students</SelectItem>
                    </SelectGroup>

                    {batches.length > 0 && (
                      <>
                        <SelectSeparator />

                        <SelectGroup>
                          <SelectLabel>Send To Batch</SelectLabel>

                          {batches.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.title}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving..." : "Save Notification"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
