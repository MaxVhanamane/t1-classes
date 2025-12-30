"use client";

import { AppUser } from "@/src/types/user";
import { Button } from "../../button";
import EditUserDialog from "./edit-user-dialog";

export default function UserRow({ user }: { user: AppUser }) {
  return (
    <tr className="border-b last:border-0">
      <td className="p-3">
        <div className="font-medium">{user.full_name || "Unnamed"}</div>
        <div className="text-xs text-muted-foreground">
          {user.phone || "No phone"}
        </div>
      </td>

      <td className="capitalize">{user.role}</td>
      <td className="capitalize">{user.status}</td>

      <td className="text-xs text-muted-foreground">
        {new Date(user.created_at).toLocaleDateString()}
      </td>

      <td className="text-right pr-3">
        <EditUserDialog user={user}>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </EditUserDialog>
      </td>
    </tr>
  );
}
