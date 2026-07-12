"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Button } from "@/src/components/ui/button";

import { UserTableItem } from "../types/user-table";
import UserDialog from "./user-dialog";
import { ResendInviteAlert } from "./resent-invite-alert";
import { DeleteInvitedUserAlert } from "./delete-invited-user-alert";
import { SendResetPasswordConfirmationDialog } from "./send-reset-password-confirmation-dialog";

type Props = {
  users: UserTableItem[];
  isLoading: boolean;
  isFetching: boolean;
};

function getRoleVariant(
  role: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (role) {
    case "admin":
      return "destructive";
    case "teacher":
      return "default";
    default:
      return "secondary";
  }
}

function getStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "blocked":
      return "destructive";
    default:
      return "secondary";
  }
}

export default function UsersTable({ users, isLoading, isFetching }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Guardian</TableHead>
            <TableHead>Qualification</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[240px]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading &&
            Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                {Array.from({ length: 8 }).map((_, skeletonIndex) => (
                  <TableCell key={skeletonIndex}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading && users.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={8}
                className="h-32 text-center text-muted-foreground"
              >
                No users found
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            users.map((user) => {
              const isStudent = user.role === "student";
              const isStaff = user.role === "teacher" || user.role === "admin";

              return (
                <TableRow
                  key={user.id}
                  className={isFetching ? "opacity-60" : ""}
                >
                  <TableCell className="min-w-[220px]">
                    <div className="flex flex-col">
                      <span className="font-medium">{user.full_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.phone ?? "-"}</TableCell>
                  <TableCell>
                    {isStudent ? user.guardian_phone || "-" : "-"}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {isStaff ? user.qualification || "-" : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>

                  {/* Actions Column */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserDialog mode="edit" user={user}>
                        <Button size="sm" variant="outline" className="h-8">
                          Edit
                        </Button>
                      </UserDialog>

                      {/* Render Resend & Delete buttons ONLY if status is 'invited' */}
                      {user.status === "invited" && (
                        <>
                          <ResendInviteAlert
                            userEmail={user.email}
                            userId={user.id}
                          />
                          <DeleteInvitedUserAlert user={user} />
                        </>
                      )}
                      {user.status === "active" && (
                        <SendResetPasswordConfirmationDialog
                          userEmail={user.email}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </div>
  );
}
