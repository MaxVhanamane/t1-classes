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
import { SIZE_LIMITS } from "@/src/app/api/uploads/signed-url/route";
import { Switch } from "@/src/components/ui/switch";
import { RemoveButton } from "./remove-button";
import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
} from "@/src/lib/constants/upload.constants";
import { formatFileSize } from "@/src/lib/helper-functions/format-file-size";
import { IMAGE_OUTPUTS } from "@/src/lib/constants/image-output.config";
import { validateImage } from "@/src/lib/helper-functions/validate-image";
import { ImageCropper } from "@/src/components/ui/media/ImageCropper";
import { R2_BUCKET_PUBLIC_URL } from "@/src/lib/constants/config";
import { CourseTypeInfo } from "./course-type-info";
import { MARKETING_LIMITS } from "@/src/lib/constants/marketing-limits";
import { useQuery } from "@tanstack/react-query";
import { InstructorOption } from "../types/course.types";
import { extractFirstErrorMessage } from "../../../batches/_features/components/batch-dialog";
import { Checkbox } from "@/src/components/ui/checkbox";

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
    course_type: course.course_type,
    class_level: course.class_level ?? undefined,
    board: course.board ?? "",
    target_exam: course.target_exam ?? "",
    subjects: course.subjects?.length
      ? course.subjects.map((v) => ({ value: v }))
      : [],

    list_price: course.list_price,
    sale_price: course.sale_price,
    languages: course.languages?.map((v) => ({ value: v })) ?? [],
    instructor_ids: course.instructors?.map((i) => i.id) ?? [],
    is_active: course.is_active,

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
      course_type: "academic",
      subjects: [],
      list_price: 0,
      sale_price: 0,
      languages: [],
      instructor_ids: [],
      learning_outcomes: [],
      target_audience: [],
      is_active: true,
      class_level: undefined,
      board: "",
      target_exam: "",
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

  const subjects = useFieldArray({
    control: form.control,
    name: "subjects",
  });

  const languages = useFieldArray({
    control: form.control,
    name: "languages",
  });

  const watchedOutcomes = useWatch({
    control: form.control,
    name: "learning_outcomes",
  });

  const watchedAudience = useWatch({
    control: form.control,
    name: "target_audience",
  });
  /* -------------------------------------------------- */
  /* Prefill edit                                       */
  /* -------------------------------------------------- */

  useEffect(() => {
    if (course) {
      form.reset(mapRowToForm(course));
    }
  }, [course, form]);

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
              {/* ---------------- Type ---------------- */}
              <div className="relative flex gap-2">
                <FormField
                  control={form.control}
                  name="course_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Type</FormLabel>
                      <Select
                        key={field.value}
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={saving}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          <SelectItem value="academic">Academic</SelectItem>
                          <SelectItem value="foundation">Foundation</SelectItem>
                          <SelectItem value="exam">Exam</SelectItem>
                          <SelectItem value="crash">Crash</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <CourseTypeInfo />
              </div>
              <div>
                <h3 className="text-sm font-medium">Academic Details</h3>
                <p className="text-xs text-muted-foreground">
                  Optional details to help categorize the course.
                </p>
              </div>
              <FormField
                control={form.control}
                name="class_level"
                render={() => (
                  <FormItem>
                    <FormLabel>
                      Class Level
                      <span className="text-xs text-muted-foreground ml-1">
                        (Optional)
                      </span>
                    </FormLabel>

                    <FormControl>
                      <Input
                        type="number"
                        disabled={saving}
                        placeholder="Enter class level"
                        {...form.register("class_level", {
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
                name="board"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Board
                      <span className="text-xs text-muted-foreground ml-1">
                        (Optional)
                      </span>
                    </FormLabel>

                    <FormControl>
                      <Input {...field} disabled={saving} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_exam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Target Exam
                      <span className="text-xs text-muted-foreground ml-1">
                        (Optional)
                      </span>
                    </FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        disabled={saving}
                        placeholder="e.g. NEET, JEE, SSC"
                      />
                    </FormControl>

                    <p className="text-xs text-muted-foreground">
                      Add only if this course prepares students for a specific
                      exam.
                    </p>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ---------------- Subjects ---------------- */}

              <FormLabel>Subjects</FormLabel>
              {subjects.fields.map((f, i) => (
                <div key={f.id} className="flex gap-2">
                  <Input
                    {...form.register(`subjects.${i}.value`)}
                    disabled={saving}
                  />
                  <RemoveButton onClick={() => subjects.remove(i)} />
                </div>
              ))}

              <Button
                disabled={saving}
                type="button"
                variant="outline"
                onClick={() => subjects.append({ value: "" })}
              >
                Add Subject
              </Button>

              {/* ---------------- Languages ---------------- */}
              <FormField
                control={form.control}
                name="languages"
                render={() => (
                  <FormItem>
                    <FormLabel>Languages</FormLabel>

                    {languages.fields.map((f, i) => (
                      <FormField
                        key={f.id}
                        control={form.control}
                        name={`languages.${i}.value`}
                        render={({ field }) => (
                          <FormItem className="flex gap-2">
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <RemoveButton onClick={() => languages.remove(i)} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      className="w-fit"
                      onClick={() => languages.append({ value: "" })}
                    >
                      Add Language
                    </Button>

                    {/* THIS DISPLAYS THE .min(1) ERROR */}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
