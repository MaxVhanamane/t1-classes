import NextLink, { LinkProps } from "next/link";
import { AnchorHTMLAttributes, ReactNode } from "react";

type Props = LinkProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: ReactNode;
  };

export function Link({ prefetch = false, children, ...props }: Props) {
  return (
    <NextLink prefetch={prefetch} {...props}>
      {children}
    </NextLink>
  );
}
