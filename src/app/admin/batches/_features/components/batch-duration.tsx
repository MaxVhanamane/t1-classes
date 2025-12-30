import { format } from "date-fns";

type Props = {
  start_date?: string | null;
  end_date?: string | null;
  duration?: number | null;
};

export function BatchDuration({ start_date, end_date, duration }: Props) {
  if (start_date || end_date) {
    return (
      <span className="text-sm">
        {start_date ? format(new Date(start_date), "dd MMM yyyy") : "—"}
        {" → "}
        {end_date ? format(new Date(end_date), "dd MMM yyyy") : "—"}
      </span>
    );
  }

  if (duration) {
    return <span className="text-sm">{duration} months</span>;
  }

  return <span className="text-muted-foreground">—</span>;
}
