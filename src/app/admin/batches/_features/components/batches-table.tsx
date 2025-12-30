import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Button } from "@/src/components/ui/button";
import { SquarePen } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

import { ModeBadge, StatusBadge } from "./batch-badges";
import { BatchDuration } from "./batch-duration";
import { BatchListItem } from "../types/types";
import { BatchActiveSwitch } from "./batch-active-switch";
import { Badge } from "@/src/components/ui/badge";
import { truncateWords } from "../helper-functions/functions";
type Props = {
  batches: BatchListItem[];
  onEdit: (batch: BatchListItem) => void;
};

export function BatchesTable({ batches, onEdit }: Props) {
  return (
    <TooltipProvider>
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Center</TableHead>
              <TableHead>Languages</TableHead>
              <TableHead>Admission</TableHead>
              <TableHead className="text-center">Mode</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-center">Capacity</TableHead>
              <TableHead className="text-center">Active</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {batches.map((batch) => (
              <TableRow key={batch.id}>
                <TableCell className="font-medium">{batch.name}</TableCell>
                <TableCell className="font-medium">
                  {batch.description ? (
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <p className="text-xs text-muted-foreground cursor-default">
                          {truncateWords(batch.description, 3)}
                        </p>
                      </TooltipTrigger>

                      <TooltipContent align="start" className="max-w-xs">
                        <p className="text-sm">{batch.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>

                <TableCell>
                  {batch.course_info ? (
                    <span className="text-muted-foreground">
                      {batch.course_info.title}
                    </span>
                  ) : (
                    <span className="text-xs text-destructive font-medium">
                      Course missing
                    </span>
                  )}
                </TableCell>
                {/* Center */}
                <TableCell>
                  {batch.center_name ?? (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>

                {/* Languages */}
                <TableCell>
                  {batch.languages.length === 0 ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 cursor-default">
                          <Badge variant="secondary" className="capitalize">
                            {batch.languages[0]}
                          </Badge>

                          {batch.languages.length > 1 && (
                            <span className="text-xs text-muted-foreground">
                              +{batch.languages.length - 1} more
                            </span>
                          )}
                        </div>
                      </TooltipTrigger>

                      <TooltipContent align="start">
                        <div className="space-y-1">
                          {batch.languages.map((lang) => (
                            <div key={lang} className="capitalize text-sm">
                              {lang}
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TableCell>

                {/* Admission */}
                <TableCell>
                  {batch.admission_open ? (
                    <Badge variant="outline">Open</Badge>
                  ) : (
                    <Badge variant="secondary">Closed</Badge>
                  )}
                </TableCell>

                <TableCell className="text-center">
                  <ModeBadge mode={batch.mode} />
                </TableCell>

                <TableCell className="text-center">
                  <StatusBadge status={batch.status} />
                </TableCell>

                <TableCell>
                  <BatchDuration {...batch} />
                </TableCell>

                <TableCell className="text-center">
                  {batch.capacity ?? "Unlimited"}
                </TableCell>

                <TableCell className="text-center">
                  <BatchActiveSwitch
                    batchId={batch.id}
                    initialValue={batch.is_active}
                  />
                </TableCell>

                <TableCell className="text-right">
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="cursor-pointer"
                        onClick={() => onEdit(batch)}
                      >
                        <SquarePen className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit batch</TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
