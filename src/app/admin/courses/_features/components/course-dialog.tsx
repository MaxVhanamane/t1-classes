"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Course, createCourse, updateCourse } from "../actions/actions";
import { createClient } from "@/src/lib/supabase/supabase-client";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

function parseNumber(value: string): number | undefined {
  if (value === "") return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
}

type FormType = {
  title: string;
  slug: string;
  description: string;
  thumbnail_image: string;
  course_type: CourseType;
  class_level: string;
  board: string;
  target_exam: string;
  subjects: string;
  price: string;
  is_active: boolean;
};
export type CourseType = "academic" | "foundation" | "exam" | "crash";
type ThumbnailUploadResult =
  | { status: "skipped"; url?: string }
  | { status: "success"; url: string; path: string }
  | { status: "error" };
/* ---------------- ZOD SCHEMA (DB-ALIGNED) ---------------- */

export const courseFormSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),

    course_type: z.enum(["academic", "foundation", "exam", "crash"]),

    description: z.string().optional(),

    price: z.number().min(1, "Price must be greater than 0"),

    class_level: z.number().optional(),
    board: z.string().optional(),

    target_exam: z.string().optional(),

    subjects: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.course_type === "academic" || data.course_type === "foundation") {
      if (data.class_level == null) {
        ctx.addIssue({
          path: ["class_level"],
          message: "Class level is required",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.board?.trim()) {
        ctx.addIssue({
          path: ["board"],
          message: "Board is required",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    if (data.course_type === "exam" || data.course_type === "crash") {
      if (!data.target_exam?.trim()) {
        ctx.addIssue({
          path: ["target_exam"],
          message: "Target exam is required",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

/* ---------------- COMPONENT ---------------- */

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course | null;
}

function extractPathFromPublicUrl(url: string): string {
  const parts = url.split("/course-thumbnails/");
  return parts[1];
}

export function CourseDialog({
  open,
  onOpenChange,
  course,
}: CourseDialogProps) {
  const isEdit = Boolean(course);
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const [form, setForm] = useState<FormType>({
    title: "",
    slug: "",
    description: "",
    thumbnail_image: "",
    course_type: "academic",
    class_level: "",
    board: "",
    target_exam: "",
    subjects: "",
    price: "",
    is_active: true,
  });

  async function deleteThumbnail(path?: string) {
    if (!path) return;

    const { error } = await supabase.storage
      .from("course-thumbnails")
      .remove([path]);

    if (error) {
      toast.error("Cleanup failed", {
        description: "Old thumbnail could not be removed.",
      });
    }
  }

  /* -------- Keep form in sync when editing / reopening -------- */

  useEffect(() => {
    setForm({
      title: course?.title ?? "",
      slug: course?.slug ?? "",
      description: course?.description ?? "",
      thumbnail_image: course?.thumbnail_image ?? "",
      course_type: course?.course_type ?? "academic",
      class_level: course?.class_level?.toString() ?? "",
      board: course?.board ?? "",
      target_exam: course?.target_exam ?? "",
      subjects: course?.subjects?.join(", ") ?? "",
      price: course?.price?.toString() ?? "",
      is_active: course?.is_active ?? true,
    });

    setThumbnailFile(null);
  }, [course, open]);

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /* ---------------- Thumbnail Upload ---------------- */

  async function uploadThumbnailIfNeeded(): Promise<ThumbnailUploadResult> {
    if (!thumbnailFile) {
      if (!form.thumbnail_image) {
        toast.info("No thumbnail selected", {
          description: "You can add a course thumbnail later from edit.",
        });
      }

      return {
        status: "skipped",
        url: form.thumbnail_image || undefined,
      };
    }

    /* Validation */
    if (!thumbnailFile.type.startsWith("image/")) {
      toast.error("Invalid file", {
        description: "Only image files are allowed.",
      });
      return { status: "error" };
    }

    const mimeToExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/avif": "avif",
    };

    const ext = mimeToExt[thumbnailFile.type];
    if (!ext) {
      toast.error("Unsupported format", {
        description: "Please upload JPG, PNG, WEBP, or AVIF images only.",
      });
      return { status: "error" };
    }

    const MAX_SIZE_MB = 1;
    if (thumbnailFile.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error("Image too large", {
        description: `Maximum allowed size is ${MAX_SIZE_MB}MB.`,
      });
      return { status: "error" };
    }

    /* Loading toast */
    const toastId = toast.loading("Uploading thumbnail...");

    try {
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const filePath = `courses/${fileName}`;

      const { error } = await supabase.storage
        .from("course-thumbnails")
        .upload(filePath, thumbnailFile, {
          contentType: thumbnailFile.type,
          upsert: false,
        });

      if (error) {
        toast.error("Upload failed", {
          id: toastId,
          description: "Could not upload thumbnail. Please try again.",
        });
        return { status: "error" };
      }

      const { data } = supabase.storage
        .from("course-thumbnails")
        .getPublicUrl(filePath);

      toast.success("Thumbnail uploaded", { id: toastId });

      return {
        status: "success",
        url: data.publicUrl,
        path: filePath,
      };
    } catch {
      toast.error("Upload failed", {
        id: toastId,
        description: "Unexpected error occurred.",
      });
      return { status: "error" };
    }
  }

  /* ---------------- Submit ---------------- */

  async function handleSubmit() {
    if (loading) return;
    setLoading(true);

    try {
      const parsedNumbers = {
        price: parseNumber(form.price),
        class_level: parseNumber(form.class_level),
      };

      const parsed = courseFormSchema.safeParse({
        title: form.title,
        description: form.description || undefined,
        course_type: form.course_type,
        price: parsedNumbers.price,
        class_level: parsedNumbers.class_level,
        board: form.board || undefined,
        target_exam: form.target_exam || undefined,
        subjects: form.subjects
          ? form.subjects
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
      });

      if (!parsed.success) {
        toast.error("Invalid input", {
          description: parsed.error.issues[0].message,
        });
        return;
      }

      const oldThumbnailUrl = course?.thumbnail_image;

      const thumbnailResult = await uploadThumbnailIfNeeded();

      if (thumbnailResult.status === "error") {
        return;
      }

      const payload = {
        title: form.title,
        description: form.description || undefined,
        thumbnail_image: thumbnailResult.url,
        course_type: form.course_type,
        class_level: parsedNumbers.class_level,
        board: form.board || undefined,
        target_exam: form.target_exam || undefined,
        subjects: parsed.data.subjects,
        price: parsedNumbers.price,
        is_active: form.is_active,
      };

      try {
        if (isEdit && course) {
          await updateCourse(course.id, payload);
        } else {
          await createCourse(payload);
        }
      } catch (err) {
        if (thumbnailResult.status === "success") {
          await deleteThumbnail(thumbnailResult.path);
        }
        throw err;
      }

      if (
        isEdit &&
        thumbnailResult.status === "success" &&
        oldThumbnailUrl &&
        oldThumbnailUrl !== thumbnailResult.url
      ) {
        const oldPath = extractPathFromPublicUrl(oldThumbnailUrl);
        await deleteThumbnail(oldPath);
      }

      toast.success(isEdit ? "Course updated" : "Course created");
      onOpenChange(false);
    } catch {
      toast.error(
        isEdit ? "Failed to update course" : "Failed to create course",
        {
          description: "Please try again.",
        }
      );
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Course" : "Create Course"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>

          {isEdit && (
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} disabled />
            </div>
          )}

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Thumbnail</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
            />
            {form.thumbnail_image && !thumbnailFile && (
              <p className="text-xs text-muted-foreground">
                Existing thumbnail will be kept
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Course Type</Label>
            <Select
              value={form.course_type}
              onValueChange={(v) => updateField("course_type", v as CourseType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="foundation">Foundation</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
                <SelectItem value="crash">Crash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(form.course_type === "academic" ||
            form.course_type === "foundation") && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Class Level</Label>
                <Input
                  type="number"
                  value={form.class_level}
                  onChange={(e) => updateField("class_level", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Board</Label>
                <Input
                  value={form.board}
                  onChange={(e) => updateField("board", e.target.value)}
                />
              </div>
            </div>
          )}

          {(form.course_type === "exam" || form.course_type === "crash") && (
            <div className="space-y-2">
              <Label>Target Exam</Label>
              <Input
                value={form.target_exam}
                onChange={(e) => updateField("target_exam", e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Subjects (comma separated)</Label>
            <Input
              value={form.subjects}
              onChange={(e) => updateField("subjects", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                min={0}
                step={1}
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between border rounded-lg p-3">
            <div>
              <Label>Active</Label>
              <p className="text-sm text-muted-foreground">
                Inactive courses cannot be enrolled
              </p>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => updateField("is_active", v)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            className="cursor-pointer"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Course"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
