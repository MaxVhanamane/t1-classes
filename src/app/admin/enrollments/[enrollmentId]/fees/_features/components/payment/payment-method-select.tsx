"use client";

import { Controller, Control } from "react-hook-form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/src/components/ui/select";
import { Label } from "@/src/components/ui/label";
import { PAYMENT_METHODS } from "./constants/payment-methods";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  name: string;
  label?: string;
  disabled?: boolean;
}

export function PaymentMethodSelect({
  control,
  name,
  label = "Payment Method",
  disabled,
}: Props) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>

            <SelectContent>
              {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>{label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
}
