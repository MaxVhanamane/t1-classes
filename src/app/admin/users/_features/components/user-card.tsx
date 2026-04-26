"use client";

import { AppUser } from "@/src/types/user";
import EditUserDialog from "./edit-user-dialog";
import { Button } from "../../../../../components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";

export default function UserCard({ user }: { user: AppUser }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div>
          <div className="font-medium">{user.full_name || "Unnamed"}</div>
          <div className="text-sm text-muted-foreground">
            {user.phone || "No phone"}
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Role</span>
          <span className="capitalize">{user.role}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Status</span>
          <span className="capitalize">{user.status}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Joined</span>
          <span>{new Date(user.created_at).toLocaleDateString()}</span>
        </div>

        <EditUserDialog user={user}>
          <Button variant="outline" size="sm" className="w-full cursor-pointer">
            Edit
          </Button>
        </EditUserDialog>
      </CardContent>
    </Card>
  );
}
