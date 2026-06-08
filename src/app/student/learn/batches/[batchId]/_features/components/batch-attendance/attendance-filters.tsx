"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

type Month = {
  value: string;
  label: string;
};

type Props = {
  months: Month[];

  years: string[];

  selectedMonth: string;

  selectedYear: string;

  onMonthChange: (value: string) => void;

  onYearChange: (value: string) => void;
};

export function AttendanceFilters({
  months,
  years,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-bold">Attendance</h2>

        <p className="text-muted-foreground text-sm">
          Track your monthly performance
        </p>
      </div>

      <div className="flex gap-2">
        <Select value={selectedMonth} onValueChange={onMonthChange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedYear} onValueChange={onYearChange}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
