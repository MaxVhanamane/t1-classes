"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Button } from "@/src/components/ui/button";

import { detectVideoProvider } from "../../helper-functions/video-provider";
import {
  AddVideoFormInput,
  addVideoFormSchema,
} from "../../zod-schema/video.schema";
import { updateVideo } from "../../actions/topic/video/update-video";
import { toast } from "sonner";

interface Props {
  courseId: string;
  video: {
    id: string;
    title: string;
    description: string | null;
    content_url: string;
    duration_minutes: number | null;
    is_free_preview: boolean;
    video_provider: "youtube" | "vimeo";
  };
}

export function EditVideoDialog({ courseId, video }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<AddVideoFormInput>({
    resolver: zodResolver(addVideoFormSchema),
    mode: "onChange",
    defaultValues: {
      title: video.title,
      contentUrl: video.content_url,
      description: video.description ?? "",
      durationMinutes: video.duration_minutes
        ? String(video.duration_minutes)
        : "",
      isFreePreview: video.is_free_preview,
      videoProvider: video.video_provider ?? "vimeo",
    },
  });

  /** Watch fields */
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

  async function onSubmit(data: AddVideoFormInput) {
    if (submitting) return;

    if (!provider) {
      form.setError("contentUrl", {
        message: "Only YouTube or Vimeo links are supported",
      });
      return;
    }

    setSubmitting(true);

    try {
      await updateVideo(courseId, video.id, {
        ...data,
        videoProvider: provider,
      });

      toast.success("Video updated");
      handleOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenChange(value: boolean) {
    if (submitting) return;

    setOpen(value);

    if (!value) {
      form.reset({
        title: video.title,
        contentUrl: video.content_url,
        description: video.description ?? "",
        durationMinutes: video.duration_minutes
          ? String(video.duration_minutes)
          : "",
        isFreePreview: video.is_free_preview,
        videoProvider: video.video_provider ?? "vimeo",
      });
    }
  }

  return (
    <>
      {/* Trigger */}
      <Button
        variant="ghost"
        size="sm"
        className="justify-start cursor-pointer w-full"
        onClick={() => setOpen(true)}
      >
        Edit video
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
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
              <Textarea {...form.register("description")} rows={3} />
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
                  form.setValue("isFreePreview", v, { shouldDirty: true })
                }
              />
            </div>

            <Separator />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  submitting || !form.formState.isValid || urlStatus !== "valid"
                }
              >
                {submitting ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
