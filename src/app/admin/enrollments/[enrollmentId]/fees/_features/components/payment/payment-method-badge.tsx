import { Badge } from "@/src/components/ui/badge";
import { HelpCircle } from "lucide-react";
import { PAYMENT_METHODS } from "./constants/payment-methods";

interface Props {
  method: string;
}

export function PaymentMethodBadge({ method }: Props) {
  const config = PAYMENT_METHODS.find((m) => m.value === method);

  const Icon = config?.icon ?? HelpCircle;
  const label = config?.label ?? method;

  return (
    <Badge variant="secondary" className="flex items-center gap-1">
      <Icon className="h-3.5 w-3.5" />
      <span className="text-xs">{label}</span>
    </Badge>
  );
}
