import { Input } from "@/src/components/ui/input";

export function MoneyInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input
      {...props}
      inputMode="numeric"
      pattern="[0-9]*"
      onKeyDown={(e) => {
        if ([".", "-", "+"].includes(e.key)) {
          e.preventDefault();
        }
      }}
    />
  );
}
