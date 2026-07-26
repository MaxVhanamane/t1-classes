"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Info, AlertTriangle } from "lucide-react";

import {
  createUserSchema,
  updateUserSchema,
  userRoles,
  userStatuses,
  UserRole,
  UserStatus,
} from "../zod/user-schema";

import { UserDialogData } from "../types/user-dialog";
import { UserFormValues } from "../types/user-form";
import { createUser } from "../actions/create-user";
import { updateUser } from "../actions/update-user";
import { callServerAction } from "@/src/lib/actions/call-server-action";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";

import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { extractFirstErrorMessage } from "@/src/lib/form/extract-first-error-message";

type Props = {
  mode: "create" | "edit";
  user?: UserDialogData;
  children: React.ReactNode;
};

export default function UserDialog({ mode, user, children }: Props) {
  const [open, setOpen] = useState(false);
  const isEdit = mode === "edit";

  const schema = useMemo(
    () => (isEdit ? updateUserSchema : createUserSchema),
    [isEdit],
  );

  const form = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: user?.email ?? "",
      full_name: user?.full_name ?? "",
      phone: user?.phone ?? "",
      role: user?.role ?? "student",
      status: user?.status ?? "active",
      qualification: user?.qualification ?? "",
      bio: user?.bio ?? "",
      guardian_name: user?.guardian_name ?? "",
      guardian_phone: user?.guardian_phone ?? "",
      guardian_email: user?.guardian_email ?? "",
    },
  });

  const {
    register,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const queryClient = useQueryClient();

  const role = useWatch({
    control,
    name: "role",
  });

  const status = useWatch({
    control,
    name: "status",
  });

  const isStaff = role === "teacher" || role === "admin";

  useEffect(() => {
    if (!open) return;

    reset({
      email: user?.email ?? "",
      full_name: user?.full_name ?? "",
      phone: user?.phone ?? "",
      role: user?.role ?? "student",
      status: user?.status ?? "active",
      qualification: user?.qualification ?? "",
      bio: user?.bio ?? "",
      guardian_name: user?.guardian_name ?? "",
      guardian_phone: user?.guardian_phone ?? "",
      guardian_email: user?.guardian_email ?? "",
    });
  }, [open, user, reset]);

  const onSubmit = form.handleSubmit(
    async (values: UserFormValues) => {
      const toastId = toast.loading(
        isEdit ? "Updating user..." : "Creating user...",
      );

      try {
        const payload = values;

        const result = isEdit
          ? await callServerAction(updateUser(user!.id, payload))
          : await callServerAction(createUser(payload));

        if (result.error) {
          toast.error(result.error, { id: toastId });
          return;
        }

        toast.success(
          isEdit
            ? "User updated successfully"
            : "Account created & invite sent!",
          { id: toastId },
        );

        await queryClient.invalidateQueries({
          queryKey: ["users"],
        });

        setOpen(false);
        form.reset();
      } catch {
        toast.error(
          isEdit ? "Failed to update user" : "Failed to create user",
          { id: toastId },
        );
      }
    },
    (errors) => {
      const message = extractFirstErrorMessage(errors);
      toast.dismiss();
      toast.error(message ?? "Please fix the form errors");
    },
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-h-[90vh] overflow-y-auto bg-card sm:max-w-lg scrollbar-thin"
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Create User"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Email */}
          {!isEdit && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Email</Label>
              <Input type="email" {...register("email")} />

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <AlertTriangle className="size-3.5 text-amber-500" />
                <span>
                  Make sure this is correct. Email cannot be changed later.
                </span>
              </div>

              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Full Name</Label>
            <Input {...register("full_name")} />
            {errors.full_name && (
              <p className="text-sm text-red-500">{errors.full_name.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Phone</Label>
            <Input {...register("phone")} />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Role</Label>
            <Select
              value={role}
              onValueChange={(value) =>
                setValue("role", value as UserRole, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {userRoles.map((roleOption) => (
                  <SelectItem key={roleOption} value={roleOption}>
                    {roleOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
          </div>

          {/* Student Fields */}
          {role === "student" && (
            <>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Guardian Name</Label>
                <Input {...register("guardian_name")} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Guardian Phone</Label>
                <Input {...register("guardian_phone")} />
                {errors.guardian_phone && (
                  <p className="text-sm text-red-500">
                    {errors.guardian_phone.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Guardian Email</Label>
                <Input type="email" {...register("guardian_email")} />
                {errors.guardian_email && (
                  <p className="text-sm text-red-500">
                    {errors.guardian_email.message}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Staff Fields */}
          {isStaff && (
            <>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Qualification</Label>
                <Input {...register("qualification")} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Bio</Label>
                <Textarea rows={4} {...register("bio")} />
              </div>
            </>
          )}

          {/* Status Segment */}
          {isEdit && (
            <div className="space-y-1.5 rounded-lg border border-border/50 bg-muted/20 p-4">
              <Label className="text-sm font-medium">Account Status</Label>

              {user?.status === "invited" ? (
                /* STATE 1: Locked UI */
                <div className="space-y-3 pt-1">
                  <div className="flex h-10 w-full items-center justify-between rounded-md border border-border/50 bg-background/50 px-3 opacity-70">
                    <span className="text-sm font-medium text-muted-foreground">
                      Invited
                    </span>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      Locked
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <p>
                      This user has not set up their password yet. If this
                      account was created by mistake or has the wrong email,
                      please close this dialog and click <strong>Delete</strong>{" "}
                      on the table row to completely remove the user from the
                      database.
                    </p>
                  </div>
                </div>
              ) : (
                /* STATE 2: Onboarded UI */
                <>
                  <Select
                    value={status ?? "active"}
                    onValueChange={(value) =>
                      setValue("status", value as UserStatus, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {userStatuses
                        .filter((statusOption) => statusOption !== "invited")
                        .map((statusOption) => (
                          <SelectItem key={statusOption} value={statusOption}>
                            {statusOption.charAt(0).toUpperCase() +
                              statusOption.slice(1)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.status.message}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                  ? "Save Changes"
                  : "Create & Send Invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
