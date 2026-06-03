"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

import { Button } from "@/src/components/ui/button";

import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";

import { Label } from "@/src/components/ui/label";

import {
  AttendanceStatus,
  AttendanceStudentSession,
} from "../../types/attendance";

type EditAttendanceDialogProps = {
  open: boolean;

  session: AttendanceStudentSession | null;

  isPending: boolean;

  onOpenChange: (open: boolean) => void;

  onSubmit: (attendanceRecordId: string, status: AttendanceStatus) => void;
};

function EditAttendanceDialogContent({
  session,
  isPending,
  onOpenChange,
  onSubmit,
}: {
  session: AttendanceStudentSession;

  isPending: boolean;

  onOpenChange: (open: boolean) => void;

  onSubmit: (attendanceRecordId: string, status: AttendanceStatus) => void;
}) {
  const [status, setStatus] = useState<AttendanceStatus>(session.status);

  const hasChanges = status !== session.status;

  const attendanceDate = new Date(session.attendance_date).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Edit Attendance</DialogTitle>

        <DialogDescription>
          Update the attendance status for this class.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5">
        <div>
          <p className="text-muted-foreground text-sm">Class Date</p>

          <p className="font-medium">{attendanceDate}</p>
        </div>

        <RadioGroup
          value={status}
          onValueChange={(value) => setStatus(value as AttendanceStatus)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="present" id="present" />

            <Label htmlFor="present">Present</Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="absent" id="absent" />

            <Label htmlFor="absent">Absent</Label>
          </div>
        </RadioGroup>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>

        <Button
          disabled={!hasChanges || isPending}
          onClick={() => onSubmit(session.attendance_record_id, status)}
        >
          Update Attendance
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function EditAttendanceDialog({
  open,
  session,
  isPending,
  onOpenChange,
  onSubmit,
}: EditAttendanceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {session && (
        <EditAttendanceDialogContent
          key={session.attendance_record_id}
          session={session}
          isPending={isPending}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      )}
    </Dialog>
  );
}
