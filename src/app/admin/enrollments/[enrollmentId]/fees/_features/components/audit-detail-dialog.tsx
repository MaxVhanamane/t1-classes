"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Separator } from "@/src/components/ui/separator";
import {
  getUserAuditInfo,
  UserAuditInfo,
} from "../actions/get-user-audit-info";
import { RoleBadge } from "./role-badge";

interface Props {
  open: boolean;
  onClose: () => void;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export function AuditDetailsDialog({
  open,
  onClose,
  createdBy,
  updatedBy,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState<UserAuditInfo | null>(null);
  const [updatedUser, setUpdatedUser] = useState<UserAuditInfo | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadAudit() {
      setLoading(true);
      try {
        if (createdBy) {
          const user = await getUserAuditInfo(createdBy);
          if (cancelled) return;

          setCreatedUser(user ?? null);

          // SAME USER → reuse for updated
          if (updatedBy === createdBy) {
            setUpdatedUser(user ?? null);
          }
        }

        // DIFFERENT USER → fetch separately
        if (updatedBy && updatedBy !== createdBy) {
          const user = await getUserAuditInfo(updatedBy);
          if (!cancelled) setUpdatedUser(user ?? null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    //I know this returns a promise, and I am intentionally not awaiting it
    void loadAudit();

    return () => {
      cancelled = true;
    };
  }, [open, createdBy, updatedBy]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Audit Details</DialogTitle>
        </DialogHeader>

        {loading && (
          <p className="text-sm text-muted-foreground">
            Loading audit details…
          </p>
        )}

        {!loading && (
          <div className="space-y-4 text-sm">
            {createdUser && (
              <div className="space-y-1">
                <p className="text-muted-foreground">Created by</p>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{createdUser.full_name}</span>
                  <RoleBadge role={createdUser.role} />
                </div>

                {!createdUser.is_active && (
                  <p className="text-xs text-destructive">Inactive user</p>
                )}
              </div>
            )}

            {updatedUser && (
              <>
                <Separator />

                <div className="space-y-1">
                  <p className="text-muted-foreground">Last updated by</p>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{updatedUser.full_name}</span>
                    <RoleBadge role={updatedUser.role} />
                  </div>

                  {!updatedUser.is_active && (
                    <p className="text-xs text-destructive">Inactive user</p>
                  )}
                </div>
              </>
            )}

            {!createdUser && !updatedUser && (
              <p className="text-sm text-muted-foreground">
                No audit information available.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
