"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { CalendarPlus } from "lucide-react";

import { ScheduleTestDialog } from "../../_features/components/ScheduleTestDialog";
import { PagedTests } from "../../_features/types/test-pagination.types";
import { TestRow } from "../../../_features/types/test.types";

interface Props {
  data: PagedTests<TestRow>;
  search: string;
}

export function ScheduleTestsClient({ data, search }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  const { items, page, pageSize, total, hasMore } = data;
  const totalPages = Math.ceil(total / pageSize);

  function setParam(key: string, value: string) {
    const sp = new URLSearchParams(params.toString());
    sp.set(key, value);
    router.push(`?${sp.toString()}`);
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search tests..."
          defaultValue={search}
          className="max-w-sm"
          onChange={(e) => {
            setParam("q", e.target.value);
            setParam("page", "1");
          }}
        />
      </div>

      {/* List */}
      <div className="space-y-3">
        {items.map((test) => (
          <Card key={test.id} className="p-4 transition hover:bg-muted/40">
            <div className="grid grid-cols-[1fr_auto] items-center gap-4">
              <div className="min-w-0 space-y-1">
                <div className="truncate font-medium">{test.title}</div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{test.test_type}</Badge>
                  {test.is_locked && <Badge variant="secondary">Locked</Badge>}
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                disabled={test.is_locked}
                className="flex items-center gap-2"
                onClick={() => setSelectedTest(test.id)}
              >
                <CalendarPlus className="h-4 w-4" />
                Schedule
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          disabled={page <= 1}
          onClick={() => setParam("page", String(page - 1))}
        >
          Previous
        </Button>

        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>

        <Button
          variant="outline"
          disabled={!hasMore}
          onClick={() => setParam("page", String(page + 1))}
        >
          Next
        </Button>
      </div>

      {/* Dialog */}
      {selectedTest && (
        <ScheduleTestDialog
          testId={selectedTest}
          open={true}
          onOpenChange={(v) => {
            if (!v) setSelectedTest(null);
          }}
        />
      )}
    </div>
  );
}
