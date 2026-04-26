"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/src/components/ui/button";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/src/components/ui/input";
import { Search, X } from "lucide-react";
import { useMemo, useEffect } from "react";
import { InstructorDialog } from "./_features/components/instructor-dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/src/components/ui/alert-dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/src/components/ui/table";

import { Badge } from "@/src/components/ui/badge";
import { fetchWrapper, HttpError } from "@/src/lib/api/fetch-wrapper";
/* ---------------------------------- */
/* Types                              */
/* ---------------------------------- */

export type Instructor = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  qualification: string | null;
  bio: string | null;
  profile_image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/* ---------------------------------- */
/* Page                               */
/* ---------------------------------- */

export default function AdminInstructorsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedInstructor, setSelectedInstructor] =
    useState<Instructor | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);

  /* ---------------------------------- */
  /* Fetch Instructors                  */
  /* ---------------------------------- */

  const {
    data: instructors,
    isLoading,
    isError,
  } = useQuery<Instructor[]>({
    queryKey: ["admin-instructors"],
    queryFn: () => fetchWrapper<Instructor[]>("/api/admin/instructors"),
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250); // small debounce

    return () => clearTimeout(timer);
  }, [search]);

  const filteredInstructors = useMemo(() => {
    if (!instructors) return [];

    const sorted = [...instructors].sort((a, b) =>
      a.full_name.localeCompare(b.full_name),
    );

    if (!debouncedSearch.trim()) return sorted;

    return sorted.filter((inst) =>
      inst.full_name.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );
  }, [instructors, debouncedSearch]);

  /* ---------------------------------- */
  /* Delete Mutation                    */
  /* ---------------------------------- */

  const { mutate: deleteMutation, isPending } = useMutation({
    mutationFn: (id: string) =>
      fetchWrapper<{ success: true }>(`/api/admin/instructors/${id}`, {
        method: "DELETE",
      }),

    onSuccess: () => {
      toast.success("Instructor deleted");

      void queryClient.invalidateQueries({
        queryKey: ["admin-instructors"],
      });
    },
    onError: (error) => {
      if (
        error instanceof HttpError &&
        (error.status === 401 || error.status === 403)
      ) {
        return;
      }

      toast.error("Failed to delete instructor");
    },
  });

  /* ---------------------------------- */
  /* Loading / Error                    */
  /* ---------------------------------- */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-destructive">
        Failed to load instructors.
      </div>
    );
  }

  /* ---------------------------------- */
  /* UI                                 */
  /* ---------------------------------- */

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-semibold">Instructors</h1>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button
            onClick={() => {
              setSelectedInstructor(null);
              setDialogOpen(true);
            }}
          >
            Add Instructor
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Qualification</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredInstructors?.map((inst) => (
              <TableRow key={inst.id}>
                <TableCell className="font-medium">{inst.full_name}</TableCell>

                <TableCell>{inst.email ?? "-"}</TableCell>
                <TableCell>{inst.phone ?? "-"}</TableCell>

                <TableCell>{inst.qualification ?? "-"}</TableCell>

                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`font-medium ${
                      inst.is_active
                        ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {inst.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>

                <TableCell className="text-left space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedInstructor(inst);
                      setDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        Delete
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Instructor?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          remove <strong>{inst.full_name}</strong> from the
                          system.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation(inst.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}

            {filteredInstructors?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  {search
                    ? "No instructors match your search."
                    : "No instructors found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog */}
      <InstructorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        instructor={selectedInstructor}
      />
    </div>
  );
}
