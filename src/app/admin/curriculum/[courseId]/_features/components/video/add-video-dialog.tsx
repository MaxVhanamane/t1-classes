"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Separator } from "@/src/components/ui/separator";
import { Textarea } from "@/src/components/ui/textarea";
import { Switch } from "@/src/components/ui/switch";

import { detectVideoProvider } from "../../helper-functions/video-provider";
import {
  AddVideoFormInput,
  addVideoFormSchema,
} from "../../zod-schema/video.schema";
import { Loader2, Video } from "lucide-react";
import { createVideo } from "../../actions/topic/video/create-video";
import { toast } from "sonner";
import { callServerAction } from "@/src/lib/actions/call-server-action";

interface Props {
  topicId: string;
  courseId: string;
}
export function AddVideoDialog({ topicId, courseId }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<AddVideoFormInput>({
    resolver: zodResolver(addVideoFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      contentUrl: "",
      description: "",
      durationMinutes: "",
      isFreePreview: false,
      videoProvider: "vimeo",
    },
  });

  /** Watch fields safely */
  const contentUrl = useWatch({
    control: form.control,
    name: "contentUrl",
  });

  const isFreePreview = useWatch({
    control: form.control,
    name: "isFreePreview",
  });

  /** Detect provider */
  const provider = useMemo(() => {
    if (!contentUrl) return null;
    return detectVideoProvider(contentUrl);
  }, [contentUrl]);

  /** URL status */
  const urlStatus = useMemo<"idle" | "error" | "unsupported" | "valid">(() => {
    if (!contentUrl) return "idle";
    if (form.formState.errors.contentUrl) return "error";
    if (!provider) return "unsupported";
    return "valid";
  }, [contentUrl, provider, form.formState.errors.contentUrl]);

  /** Submit */
  async function onSubmit(data: AddVideoFormInput) {
    if (submitting) return;

    if (!provider) {
      form.setError("contentUrl", {
        message: "Only YouTube or Vimeo links are supported",
      });
      return;
    }

    setSubmitting(true);

    const { error } = await callServerAction(
      createVideo(courseId, topicId, {
        ...data,
        videoProvider: provider,
      }),
    );

    if (error) {
      toast.error(error);
    } else {
      toast.success("Video added", {
        description: "Video has been added as a draft.",
      });

      setOpen(false);
      form.reset();
    }

    setSubmitting(false);
  }

  /** Reset form when dialog closes (block during submit) */
  function handleOpenChange(value: boolean) {
    if (submitting) return;

    setOpen(value);
    if (!value) {
      form.reset();
    }
  }

  return (
    <>
      {/* Trigger */}
      <Button
        className="cursor-pointer"
        onClick={() => setOpen(true)}
        disabled={submitting}
      >
        <Video className="mr-2 h-4 w-4" />
        Add Video
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Video</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label>Title</Label>
              <Input {...form.register("title")} />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                {...form.register("description")}
                rows={3}
                placeholder="Optional notes about this video"
              />
            </div>

            {/* Video URL */}
            <div className="space-y-2">
              <Label>Video URL</Label>
              <Input {...form.register("contentUrl")} />

              <p
                className={`min-h-4 text-xs ${
                  urlStatus === "error"
                    ? "text-destructive"
                    : urlStatus === "valid"
                      ? "text-green-600"
                      : "text-muted-foreground"
                }`}
              >
                {urlStatus === "error" &&
                  form.formState.errors.contentUrl?.message}
                {urlStatus === "unsupported" &&
                  "Only YouTube or Vimeo links are supported"}
                {urlStatus === "valid" && `Detected provider: ${provider}`}
              </p>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="e.g. 12"
                {...form.register("durationMinutes")}
              />
            </div>

            {/* Free preview */}
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Free preview</p>
                <p className="text-xs text-muted-foreground">
                  Allow students to watch this video before enrolling
                </p>
              </div>
              <Switch
                checked={isFreePreview}
                onCheckedChange={(v) =>
                  form.setValue("isFreePreview", v, {
                    shouldDirty: true,
                  })
                }
              />
            </div>

            <Separator />

            <DialogFooter>
              <Button
                className="cursor-pointer"
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>

              <Button
                className="cursor-pointer"
                type="submit"
                disabled={
                  submitting || !form.formState.isValid || urlStatus !== "valid"
                }
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding…
                  </>
                ) : (
                  "Add Video"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
