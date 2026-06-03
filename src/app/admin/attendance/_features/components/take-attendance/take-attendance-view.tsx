"use client";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import { toast } from "sonner";

import { Button } from "@/src/components/ui/button";

import { ChevronLeft, Loader } from "lucide-react";

import { useAttendanceBatches } from "../../hooks/use-attendance-batches";
import { useAttendanceSession } from "../../hooks/use-attendance-session";
import { useOpenAttendanceSession } from "../../hooks/use-open-attendance-session";

import { AttendanceBatchSelector } from "./attendance-batch-selector";
import { AttendanceEditor } from "./attendance-editor";

import { AttendanceEmptyState } from "../shared/attendance-empty-state";
import { useState } from "react";

export function TakeAttendanceView() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const sessionId = searchParams.get("sessionId");

  const [batchId, setBatchId] = useState("");

  const { data: batches = [], isLoading: isLoadingBatches } =
    useAttendanceBatches();

  const openSessionMutation = useOpenAttendanceSession();

  const {
    data: session,
    isLoading: isLoadingSession,
    error,
  } = useAttendanceSession(sessionId ?? undefined);

  async function handleOpenAttendance() {
    if (!batchId) {
      return;
    }

    try {
      const result = await openSessionMutation.mutateAsync({
        batch_id: batchId,
      });

      const params = new URLSearchParams(searchParams.toString());

      params.set("sessionId", result.sessionId);

      router.replace(`/admin/attendance?${params.toString()}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to open attendance session",
      );
    }
  }

  function handleBack() {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("sessionId");

    router.replace(`/admin/attendance?${params.toString()}`);
  }

  if (!sessionId) {
    return (
      <div className="space-y-6">
        <AttendanceBatchSelector
          batches={batches}
          value={batchId}
          onChange={setBatchId}
          onOpen={handleOpenAttendance}
          isLoading={openSessionMutation.isPending}
          isLoadingBatches={isLoadingBatches}
        />
      </div>
    );
  }

  if (isLoadingSession) {
    return (
      <div className="flex h-full justify-center py-20">
        <Loader className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <AttendanceEmptyState
        title="Unable to load attendance"
        description="Something went wrong while loading this session."
      />
    );
  }

  if (!session) {
    return (
      <AttendanceEmptyState
        title="Attendance session not found"
        description="The selected session may have been removed."
      />
    );
  }
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={handleBack} className="w-fit">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Batches
      </Button>

      <AttendanceEditor session={session} />
    </div>
  );
}
