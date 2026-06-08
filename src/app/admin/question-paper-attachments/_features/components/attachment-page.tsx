"use client";

import { useState } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";

import { AttachmentFilters } from "./attachment-filters";
import { AttachmentTable } from "./attachment-table";

import { useBatches } from "../hooks/use-batches";
import { useCourses } from "../hooks/use-courses";
import { DEFAULT_ATTACHMENT_FILTERS } from "../constants/attachment.constants";
import { ArrowLeft, Loader } from "lucide-react";
import { Link } from "@/src/components/ui/link";
import { Button } from "@/src/components/ui/button";
import { Pagination } from "@/src/components/ui/pagination/pagination";

export function AttachmentPage() {
  const [type, setType] = useState<"batches" | "courses">("batches");

  const [filters, setFilters] = useState(DEFAULT_ATTACHMENT_FILTERS);

  const [searchInput, setSearchInput] = useState("");

  const batchesQuery = useBatches(filters, type === "batches");

  const coursesQuery = useCourses(filters, type === "courses");

  const data = type === "batches" ? batchesQuery.data : coursesQuery.data;

  const isLoading =
    type === "batches" ? batchesQuery.isLoading : coursesQuery.isLoading;

  const error = type === "batches" ? batchesQuery.error : coursesQuery.error;
  const isFetching =
    type === "batches" ? batchesQuery.isFetching : coursesQuery.isFetching;
  return (
    <div className="space-y-6 p-4 md:p-6">
      <Link href="/admin/question-papers">
        <Button variant="ghost" className="mb-2 -ml-3">
          <ArrowLeft className="mr-2 size-4" />
          Back to Question Papers
        </Button>
      </Link>
      <div>
        <h1 className="text-2xl font-semibold">Attach Question Papers</h1>

        <p className="text-muted-foreground text-sm">
          Attach question papers to courses and batches.
        </p>
      </div>

      <Tabs
        value={type}
        onValueChange={(value) => {
          setType(value as "batches" | "courses");

          setFilters(DEFAULT_ATTACHMENT_FILTERS);

          setSearchInput("");
        }}
      >
        <TabsList>
          <TabsTrigger value="batches">Batches</TabsTrigger>

          <TabsTrigger value="courses">Courses</TabsTrigger>
        </TabsList>
      </Tabs>

      <AttachmentFilters
        filters={filters}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onFiltersChange={setFilters}
      />

      {error instanceof Error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {error.message}
        </div>
      ) : (
        <>
          <div className="flex h-6 items-center justify-between">
            <h2 className="text-sm font-medium">
              {type === "batches" ? "Batches" : "Courses"}
            </h2>

            <div
              className={
                isFetching
                  ? "flex items-center gap-2 opacity-100 transition-opacity duration-200"
                  : "flex items-center gap-2 opacity-0 transition-opacity duration-200"
              }
            >
              <Loader className="size-4 animate-spin" />

              <span className="text-muted-foreground text-sm">
                Updating results...
              </span>
            </div>
          </div>
          <div
            className={
              isFetching
                ? "opacity-60 transition-opacity"
                : "opacity-100 transition-opacity"
            }
          >
            <AttachmentTable
              type={type}
              items={data?.items ?? []}
              isLoading={isLoading}
            />
          </div>

          {data && data.totalPages > 1 && (
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              totalCount={data.totalCount}
              pageSize={data.pageSize}
              onPageChange={(page) =>
                setFilters((prev) => ({
                  ...prev,
                  page,
                }))
              }
            />
          )}
        </>
      )}
    </div>
  );
}
