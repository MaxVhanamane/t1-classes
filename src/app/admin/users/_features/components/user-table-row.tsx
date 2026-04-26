"use client";

import { AppUser } from "@/src/types/user";
import EditUserDialog from "./edit-user-dialog";
import { Button } from "../../../../../components/ui/button";

export default function UserTableRow({ user }: { user: AppUser }) {
  return (
    <tr className="border-b last:border-0">
      {/* Name */}
      <td className="p-3 font-medium">{user.full_name || "Unnamed"}</td>

      {/* Phone */}
      <td className="text-sm text-muted-foreground">{user.phone || "—"}</td>
      <td className="text-sm text-muted-foreground">{user.email || "—"}</td>

      {/* Role */}
      <td className="capitalize">{user.role}</td>

      {/* Status */}
      <td className="capitalize">{user.status}</td>

      {/* Joined */}
      <td className="text-xs text-muted-foreground">
        {new Date(user.created_at).toLocaleDateString()}
      </td>

      {/* Actions */}
      <td className="text-left pr-3">
        <EditUserDialog user={user}>
          <Button variant="outline" size="sm" className="cursor-pointer">
            Edit
          </Button>
        </EditUserDialog>
      </td>
    </tr>
  );
}
