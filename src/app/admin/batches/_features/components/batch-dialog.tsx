"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useForm,
  useWatch,
  FormProvider,
  FieldErrors,
  useFieldArray,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronDown, Loader } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Switch } from "@/src/components/ui/switch";
import { Label } from "@/src/components/ui/label";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";
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
import { BatchFormValues, batchSchema } from "../zod-schema/schema";
import { BatchDialogProps, BatchListItem } from "../types/types";
import { createBatch } from "../actions/create-batch";
import { updateBatch } from "../actions/update-batch";
import { getBatchEditState } from "../actions/get-batch-edit-state";
import { cn } from "@/src/lib/utils";
import { useR2Upload } from "@/src/hooks/use-r2-upload";
import { R2_BUCKET_PUBLIC_URL } from "@/src/lib/constants/config";
import Image from "next/image";
import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
} from "@/src/lib/constants/upload.constants";
import { validateImage } from "@/src/lib/helper-functions/validate-image";
import { MARKETING_LIMITS } from "@/src/lib/constants/marketing-limits";
import { RemoveButton } from "../../../courses/_features/components/remove-button";
import { SIZE_LIMITS } from "@/src/app/api/uploads/signed-url/route";
import { ImageCropper } from "@/src/components/ui/media/ImageCropper";
import { IMAGE_OUTPUTS } from "@/src/lib/constants/image-output.config";
import { updateBatchThumbnail } from "../actions/update-batch-thumbnail";
import { TipTapEditor } from "../../../courses/_features/components/tiptap-editor";
import { FormField } from "@/src/components/ui/form";

const LANGUAGES = ["english", "hindi", "marathi"] as const;
type InstructorOption = {
  id: string;
  full_name: string;
};
/* ---------------- helpers ---------------- */

function mapBatchToForm(batch: BatchListItem): BatchFormValues {
  return {
    course_ids: batch.courses.map((c) => c.course.id),

    title: batch.title,
    subtitle: batch.subtitle ?? "",
    description: batch.description ?? null,

    sale_price: batch.sale_price,
    list_price: batch.list_price,
    thumbnail_image: batch.thumbnail_image ?? undefined,

    /* Marketing */
    learning_outcomes:
      batch.learning_outcomes?.map((v) => ({ value: v })) ?? [],

    target_audience: batch.target_audience?.map((v) => ({ value: v })) ?? [],

    subjects: batch.subjects?.map((v) => ({ value: v })) ?? [],
    instructor_ids: batch.instructors?.map((i) => i.id) ?? [],
    /* Academic */
    class_level: batch.class_level ?? null,
    target_exam: batch.target_exam ?? null,

    /* Delivery */
    mode: batch.mode,
    languages: batch.languages.length ? batch.languages : ["english"],

    location: batch.location ?? null,

    /* Lifecycle */
    start_date: toDateInput(batch.start_date),
    end_date: toDateInput(batch.end_date),

    /* Ops */
    capacity: batch.capacity ?? null,
    is_admission_open: batch.is_admission_open,
    is_active: batch.is_active,
  };
}

export function extractFirstErrorMessage(errors: FieldErrors): string | null {
  for (const key in errors) {
    const value = errors[key];

    if (!value) continue;

    if ("message" in value && typeof value.message === "string") {
      return value.message;
    }

    if (typeof value === "object") {
      const nested = extractFirstErrorMessage(value as FieldErrors);
      if (nested) return nested;
    }
  }

  return null;
}

function toDateInput(v?: string | null) {
  return v ? v.slice(0, 10) : "";
}

const THUMBNAIL_MAX_SIZE = SIZE_LIMITS.batch_thumbnail;
/* ---------------- component ---------------- */

