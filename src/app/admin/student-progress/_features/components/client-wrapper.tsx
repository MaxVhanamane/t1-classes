"use client";

import { useState } from "react";
import { Users, LineChart, Search, GraduationCap } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Input } from "@/src/components/ui/input";
import DottedBackground from "@/src/components/dotted-background";
import { LoadingIndicator } from "@/src/components/ui/loading/loading-indicator";
import { Link } from "@/src/components/ui/link";
import { cn } from "@/src/lib/utils";

import { useBatchesIncludingInactive } from "@/src/hooks/use-batches-including-inactive";
import { useBatchStudents } from "../hooks/use-batch-students";
import { Pagination } from "@/src/components/ui/pagination/pagination";

export function StudentProgressClient() {
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  // Search & Pagination State
  const [searchInput, setSearchInput] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Handle manual search trigger
  function handleSearch() {
    setSubmittedSearch(searchInput.trim());
    setPage(1);
  }

  // Handle batch selection
  function handleBatchSelect(batchId: string) {
    setSelectedBatchId(batchId);
    setSearchInput("");
    setSubmittedSearch("");
    setPage(1);
  }

  // Queries
  const { data: batches = [], isLoading: isLoadingBatches } =
    useBatchesIncludingInactive();

  const {
    data: paginatedData,
    isLoading: isLoadingStudents,
    isFetching: isFetchingStudents,
  } = useBatchStudents(selectedBatchId, page, submittedSearch);

  const students = paginatedData?.items ?? [];
  const totalCount = paginatedData?.totalCount ?? 0;
  const totalPages = paginatedData?.totalPages ?? 0;
  const pageSize = paginatedData?.pageSize ?? 50;

  return (
    <div className="space-y-6 p-2 sm:p-4 md:p-6 max-w-6xl mx-auto pb-24">
      {/* Header & Select */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
            Student Progress
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Select a batch to view individual student performance and insights.
          </p>
        </div>

        <div className="w-full md:w-[320px]">
          {isLoadingBatches ? (
            <Skeleton className="flex items-center h-9 w-full rounded-lg px-4 border border-border/60">
              <span className="text-muted-foreground text-sm">
                Loading batches...
              </span>
            </Skeleton>
          ) : (
            <Select
              value={selectedBatchId ?? ""}
              onValueChange={handleBatchSelect}
            >
              <SelectTrigger className="w-full bg-background border-border/60 shadow-none rounded-lg text-base">
                <SelectValue placeholder="Select a batch..." />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem
                    key={batch.id}
                    value={batch.id}
                    className="py-2.5"
                  >
                    {batch.title}{" "}
                    {!batch.is_active && (
                      <span className="text-muted-foreground text-xs ml-1">
                        (Inactive)
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Main Dashboard Canvas */}
      <div className="mt-8">
        {!selectedBatchId ? (
          <div className="flex flex-col items-center justify-center py-32 text-center fade-in border border-border border-dashed rounded-xl bg-card relative overflow-hidden">
            <DottedBackground />
            <div className="bg-muted-soft p-5 rounded-2xl border border-border/40 mb-5 z-10">
              <Users className="size-10 text-primary/40" />
            </div>
            <h3 className="text-xl font-semibold text-foreground tracking-tight z-10">
              No Batch Selected
            </h3>
            <p className="text-muted-foreground max-w-sm mt-2 leading-relaxed z-10">
              Select a batch from the dropdown above to view all enrolled
              students and their performance reports.
            </p>
          </div>
        ) : isLoadingStudents && !paginatedData ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] w-full">
            <LoadingIndicator message="Loading enrolled students..." />
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-500">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border/70 shadow-sm">
              <div className="flex w-full sm:max-w-md gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    className="pl-9 h-10 bg-background shadow-none"
                  />
                </div>
                <Button onClick={handleSearch} className="h-10 px-6">
                  Search
                </Button>
              </div>
            </div>

            {/* Students Table */}
            <div
              className={cn(
                "rounded-xl border border-border/70 bg-card overflow-hidden shadow-sm transition-opacity duration-300",
                isFetchingStudents && !isLoadingStudents
                  ? "opacity-60 pointer-events-none"
                  : "opacity-100",
              )}
            >
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="hover:bg-transparent border-border/60">
                    <TableHead className="w-[50px] sm:w-[100px] text-center font-semibold px-2 sm:px-4">
                      <span className="sm:hidden">R.N</span>
                      <span className="hidden sm:inline">Roll No.</span>
                    </TableHead>
                    <TableHead className="font-semibold px-2 sm:px-4">
                      Student
                    </TableHead>
                    <TableHead className="text-right font-semibold pr-4 sm:pr-6">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-48 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          {submittedSearch ? (
                            <>
                              <Search className="h-6 w-6 mb-3 opacity-30" />
                              <p className="text-foreground font-medium">
                                No results found
                              </p>
                              <p className="text-sm mt-1">
                                We couldn&apos;t find anyone matching &quot;
                                {submittedSearch}&quot;.
                              </p>
                            </>
                          ) : (
                            <>
                              <GraduationCap className="h-8 w-8 mb-3 opacity-30" />
                              <p className="text-foreground font-medium">
                                No students enrolled
                              </p>
                              <p className="text-sm mt-1">
                                This batch currently has no active students.
                              </p>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    students.map((student) => (
                      <TableRow
                        key={student.enrollmentId}
                        className="group hover:bg-muted/20 transition-colors"
                      >
                        {/* 1. Roll No */}
                        <TableCell className="text-center font-medium tabular-nums text-muted-foreground px-2 sm:px-4 text-xs sm:text-sm">
                          {student.rollNumber ?? "-"}
                        </TableCell>

                        {/* 2. Student Identity & Status integrated elegantly */}
                        <TableCell className="px-2 sm:px-4">
                          <div className="flex flex-col min-w-0 max-w-[160px] sm:max-w-[400px]">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground truncate block text-xs sm:text-sm">
                                {student.user.fullName}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "h-4.5 px-1.5 text-[9px] uppercase font-bold tracking-wider border-0 shadow-none shrink-0",
                                  student.isActive
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
                                )}
                              >
                                {student.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <span className="text-[10px] sm:text-xs text-muted-foreground truncate block mt-0.5">
                              {student.user.email}
                            </span>
                          </div>
                        </TableCell>

                        {/* 3. Action */}
                        <TableCell className="text-right pr-2 sm:pr-4">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg px-2 sm:px-3 text-xs font-medium border-border/50 bg-background shadow-sm hover:shadow hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all duration-300 group"
                          >
                            <Link
                              href={`/admin/students/${student.userId}/batches/${selectedBatchId}/performance`}
                            >
                              <LineChart className="sm:mr-2 h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
                              <span className="hidden sm:inline tracking-tight">
                                Performance
                              </span>
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Component */}
            {totalPages > 1 && (
              <div className="pt-2">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  itemLabel="students"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
