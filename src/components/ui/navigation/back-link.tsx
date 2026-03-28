import { ArrowLeft } from "lucide-react";
import { Link } from "@/src/components/ui/link";

type BackLinkProps = {
  href: string;
  label: string;
  className?: string;
};

export function BackLink({ href, label, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground ${className ?? ""}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
