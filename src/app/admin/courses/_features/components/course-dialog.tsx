"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/src/components/ui/command";
import { Badge } from "@/src/components/ui/badge";
import { ChevronsUpDown } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import { courseSchema, CourseFormValues } from "../zod/course.schema";

import {
  CourseRow,
  createCourse,
  updateCourse,
  updateCourseThumbnail,
} from "../actions/courses.actions";

import { useR2Upload } from "@/src/hooks/use-r2-upload";
import { TipTapEditor } from "./tiptap-editor";
import { Switch } from "@/src/components/ui/switch";
import { RemoveButton } from "./remove-button";
import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
  SIZE_LIMITS,
} from "@/src/lib/constants/upload.constants";
import { formatFileSize } from "@/src/lib/helper-functions/format-file-size";
import { IMAGE_OUTPUTS } from "@/src/lib/constants/image-output.config";
import { validateImage } from "@/src/lib/helper-functions/validate-image";
import { ImageCropper } from "@/src/components/ui/media/ImageCropper";
import { R2_BUCKET_PUBLIC_URL } from "@/src/lib/constants/config";
import { MARKETING_LIMITS } from "@/src/lib/constants/marketing-limits";
import { useQuery } from "@tanstack/react-query";
import { InstructorOption } from "../types/course.types";
import { extractFirstErrorMessage } from "../../../batches/_features/components/batch-dialog";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  BOARDS,
  BOARD_LABELS,
  SUBJECTS,
  LANGUAGES,
  LANGUAGE_LABELS,
  TARGET_EXAM_LABELS,
  CATEGORY_TARGET_EXAMS,
} from "../../../batches/_features/zod-schema/schema";
import { Label } from "@/src/components/ui/label";
import { Separator } from "@/src/components/ui/separator";

/* -------------------------------------------------- */

