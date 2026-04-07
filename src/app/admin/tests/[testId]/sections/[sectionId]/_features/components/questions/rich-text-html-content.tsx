import { JSONContent } from "@tiptap/react";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Mathematics from "@tiptap/extension-mathematics";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";

import { cn } from "@/src/lib/utils";

type StyleVariant = "rich-content" | "prose";

interface Props {
  content: JSONContent;
  clamp?: boolean;
  variant?: StyleVariant;
  className?: string;
}

export function RichTextHTMLContent({
  content,
  clamp = false,
  variant = "rich-content",
  className,
}: Props) {
  const isProse = variant === "prose";

  // Generate HTML on server
  const html = generateHTML(
    content ?? {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    [
      StarterKit,
      Image,
      Subscript,
      Superscript,
      Mathematics,
      TableKit.configure({
        table: {
          HTMLAttributes: {
            class: "tiptap-table",
          },
        },
      }),
    ],
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
