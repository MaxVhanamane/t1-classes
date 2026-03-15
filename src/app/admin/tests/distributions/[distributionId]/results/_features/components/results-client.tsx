"use client";

import { useState } from "react";
import { ResultsToolbar } from "./results-toolbar";
import { ResultsTable } from "./results-table";
import { ResultsSort } from "../types/results.types";

export function ResultsClient({ distributionId }: { distributionId: string }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ResultsSort>("name");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  return (
    <>
      <ResultsToolbar
        search={search}
        sort={sort}
        pageSize={pageSize}
        onSearch={(v) => {
          setPage(1);
          setSearch(v);
        }}
        onSort={(v) => {
          setPage(1);
          setSort(v);
        }}
        onPageSize={(v) => {
          setPage(1);
          setPageSize(v);
        }}
      />

      <ResultsTable
        distributionId={distributionId}
        search={search}
        sort={sort}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </>
  );
}
