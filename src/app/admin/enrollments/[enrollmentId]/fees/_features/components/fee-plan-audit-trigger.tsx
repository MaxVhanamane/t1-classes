"use client";

import { useState } from "react";
import { AuditDetailsDialog } from "./audit-detail-dialog";
import { Button } from "@/src/components/ui/button";

interface Props {
  createdBy: string;
  updatedBy?: string | null;
}

export function FeePlanAuditTrigger({ createdBy, updatedBy }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="link"
        type="button"
        className="p-0 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        View audit details
      </Button>

      <AuditDetailsDialog
        open={open}
        onClose={() => setOpen(false)}
        createdBy={createdBy}
        updatedBy={updatedBy}
      />
    </>
  );
}
