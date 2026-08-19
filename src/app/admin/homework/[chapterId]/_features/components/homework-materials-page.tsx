"use client";

import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/src/components/ui/button";
import { Link } from "@/src/components/ui/link";
import { Pagination } from "@/src/components/ui/pagination/pagination";
import { PdfViewerDialog } from "@/src/components/ui/pdf/pdf-viewer-dialog";

import { DEFAULT_HOMEWORK_FILTERS } from "../constants/homework.constants";
import { useHomeworkMaterials } from "../hooks/use-homework-materials";
import { HomeworkMaterial, HomeworkMaterialFilters } from "../types/homework";
import { getPdfSignedUrl } from "@/src/app/admin/curriculum/[courseId]/_features/actions/topic/pdf/get-signed-pdf-url";

import { HomeworkMaterialFiltersBar } from "./homework-materials-filters";
import { HomeworkMaterialsTable } from "./homework-materials-table";
import { HomeworkMaterialDeleteDialog } from "./homework-material-delete-dialog";
import { HomeworkMaterialDialog } from "./homework-material-dialog";

export function ChapterMaterialsPage() {
  const { chapterId } = useParams() as { chapterId: string };

  const [filters, setFilters] = useState<HomeworkMaterialFilters>({
    ...DEFAULT_HOMEWORK_FILTERS,
    chapterId,
  });

  const [searchInput, setSearchInput] = useState("");

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerTitle, setViewerTitle] = useState<string | null>(null);
  const [viewerPdfUrl, setViewerPdfUrl] = useState<string | null>(null);

  const [selectedMaterial, setSelectedMaterial] = useState<
    HomeworkMaterial | undefined
  >();
  const [materialToDelete, setMaterialToDelete] = useState<
    HomeworkMaterial | undefined
  >();

  const { data, isLoading, error } = useHomeworkMaterials(filters);

  // 🔥 FIX: Stabilize the close function so it never triggers the PdfViewerDialog's useEffect twice
  const handleCloseViewer = useCallback(() => {
    setViewerOpen(false);
    setViewerTitle(null);
    setViewerPdfUrl(null);
  }, []);

  async function handleView(
    material: HomeworkMaterial,
    type: "question" | "solution",
  ) {
    try {
      const path =
        type === "solution" ? material.solution_file_path : material.file_path;
      if (!path) return;

      setViewerOpen(true);
      setViewerLoading(true);
      setViewerTitle(
        `${material.title} ${type === "solution" ? "(Solution)" : ""}`,
      );

      const url = await getPdfSignedUrl(path);
      setViewerPdfUrl(url);
    } catch {
      toast.error("Failed to load PDF");
      setViewerOpen(false);
    } finally {
      setViewerLoading(false);
    }
  }

  function handleEdit(material: HomeworkMaterial) {
    setSelectedMaterial(material);
    setEditDialogOpen(true);
  }

  function handleDelete(material: HomeworkMaterial) {
    setMaterialToDelete(material);
    setDeleteDialogOpen(true);
  }

  const hasActiveFilters = Boolean(
    filters.search || filters.homeworkType || filters.difficulty,
  );

  return (
    <>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link href="/admin/homework">
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
              <h1 className="text-2xl font-semibold">Chapter Materials</h1>
            </div>
            <p className="text-muted-foreground text-sm ml-10">
              Manage DPPs and Assignments for this specific chapter.
            </p>
          </div>

          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            Upload Material
          </Button>
        </div>

        <HomeworkMaterialFiltersBar
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
            <HomeworkMaterialsTable
              items={data?.items ?? []}
              isLoading={isLoading}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              hasActiveFilters={hasActiveFilters}
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

      <HomeworkMaterialDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <HomeworkMaterialDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setSelectedMaterial(undefined);
        }}
        material={selectedMaterial}
      />

      <HomeworkMaterialDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setMaterialToDelete(undefined);
        }}
        material={materialToDelete}
      />

      {viewerOpen && (
        <PdfViewerDialog
          title={viewerTitle}
          pdfUrl={viewerPdfUrl}
          loading={viewerLoading}
          onClose={handleCloseViewer}
        />
      )}
    </>
  );
}
