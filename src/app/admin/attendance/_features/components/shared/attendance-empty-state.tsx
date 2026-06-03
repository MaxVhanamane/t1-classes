import { Card, CardContent } from "@/src/components/ui/card";

type AttendanceEmptyStateProps = {
  title: string;

  description: string;
};

export function AttendanceEmptyState({
  title,
  description,
}: AttendanceEmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex min-h-[280px] flex-col items-center justify-center text-center">
        <div className="max-w-sm space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>

          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
