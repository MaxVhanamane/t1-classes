import { format } from "date-fns";

export function DateTimeCell({ value }: { value: string }) {
  const date = new Date(value);

  return (
    <div className="space-y-0.5">
      <p className="text-sm ">{format(date, "dd MMM yyyy")}</p>

      <p className="text-xs text-muted-foreground">{format(date, "hh:mm a")}</p>
    </div>
  );
}
