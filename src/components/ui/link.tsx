import NextLink, { LinkProps } from "next/link";
import { AnchorHTMLAttributes, ReactNode } from "react";

type Props = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    children: ReactNode;
  };

export function Link({ prefetch = false, children, ...props }: Props) {
  return (
    <NextLink prefetch={prefetch} {...props}>
      {children}
    </NextLink>
  );
}
