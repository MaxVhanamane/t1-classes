"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Pagination } from "@/src/components/ui/pagination/pagination";

import { DEFAULT_HOMEWORK_CHAPTER_FILTERS } from "../constants/homework.constants";
import { useHomeworkChapters } from "../hooks/use-homework-chapters";

import { HomeworkChapterFiltersBar } from "./homework-chapters-filters";
import { HomeworkChaptersTable } from "./homework-chapters-table";
import { HomeworkChapterDialog } from "./homework-chapter-dialog";
import { HomeworkChapterDeleteDialog } from "./homework-chapter-delete-dialog";
import { HomeworkChapter } from "../../[chapterId]/_features/types/homework";

export function HomeworkChaptersPage() {
  const [filters, setFilters] = useState(DEFAULT_HOMEWORK_CHAPTER_FILTERS);
  const [searchInput, setSearchInput] = useState("");

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedChapter, setSelectedChapter] = useState<
    HomeworkChapter | undefined
  >();
  const [chapterToDelete, setChapterToDelete] = useState<
    HomeworkChapter | undefined
  >();

  const { data, isLoading, error } = useHomeworkChapters(filters);

  function handleEdit(chapter: HomeworkChapter) {
    setSelectedChapter(chapter);
    setEditDialogOpen(true);
  }

  function handleDelete(chapter: HomeworkChapter) {
    setChapterToDelete(chapter);
    setDeleteDialogOpen(true);
  }

  function handleEditDialogChange(open: boolean) {
    setEditDialogOpen(open);
    if (!open) setSelectedChapter(undefined);
  }

  function handleDeleteDialogChange(open: boolean) {
    setDeleteDialogOpen(open);
    if (!open) setChapterToDelete(undefined);
  }

  return (
    <>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center mb-1">
              <h1 className="text-2xl font-semibold">Manage Chapters</h1>
            </div>
            <p className="text-muted-foreground text-sm ml-10">
              Create and organize subjects into chapters before uploading
              homework.
            </p>
          </div>

          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            Create Chapter
          </Button>
        </div>

        <HomeworkChapterFiltersBar
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
            <HomeworkChaptersTable
              items={data?.items ?? []}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {data && data.totalPages > 1 && (
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                totalCount={data.totalCount}
                pageSize={data.pageSize}
                onPageChange={(page) =>
                  setFilters((prev) => ({ ...prev, page }))
                }
              />
            )}
          </>
        )}
      </div>

      <HomeworkChapterDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <HomeworkChapterDialog
        open={editDialogOpen}
        onOpenChange={handleEditDialogChange}
        chapter={selectedChapter}
      />

      <HomeworkChapterDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogChange}
        chapter={chapterToDelete}
      />
    </>
  );
}
