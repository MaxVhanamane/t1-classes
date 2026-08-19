"use client";

import { Eye, FileCheck2, FileText, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { LoadingIndicator } from "@/src/components/ui/loading/loading-indicator";

import type { HomeworkMaterial } from "../types/homework";
import { formatFileSize } from "@/src/lib/helper-functions/format-file-size";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

type HomeworkMaterialsTableProps = {
  hasActiveFilters: boolean;
  items: HomeworkMaterial[];
  isLoading: boolean;
  onEdit: (material: HomeworkMaterial) => void;
  onDelete: (material: HomeworkMaterial) => void;
  onView: (material: HomeworkMaterial, type: "question" | "solution") => void;
};

function truncateText(value: string, maxLength = 50) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
}

export function HomeworkMaterialsTable({
  items,
  isLoading,
  onEdit,
  onDelete,
  onView,
  hasActiveFilters,
}: HomeworkMaterialsTableProps) {
  if (isLoading) {
    return (
      <LoadingIndicator className="mt-16" message="Loading materials..." />
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border">
        <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <FileText className="text-muted-foreground size-10" />
          <div>
            <h3 className="font-medium">
              {!hasActiveFilters ? "No materials yet" : "No results found"}
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {!hasActiveFilters
                ? "Upload the first DPP or Assignment for this chapter."
                : "Try adjusting your filters or search."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Added On</TableHead>
            <TableHead className="w-32 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((material) => (
            <TableRow key={material.id}>
              <TableCell className="max-w-sm">
                <div className="truncate font-medium flex items-center gap-2">
                  {material.title}
                  {material.solution_file_path && (
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20"
                    >
                      Solution
                    </Badge>
                  )}
                </div>
                {material.description && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-left text-xs font-normal text-muted-foreground"
                      >
                        {truncateText(material.description, 40)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="max-w-sm">
                      <p className="text-sm whitespace-pre-wrap">
                        {material.description}
                      </p>
                    </PopoverContent>
                  </Popover>
                )}
              </TableCell>

              <TableCell>
                <Badge
                  variant={
                    material.homework_type === "dpp" ? "default" : "secondary"
                  }
                >
                  {material.homework_type === "dpp" ? "DPP" : "Assignment"}
                </Badge>
              </TableCell>

              <TableCell>
                <span className="capitalize text-sm">
                  {material.difficulty}
                </span>
              </TableCell>

              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-muted-foreground decoration-dotted underline-offset-2">
                        {[
                          formatFileSize(material.file_size),
                          material.solution_file_size
                            ? formatFileSize(material.solution_file_size)
                            : null,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1 text-xs">
                        <p>
                          <span className="font-medium">Question:</span>{" "}
                          {formatFileSize(material.file_size)}
                        </p>
                        {material.solution_file_size && (
                          <p>
                            <span className="font-medium">Solution:</span>{" "}
                            {formatFileSize(material.solution_file_size)}
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>
                {new Date(material.created_at).toLocaleDateString()}
              </TableCell>

              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button
                    onClick={() => onView(material, "question")}
                    variant="ghost"
                    size="icon"
                    title="View Question PDF"
                  >
                    <Eye className="size-4" />
                  </Button>

                  {material.solution_file_path && (
                    <Button
                      onClick={() => onView(material, "solution")}
                      variant="ghost"
                      size="icon"
                      title="View Solution PDF"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <FileCheck2 className="size-4" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(material)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(material)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
