"use client";

import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Mathematics from "@tiptap/extension-mathematics";
import Image from "@tiptap/extension-image";
import { cn } from "@/src/lib/utils";
import { TableKit } from "@tiptap/extension-table";
import { useEffect, useRef } from "react";

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
    extensions: [
      StarterKit,
      Image,
      Subscript,
      Superscript,
      Mathematics,
      TableKit.configure({
        table: {
          HTMLAttributes: { class: "tiptap-table" },
        },
      }),
    ],
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
    <div className={cn(clamp && "line-clamp-2", className)}>
      <EditorContent editor={editor} />
    </div>
  );
}
