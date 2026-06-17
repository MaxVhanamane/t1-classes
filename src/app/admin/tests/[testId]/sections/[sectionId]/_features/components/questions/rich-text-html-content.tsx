import { JSONContent } from "@tiptap/react";
import { generateHTML } from "@tiptap/html";

import { cn } from "@/src/lib/utils";
import { TiptapExtensions } from "@/src/lib/rich-text/tiptap-extensions";
import { useMemo } from "react";

type StyleVariant = "rich-content" | "prose";

interface Props {
  content: JSONContent;
  clamp?: boolean;
  variant?: StyleVariant;
  className?: string;
}

const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export function RichTextHTMLContent({
  content,
  clamp = false,
  variant = "rich-content",
  className,
}: Props) {
  const isProse = variant === "prose";

  // Generate HTML on server
  const html = useMemo(
    () => generateHTML(content ?? EMPTY_DOC, TiptapExtensions),
    [content],
  );

  return (
    <div
      className={cn(
        "max-w-none",
        isProse ? "prose prose-sm dark:prose-invert" : "rich-content",
        clamp && "line-clamp-2",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
