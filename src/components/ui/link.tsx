import NextLink, { LinkProps } from "next/link";

export function Link({
  prefetch = false,
  ...props
}: LinkProps & { children: React.ReactNode; className?: string }) {
  return <NextLink prefetch={prefetch} {...props} />;
}