export function BatchDialog({
  open,
  onOpenChange,
  batch,
  courses,
}: BatchDialogProps) {
  const isEdit = Boolean(batch);
  const { uploadFile } = useR2Upload();
  const [editLocked, setEditLocked] = useState<boolean>(false);
  const [checkingLock, setCheckingLock] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const { data: instructors } = useQuery<InstructorOption[]>({
    queryKey: ["instructor-options"],
    queryFn: async () => {
      const res = await fetch("/api/admin/instructors/options");

      if (!res.ok) {
        throw new Error("Failed to load instructors");
      }

      return res.json();
    },
  });

  const form = useForm({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      /* Relations */
      course_ids: [],
      instructor_ids: [],
      /* Basic */
      title: "",
      subtitle: "",
      description: null, // JSON from TipTap
      thumbnail_image: undefined,

      /* Pricing */
      sale_price: 0,
      list_price: 0,

      /* Academic */
      subjects: [],
      class_level: null,
      target_exam: null,

      /* Marketing */
      learning_outcomes: [],
      target_audience: [],

      /* Delivery */
      languages: ["english"],
      location: null,
      mode: "offline",

      /* Lifecycle */
      start_date: "",
      end_date: "",

      /* Capacity */
      capacity: null,

      /* Visibility */
      is_admission_open: true,
      is_active: true,
    },
  });

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

  /* ---------------- watched values ---------------- */
  const titleValue = useWatch({ control: form.control, name: "title" });

  const subtitleValue = useWatch({
    control: form.control,
    name: "subtitle",
  });

  const courseIds = useWatch({
    control: form.control,
    name: "course_ids",
  });

  const languages = useWatch({
    control: form.control,
    name: "languages",
  });

  const mode = useWatch({
    control: form.control,
    name: "mode",
  });

  const isActive = useWatch({
    control: form.control,
    name: "is_active",
  });

  const isAdmissionOpen = useWatch({
    control: form.control,
    name: "is_admission_open",
  });

  /* ---------------- reset on open ---------------- */
  useEffect(() => {
    if (!open) return;

    if (batch) {
      form.reset(mapBatchToForm(batch));
    } else {
      form.reset();
    }
  }, [open, batch, form]);

  useEffect(() => {
    if (!open) {
      setEditLocked(false);
      setCheckingLock(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!batch) {
      setEditLocked(false);
      return;
    }
    const batchId = batch.id;
    let cancelled = false;

    async function checkLock() {
      try {
        setCheckingLock(true);
        const res = await getBatchEditState(batchId);
        if (!cancelled) {
          setEditLocked(res.locked);
        }
      } catch {
        // fail-safe: lock editing
        if (!cancelled) setEditLocked(true);
      } finally {
        if (!cancelled) setCheckingLock(false);
      }
    }
    //I know this returns a promise, and I am intentionally not awaiting it
    void checkLock();

    return () => {
      cancelled = true;
    };
  }, [open, batch]);

  const thumbnailPreview = useMemo(() => {
    if (thumbnailFile) {
      return URL.createObjectURL(thumbnailFile);
    }
    if (isEdit && batch?.thumbnail_image) {
      return `${R2_BUCKET_PUBLIC_URL}/${batch.thumbnail_image}`;
    }
    return null;
  }, [thumbnailFile, isEdit, batch]);

  /* ---------------- submit ---------------- */

  const onSubmit = form.handleSubmit(
    async (values: BatchFormValues) => {
      /* -------------------------------------------------- */
      /* Loading toast (always create first)                */
      /* -------------------------------------------------- */
      const toastId = toast.loading(
        isEdit ? "Updating batch..." : "Creating batch...",
      );

      try {
        /* -------------------------------------------------- */
        /* Price validation                                  */
        /* -------------------------------------------------- */
        if (values.list_price < values.sale_price) {
          toast.error(
            "List price must be greater than or equal to sale price",
            { id: toastId },
          );
          return;
        }
        /* -------------------------------------------------- */
        /* Payload transform                                 */
        /* -------------------------------------------------- */
        const payload = {
          ...values,
        };

        let batchId: string;

        /* -------------------------------------------------- */
        /* Create / Update                                   */
        /* -------------------------------------------------- */
        if (isEdit && batch) {
          batchId = batch.id;
          await updateBatch(batchId, payload);
        } else {
          batchId = await createBatch(payload);
        }

        /* -------------------------------------------------- */
        /* Thumbnail upload                                  */
        /* -------------------------------------------------- */
        if (thumbnailFile) {
          toast.loading("Uploading thumbnail...", { id: toastId });

          const upload = await uploadFile({
            file: thumbnailFile,
            assetType: "batch_thumbnail",
            batchId,
          });

          if (upload?.key) {
            await updateBatchThumbnail(batchId, upload.key);
          }
        }

        /* -------------------------------------------------- */
        /* Success                                           */
        /* -------------------------------------------------- */
        toast.success("Saved", { id: toastId });

        onOpenChange(false);
        form.reset();
      } catch (e) {
        /* -------------------------------------------------- */
        /* Server / RPC errors                               */
        /* -------------------------------------------------- */
        const message = e instanceof Error ? e.message : "Save failed";

        toast.error(message, { id: toastId });
      }
    },

    /* -------------------------------------------------- */
    /* Zod / RHF validation errors                        */
    /* -------------------------------------------------- */
    (errors) => {
      const message = extractFirstErrorMessage(errors);

      toast.dismiss(); // prevents stuck loading toast
      toast.error(message ?? "Please fix the form errors");
    },
  );
  /* ---------------- render ---------------- */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="sm:max-w-150 max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>{batch ? "Edit Batch" : "Create Batch"}</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* COURSES */}
            <div className="space-y-2">
              <Label>Courses</Label>

              <Collapsible>
                <CollapsibleTrigger
                  asChild
                  disabled={editLocked || checkingLock}
                >
                  <button
                    disabled={editLocked || checkingLock}
                    type="button"
                    className={cn(
                      "w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm",
                      editLocked || checkingLock
                        ? "cursor-not-allowed bg-muted text-muted-foreground"
                        : "hover:bg-muted cursor-pointer",
                    )}
                  >
                    <span className="truncate">
                      {courseIds.length === 0
                        ? "Select courses"
                        : courseIds.length === 1
                          ? courses.find((c) => c.id === courseIds[0])?.title
                          : `${courseIds.length} courses selected`}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-2 border rounded-md p-3 space-y-2 max-h-56 overflow-y-auto">
                  {courses.map((c) => {
                    const checked = courseIds.includes(c.id);
                    const disabled = editLocked || !c.is_active;

                    return (
                      <div
                        key={c.id}
                        className={cn(
                          "flex items-center gap-2",
                          !c.is_active && "opacity-60",
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={disabled}
                          onCheckedChange={(v) => {
                            if (disabled) return;

                            const next = v
                              ? [...courseIds, c.id]
                              : courseIds.filter((id) => id !== c.id);

                            form.setValue("course_ids", next);
                          }}
                        />

                        <span className="text-sm">
                          {c.title}
                          {!c.is_active && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (inactive)
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>

              {checkingLock && (
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" /> Checking
                  enrollment status…
                </p>
              )}

              {!editLocked && !checkingLock && (
                <p className="text-xs text-muted-foreground">
                  Select one or more courses included in this batch
                </p>
              )}
              {editLocked && (
                <p className="text-xs text-amber-600">
                  Students are already enrolled in this batch. Courses cannot be
                  added or removed once enrollment has started.
                </p>
              )}
            </div>

            {/* NAME */}
            <div className="space-y-3 relative">
              <Label>Batch Name</Label>

              <Input maxLength={120} {...form.register("title")} />

              <p className="absolute -bottom-2 right-0 text-xs text-muted-foreground">
                {titleValue?.length ?? 0}/120
              </p>
            </div>
            {/* SUBTITLE */}
            <div className="space-y-3 ">
              <Label>Subtitle</Label>

              <Input
                maxLength={120}
                placeholder="Short supporting line"
                {...form.register("subtitle")}
              />

              <p className="text-xs text-right text-muted-foreground">
                {subtitleValue?.length ?? 0}/120
              </p>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-3">
              <Label>Description</Label>

              <TipTapEditor
                initialValue={form.getValues("description")}
                onChange={(val) => form.setValue("description", val)}
              />

              <p className="text-xs text-muted-foreground">
                Supports bold, italic, lists
              </p>
            </div>

            {/* Thumbnail */}
            <div className="space-y-3">
              <Label>Thumbnail</Label>

              {thumbnailPreview && (
                <div className="w-60 h-35 rounded border overflow-hidden bg-muted">
                  <Image
                    src={thumbnailPreview}
                    alt="Thumbnail"
                    width={240}
                    height={140}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <Input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_IMAGE_EXTENSIONS.join(",")}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

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
                  setCropSrc(url);
                }}
              />
            </div>

            {/* Original Price */}
            <div className="space-y-3">
              <Label>List Price (₹)</Label>
              <Input
                type="number"
                min={0}
                {...form.register("list_price", { valueAsNumber: true })}
              />
            </div>

            {/* PRICE */}
            <div className="space-y-3">
              <Label>Sale Price (₹)</Label>
              <Input
                type="number"
                min={0}
                {...form.register("sale_price", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-3">
              <Label>Class Level</Label>

              <Input
                type="number"
                placeholder="e.g. 11"
                {...form.register("class_level", {
                  valueAsNumber: true,
                })}
              />
            </div>

            <div className="space-y-3">
              <Label>Target Exam</Label>

              <Input
                placeholder="e.g. NEET 2027"
                {...form.register("target_exam")}
              />
            </div>

            {/* Location */}
            <div className="space-y-3">
              <Label>Location</Label>

              <Input
                placeholder="e.g. Solapur, Pune"
                {...form.register("location")}
              />
            </div>

            {/* LANGUAGES */}
            <div className="space-y-2">
              <Label>Teaching Languages</Label>
              <div className="flex gap-4">
                {LANGUAGES.map((lang) => (
                  <div key={lang} className="flex items-center gap-2">
                    <Checkbox
                      checked={languages.includes(lang)}
                      onCheckedChange={(v) => {
                        const next = v
                          ? [...languages, lang]
                          : languages.filter((l) => l !== lang);
                        form.setValue("languages", next);
                      }}
                    />
                    <span className="capitalize">{lang}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ADMISSION */}
            <div className="flex items-center justify-between">
              <Label>Admission Open</Label>
              <Switch
                checked={isAdmissionOpen}
                onCheckedChange={(v) => form.setValue("is_admission_open", v)}
              />
            </div>

            {/* MODE */}
            <div className="space-y-3">
              <Label>Batch Mode</Label>
              <Select
                value={mode}
                onValueChange={(v) =>
                  form.setValue("mode", v as BatchListItem["mode"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* DURATION */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Start Date</Label>
                <Input type="date" {...form.register("start_date")} />
              </div>

              <div className="space-y-1">
                <Label>End Date</Label>
                <Input type="date" {...form.register("end_date")} />
              </div>
            </div>

            {/* CAPACITY */}
            <div className="space-y-3">
              <Label>Capacity</Label>
              <Input
                type="number"
                {...form.register("capacity", {
                  valueAsNumber: true,
                })}
              />
            </div>

            {/* Subjects */}
            <div className="space-y-2">
              <Label>Subjects</Label>
              {subjects.fields.map((f, i) => (
                <div key={f.id} className="flex gap-2">
                  <Input
                    {...form.register(`subjects.${i}.value`)}
                    placeholder="e.g. Physics"
                    onBlur={() => {
                      const current = form.getValues("subjects");

                      if (!current) return;

                      const isEmpty = !current[i]?.value?.trim();

                      if (isEmpty && current.length > 1) {
                        subjects.remove(i);
                      }
                    }}
                  />
                  <RemoveButton onClick={() => subjects.remove(i)} />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const last = form.getValues(
                    `subjects.${subjects.fields.length - 1}.value`,
                  );

                  if (subjects.fields.length > 0 && !last?.trim()) {
                    toast.error("Please enter subject before adding another");
                    return;
                  }

                  subjects.append({ value: "" });
                }}
              >
                Add Subject
              </Button>
            </div>

            {/* Learning Outcomes */}
            <div className="space-y-2">
              <Label>
                Learning Outcomes
                <span className="text-xs text-muted-foreground ml-2">
                  {outcomes.fields.length}/{MARKETING_LIMITS.COURSE.MAX_ITEMS}{" "}
                  added
                </span>
              </Label>

              {outcomes.fields.map((f, i) => {
                const value = form.watch(`learning_outcomes.${i}.value`) ?? "";
                const LIMIT = MARKETING_LIMITS.COURSE.LEARNING_OUTCOME_MAX;

                return (
                  <div key={f.id} className="flex items-start gap-2">
                    <div className="flex-1 space-y-1">
                      <Input
                        {...form.register(`learning_outcomes.${i}.value`)}
                        maxLength={LIMIT}
                        onBlur={() => {
                          const current = form.getValues("learning_outcomes");

                          if (!current) return;

                          const isEmpty = !current[i]?.value?.trim();

                          if (isEmpty && current.length > 1) {
                            outcomes.remove(i);
                          }
                        }}
                      />
                      <p className="text-xs text-right text-muted-foreground">
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
                  outcomes.fields.length >= MARKETING_LIMITS.COURSE.MAX_ITEMS
                }
                onClick={() => {
                  const last = form.getValues(
                    `learning_outcomes.${outcomes.fields.length - 1}.value`,
                  );

                  if (outcomes.fields.length > 0 && !last?.trim()) {
                    toast.error(
                      "Please enter learning outcome before adding another",
                    );
                    return;
                  }

                  outcomes.append({ value: "" });
                }}
              >
                Add Outcome
              </Button>
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <Label>
                Target Audience
                <span className="text-xs text-muted-foreground ml-2">
                  {audience.fields.length}/{MARKETING_LIMITS.COURSE.MAX_ITEMS}{" "}
                  added
                </span>
              </Label>

              {audience.fields.map((f, i) => {
                const value = form.watch(`target_audience.${i}.value`) ?? "";
                const LIMIT = MARKETING_LIMITS.COURSE.TARGET_AUDIENCE_MAX;

                return (
                  <div key={f.id} className="flex items-start gap-2">
                    <div className="flex-1 space-y-1">
                      <Input
                        {...form.register(`target_audience.${i}.value`)}
                        maxLength={LIMIT}
                        onBlur={() => {
                          const current = form.getValues("target_audience");

                          if (!current) return;

                          const isEmpty = !current[i]?.value?.trim();

                          if (isEmpty && current.length > 1) {
                            audience.remove(i);
                          }
                        }}
                      />
                      <p className="text-xs text-right text-muted-foreground">
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
                  audience.fields.length >= MARKETING_LIMITS.COURSE.MAX_ITEMS
                }
                onClick={() => {
                  const last = form.getValues(
                    `target_audience.${audience.fields.length - 1}.value`,
                  );

                  if (audience.fields.length > 0 && !last?.trim()) {
                    toast.error(
                      "Please enter audience item before adding another",
                    );
                    return;
                  }

                  audience.append({ value: "" });
                }}
              >
                Add Audience
              </Button>
            </div>

            <FormField
              control={form.control}
              name="instructor_ids"
              render={({ field }) => {
                const selectedIds = field.value ?? [];

                return (
                  <div className="flex flex-col space-y-2">
                    <Label>Instructors</Label>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          className="justify-between"
                        >
                          {selectedIds.length > 0
                            ? `${selectedIds.length} instructor(s) selected`
                            : "Select instructors"}

                          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
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
                      <div className="flex flex-wrap gap-2 mt-1">
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
                  </div>
                );
              }}
            />

            {/* ACTIVE */}
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={isActive}
                onCheckedChange={(v) => form.setValue("is_active", v)}
              />
            </div>

            {/* SUBMIT */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                disabled={form.formState.isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className=" cursor-pointer "
              >
                {form.formState.isSubmitting
                  ? batch
                    ? "Updating..."
                    : "Creating..."
                  : batch
                    ? "Update Batch"
                    : "Create Batch"}
              </Button>
            </div>
          </form>
        </FormProvider>
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
      </DialogContent>
    </Dialog>
  );
}