type Props = {
  course?: CourseRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
const THUMBNAIL_MAX_SIZE = SIZE_LIMITS.course_thumbnail;

/* -------------------------------------------------- */
/* Mapper                                             */
/* -------------------------------------------------- */

function mapRowToForm(course: CourseRow): CourseFormValues {
  return {
    title: course.title,
    subtitle: course.subtitle ?? "",
    description: course.description ?? null,
    thumbnail_image: course.thumbnail_image ?? undefined,

    /* ---------- Category ---------- */
    category: course.category,
    board: course.board ?? null,

    /* ---------- Academic ---------- */
    class_level: course.class_level ?? null,
    target_exam: course.target_exam ?? null,

    subjects: course.subjects?.length
      ? course.subjects.map((v) => ({ value: v }))
      : [],

    /* ---------- Pricing ---------- */
    list_price: course.list_price,
    sale_price: course.sale_price,

    /* ---------- Languages ---------- */
    languages: course.languages ?? [],

    /* ---------- Instructors ---------- */
    instructor_ids: course.instructors?.map((i) => i.id) ?? [],

    /* ---------- Status ---------- */
    is_active: course.is_active,

    /* ---------- Marketing ---------- */
    learning_outcomes:
      course.learning_outcomes?.map((v) => ({
        value: v,
      })) ?? [],

    target_audience:
      course.target_audience?.map((v) => ({
        value: v,
      })) ?? [],
  };
}
/* -------------------------------------------------- */

export function CourseDialog({ course, open, onOpenChange }: Props) {
  const isEdit = Boolean(course);

  const { uploadFile } = useR2Upload();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const { data: instructors } = useQuery<InstructorOption[]>({
    queryKey: ["instructor-options"],
    queryFn: async () => {
      const res = await fetch("/api/admin/instructors/options");
      if (!res.ok) throw new Error("Failed to load instructors");
      return res.json() as Promise<InstructorOption[]>;
    },
  });
  /* -------------------------------------------------- */
  /* Form                                               */
  /* -------------------------------------------------- */
  const form = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      description: null,
      thumbnail_image: undefined,
      subjects: [],
      list_price: 0,
      sale_price: 0,
      languages: [],
      instructor_ids: [],
      learning_outcomes: [],
      target_audience: [],
      is_active: true,
      class_level: undefined,
      category: undefined,
      board: undefined,
      target_exam: null,
    },
  });

  const saving = form.formState.isSubmitting;
  /* -------------------------------------------------- */
  /* Field arrays                                       */
  /* -------------------------------------------------- */

  const outcomes = useFieldArray({
    control: form.control,
    name: "learning_outcomes",
  });

  const audience = useFieldArray({
    control: form.control,
    name: "target_audience",
  });

  const watchedOutcomes = useWatch({
    control: form.control,
    name: "learning_outcomes",
  });

  const watchedAudience = useWatch({
    control: form.control,
    name: "target_audience",
  });

  const languagesValue =
    useWatch({
      control: form.control,
      name: "languages",
    }) ?? [];

  const subjectsValue =
    useWatch({
      control: form.control,
      name: "subjects",
    }) ?? [];

  const selectedSubjects = subjectsValue.map((s) => s.value);

  const category = useWatch({
    control: form.control,
    name: "category",
  });

  const availableExams = CATEGORY_TARGET_EXAMS[category] ?? [];
  /* -------------------------------------------------- */
  /* Prefill edit                                       */
  /* -------------------------------------------------- */

  useEffect(() => {
    if (!course) return;

    const values = mapRowToForm(course);

    form.reset(values);
  }, [course, form]);

  useEffect(() => {
    const allowed = CATEGORY_TARGET_EXAMS[category] ?? [];
    const current = form.getValues("target_exam");

    if (current && !allowed.includes(current)) {
      form.setValue("target_exam", null);
    }
  }, [category, form]);
  /* -------------------------------------------------- */

  /* -------------------------------------------------- */
  /* Thumbnail preview                                  */
  /* -------------------------------------------------- */

  const thumbnailPreview = useMemo(() => {
    if (thumbnailFile) {
      return URL.createObjectURL(thumbnailFile);
    }

    if (isEdit && course?.thumbnail_image) {
      return `${R2_BUCKET_PUBLIC_URL}/${course.thumbnail_image}`;
    }

    return null;
  }, [thumbnailFile, isEdit, course]);

  useEffect(() => {
    if (!thumbnailFile || !thumbnailPreview) return;

    return () => {
      URL.revokeObjectURL(thumbnailPreview);
    };
  }, [thumbnailFile, thumbnailPreview]);

  useEffect(() => {
    return () => {
      if (cropSrc) URL.revokeObjectURL(cropSrc);
    };
  }, [cropSrc]);

  /* -------------------------------------------------- */
  /* Submit                                             */
  /* -------------------------------------------------- */
  const onSubmit = form.handleSubmit(
    /* ------------------------------------------ */
    /* VALID SUBMIT                              */
    /* ------------------------------------------ */
    async (values: CourseFormValues) => {
      const toastId = toast.loading(
        isEdit ? "Updating course..." : "Creating course...",
      );

      try {
        /* ---------- Create / Update ---------- */
        let courseId: string;

        if (isEdit && course) {
          courseId = course.id;
          await updateCourse(courseId, values);
        } else {
          courseId = await createCourse(values);
        }

        /* ---------- Thumbnail Upload ---------- */
        if (thumbnailFile) {
          toast.loading("Uploading thumbnail...", { id: toastId });

          const upload = await uploadFile({
            file: thumbnailFile,
            assetType: "course_thumbnail",
            courseId,
          });

          if (upload?.key) {
            await updateCourseThumbnail(courseId, upload.key);
          }
        }

        /* ---------- Success ---------- */
        toast.success("Saved", { id: toastId });

        onOpenChange(false);
        form.reset();
      } catch (e) {
        const message = e instanceof Error ? e.message : "Save failed";

        toast.error(message, { id: toastId });
      }
    },

    /* ------------------------------------------ */
    /* INVALID SUBMIT (ZOD ERRORS)               */
    /* ------------------------------------------ */
    (errors) => {
      const message = extractFirstErrorMessage(errors);

      toast.dismiss(); // prevents stuck loading toast
      toast.error(message ?? "Please fix the form errors");
    },
  );

  /* -------------------------------------------------- */
  /* UI                                                 */
  /* -------------------------------------------------- */

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          form.reset();
          setThumbnailFile(null);
          setCropSrc(null);
        }

        onOpenChange(value);
      }}
    >
      <DialogContent
        className="sm:max-w-150 max-h-[95vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Course" : "Create Course"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8 relative">
            {/* ---------------- Title ---------------- */}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Title</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={saving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* ---------------- Subtitle ---------------- */}
            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtitle</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={saving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ---------------- Description ---------------- */}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>

                  <TipTapEditor
                    initialValue={course?.description ?? field.value ?? null}
                    onChange={field.onChange}
                    disabled={saving}
                  />

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ---------------- Thumbnail ---------------- */}

            <div className="space-y-3">
              <FormLabel>Thumbnail</FormLabel>

              {thumbnailPreview && (
                <div className="w-60 h-35 rounded border overflow-hidden bg-muted">
                  <Image
                    src={thumbnailPreview}
                    alt="Thumbnail"
                    width={240}
                    height={140}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              )}

              <Input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_IMAGE_EXTENSIONS.join(",")}
                disabled={saving}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  /* ---------- Validate ---------- */
                  const url = await validateImage({
                    file,
                    maxSize: THUMBNAIL_MAX_SIZE,
                    minWidth: 750,
                    minHeight: 422,
                    allowedTypes: ALLOWED_IMAGE_MIME_TYPES,
                  });

                  if (!url) {
                    e.target.value = "";
                    return;
                  }

                  /* ---------- Open cropper ---------- */
                  setCropSrc(url);
                }}
              />

              <p className="text-xs text-muted-foreground">
                Upload an image at least{" "}
                <span className="font-medium">750 × 422 px</span>. Max size{" "}
                {formatFileSize(THUMBNAIL_MAX_SIZE)}.
              </p>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={saving}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {CATEGORY_LABELS[cat]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="class_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Class Level
                      <span className="text-xs text-muted-foreground ml-1">
                        (Add if relevant to the course)
                      </span>
                    </FormLabel>
                    <Select
                      value={field.value?.toString() ?? ""}
                      onValueChange={(val) => field.onChange(Number(val))}
                      disabled={saving}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[6, 7, 8, 9, 10, 11, 12].map((cls) => (
                          <SelectItem key={cls} value={String(cls)}>
                            Class {cls}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {category === "boards" && (
                <FormField
                  key={category}
                  control={form.control}
                  name="board"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Board</FormLabel>
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                        disabled={saving}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select board" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {BOARDS.map((board) => (
                            <SelectItem key={board} value={board}>
                              {BOARD_LABELS[board]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {category !== "boards" && availableExams.length > 0 && (
                <FormField
                  control={form.control}
                  name="target_exam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Target Exam
                        <span className="text-xs text-muted-foreground ml-1">
                          (Add if relevant to the course)
                        </span>
                      </FormLabel>

                      <Select
                        value={field.value ?? ""}
                        onValueChange={(v) => field.onChange(v)}
                        disabled={saving}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select exam" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {availableExams.map((exam) => (
                            <SelectItem key={exam} value={exam}>
                              {TARGET_EXAM_LABELS[exam]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <Separator />
              {/* ---------------- Subjects ---------------- */}
              <div className="space-y-3">
                <Label>Subjects Covered</Label>

                <div className="flex flex-wrap gap-3">
                  {SUBJECTS.map((sub) => {
                    const checked = selectedSubjects.includes(sub);

                    return (
                      <div
                        key={sub}
                        className="flex items-center gap-2 min-w-36"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            const next = v
                              ? [...selectedSubjects, sub]
                              : selectedSubjects.filter((s) => s !== sub);

                            form.setValue(
                              "subjects",
                              next.map((value) => ({ value })),
                            );
                          }}
                        />
                        <span>{sub}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <Separator />
              {/* ---------------- Languages ---------------- */}
              <div className="space-y-3">
                <Label>Teaching Languages</Label>

                <div className="flex flex-wrap gap-3">
                  {LANGUAGES.map((lang) => {
                    const checked = languagesValue.includes(lang);

                    return (
                      <div
                        key={lang}
                        className="flex items-center gap-2 min-w-36"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            const next = v
                              ? [...languagesValue, lang]
                              : languagesValue.filter((l) => l !== lang);

                            form.setValue("languages", next);
                          }}
                        />
                        <span>{LANGUAGE_LABELS[lang]}</span>
                      </div>
                    );
                  })}
                </div>

                <FormMessage />
              </div>
            </div>
            <Separator />
            {/* ---------------- Outcomes ---------------- */}
            <div className="space-y-2">
              <FormLabel>
                Learning Outcomes
                <span className="text-xs text-muted-foreground ml-1">
                  (Up to {MARKETING_LIMITS.COURSE.MAX_ITEMS})
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  {outcomes.fields.length}/{MARKETING_LIMITS.COURSE.MAX_ITEMS}{" "}
                  added
                </span>
              </FormLabel>
              {outcomes.fields.map((f, i) => {
                const value = watchedOutcomes?.[i]?.value ?? "";
                const LIMIT = MARKETING_LIMITS.COURSE.LEARNING_OUTCOME_MAX;

                return (
                  <div key={f.id} className="flex items-start gap-2">
                    <div className="flex-1 space-y-1">
                      <Input
                        {...form.register(`learning_outcomes.${i}.value`)}
                        maxLength={LIMIT}
                        disabled={saving}
                      />

                      <p
                        className={`
            text-xs text-right
            ${
              value.length > LIMIT * 0.85
                ? "text-destructive"
                : "text-muted-foreground"
            }
          `}
                      >
                        {value.length}/{LIMIT}
                      </p>
                    </div>

                    <RemoveButton onClick={() => outcomes.remove(i)} />
                  </div>
                );
              })}
              <Button
                type="button"
                variant="outline"
                disabled={
                  saving ||
                  outcomes.fields.length >= MARKETING_LIMITS.COURSE.MAX_ITEMS
                }
                onClick={() => outcomes.append({ value: "" })}
              >
                Add Outcome
              </Button>
            </div>

            {/* ---------------- Target Audience ---------------- */}
            <div className="space-y-2">
              <FormLabel>
                Target Audience
                <span className="text-xs text-muted-foreground ml-1">
                  (Up to {MARKETING_LIMITS.COURSE.MAX_ITEMS})
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  {audience.fields.length}/{MARKETING_LIMITS.COURSE.MAX_ITEMS}{" "}
                  added
                </span>
              </FormLabel>

              {audience.fields.map((f, i) => {
                const value = watchedAudience?.[i]?.value ?? "";
                const LIMIT = MARKETING_LIMITS.COURSE.TARGET_AUDIENCE_MAX;

                return (
                  <div key={f.id} className="flex items-start gap-2">
                    <div className="flex-1 space-y-1">
                      <Input
                        {...form.register(`target_audience.${i}.value`)}
                        maxLength={LIMIT}
                        disabled={saving}
                        placeholder="e.g. Class 10 students"
                      />

                      <p
                        className={`
            text-xs text-right
            ${
              value.length > LIMIT * 0.85
                ? "text-destructive"
                : "text-muted-foreground"
            }
          `}
                      >
                        {value.length}/{LIMIT}
                      </p>
                    </div>

                    <RemoveButton onClick={() => audience.remove(i)} />
                  </div>
                );
              })}
              <Button
                type="button"
                variant="outline"
                disabled={
                  saving ||
                  audience.fields.length >= MARKETING_LIMITS.COURSE.MAX_ITEMS
                }
                onClick={() => audience.append({ value: "" })}
              >
                Add Audience
              </Button>
            </div>
            {/* ---------------- Price ---------------- */}
            <FormField
              control={form.control}
              name="list_price"
              render={() => (
                <FormItem>
                  <FormLabel>List Price</FormLabel>

                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      disabled={saving}
                      placeholder="Enter list price"
                      {...form.register("list_price", {
                        valueAsNumber: true,
                        setValueAs: (v) =>
                          v === "" || v === null || Number.isNaN(v)
                            ? undefined
                            : Number(v),
                      })}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sale_price"
              render={() => (
                <FormItem>
                  <FormLabel>Sale Price</FormLabel>

                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      disabled={saving}
                      placeholder="Enter sale price"
                      {...form.register("sale_price", {
                        valueAsNumber: true,
                        setValueAs: (v) =>
                          v === "" || v === null || Number.isNaN(v)
                            ? undefined
                            : Number(v),
                      })}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            {/* ---------------- Active Status ---------------- */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <FormLabel>Active</FormLabel>

                      <p className="text-sm text-muted-foreground">
                        Inactive courses cannot be enrolled
                      </p>
                    </div>

                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={saving}
                        className="

    disabled:opacity-50
  "
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instructor_ids"
              render={({ field }) => {
                const selectedIds = field.value ?? [];

                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>Instructors</FormLabel>

                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="justify-between"
                          >
                            {selectedIds.length > 0
                              ? `${selectedIds.length} instructor(s) selected`
                              : "Select instructors"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>

                      <PopoverContent className="p-0 w-75">
                        <Command>
                          <CommandInput placeholder="Search instructors..." />
                          <CommandEmpty>No instructors found.</CommandEmpty>

                          <CommandGroup className="max-h-64 overflow-auto">
                            {instructors?.map((inst) => {
                              const isSelected = selectedIds.includes(inst.id);

                              return (
                                <CommandItem
                                  key={inst.id}
                                  className="flex items-center gap-2"
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([
                                          ...selectedIds,
                                          inst.id,
                                        ]);
                                      } else {
                                        field.onChange(
                                          selectedIds.filter(
                                            (id) => id !== inst.id,
                                          ),
                                        );
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />

                                  <span>{inst.full_name}</span>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {selectedIds.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {instructors
                          ?.filter((inst) => selectedIds.includes(inst.id))
                          .map((inst) => (
                            <Badge
                              key={inst.id}
                              variant="secondary"
                              className="cursor-pointer rounded-sm"
                              onClick={() =>
                                field.onChange(
                                  selectedIds.filter((id) => id !== inst.id),
                                )
                              }
                            >
                              {inst.full_name}
                            </Badge>
                          ))}
                      </div>
                    )}

                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* ---------------- Submit ---------------- */}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                disabled={saving}
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button type="submit" disabled={saving}>
                Save & Continue
              </Button>
            </div>
          </form>
          <ImageCropper
            open={!!cropSrc}
            src={cropSrc}
            aspect={16 / 9}
            output={IMAGE_OUTPUTS.THUMBNAIL}
            maxSize={THUMBNAIL_MAX_SIZE}
            onCancel={() => {
              if (cropSrc) URL.revokeObjectURL(cropSrc);
              setCropSrc(null);

              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            onComplete={(file) => {
              setThumbnailFile(file);

              if (cropSrc) URL.revokeObjectURL(cropSrc);
              setCropSrc(null);
            }}
          />
        </Form>
      </DialogContent>
    </Dialog>
  );
}
