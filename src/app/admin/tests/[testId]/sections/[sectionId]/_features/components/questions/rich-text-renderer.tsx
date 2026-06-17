"use client";

import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import { cn } from "@/src/lib/utils";
import { useEffect, useRef } from "react";
import { TiptapExtensions } from "@/src/lib/rich-text/tiptap-extensions";

type StyleVariant = "rich-content" | "prose";

interface Props {
  content: JSONContent;
  clamp?: boolean;
  variant?: StyleVariant;
  className?: string;
}

export function RichTextRenderer({
  content,
  clamp = false,
  variant = "rich-content", // default
  className,
}: Props) {
  const lastContentRef = useRef<JSONContent | null>(null);
  const isProse = variant === "prose";

  const editor = useEditor({
    extensions: TiptapExtensions,
    content: content ?? {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "max-w-none cursor-default",
          isProse ? "prose prose-sm dark:prose-invert" : "rich-content",
          className,
        ),
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (lastContentRef.current !== content) {
      editor.commands.setContent(content, {
        emitUpdate: false,
      });

      lastContentRef.current = content;
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className={cn(clamp && "line-clamp-2")}>
      <EditorContent editor={editor} />
    </div>
  );
}
