"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AppUser } from "@/src/types/user";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../../components/ui/dialog";
import { Input } from "../../../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { Button } from "../../../../../components/ui/button";
import {
  UpdateUserFormValues,
  updateUserSchema,
  userRoles,
  userStatuses,
} from "@/src/app/admin/users/_features/zod/user-schema";
import { updateUser } from "@/src/app/admin/users/_features/actions/update-user";
import { callServerAction } from "@/src/lib/actions/call-server-action";

export default function EditUserDialog({
  user,
  children,
}: {
  user: AppUser;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      full_name: user.full_name ?? "",
      phone: user.phone ?? "",
      role: user.role,
      status: user.status,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset,
  } = form;

  // ✅ React Compiler-safe subscriptions
  const role = useWatch({
    control,
    name: "role",
  });

  const status = useWatch({
    control,
    name: "status",
  });

  const onSubmit = async (values: UpdateUserFormValues) => {
    setLoading(true);

    const { error } = await callServerAction(updateUser(user.id, values));

    if (error) {
      console.error("Failed to update user:", error);
      setLoading(false);
      return;
    }

    setOpen(false);
    reset(values);
    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        setOpen(state);
        if (state) {
          reset({
            full_name: user.full_name ?? "",
            phone: user.phone ?? "",
            role: user.role,
            status: user.status,
          });
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Full Name</label>
            <Input {...register("full_name")} placeholder="Full name" />
            {errors.full_name && (
              <p className="text-sm text-red-500">{errors.full_name.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Phone</label>
            <Input {...register("phone")} placeholder="Phone number" />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Role</label>
            <Select
              value={role}
              onValueChange={(value) =>
                setValue("role", value as UpdateUserFormValues["role"], {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
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

          {/* Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={status}
              onValueChange={(value) =>
                setValue("status", value as UpdateUserFormValues["status"], {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {userStatuses.map((statusOption) => (
                  <SelectItem key={statusOption} value={statusOption}>
                    {statusOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
