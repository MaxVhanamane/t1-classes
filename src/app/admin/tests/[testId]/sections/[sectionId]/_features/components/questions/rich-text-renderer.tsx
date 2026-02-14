"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

import { cn } from "@/src/lib/utils";

/* ---------------------------------- */
/* Props                              */
/* ---------------------------------- */

interface Props {
  content: string;
  clamp?: boolean;

  /** Enables prose typography styles */
  proseStyle?: boolean;

  /** Optional wrapper classes */
  className?: string;
}

/* ---------------------------------- */
/* Component                          */
/* ---------------------------------- */

export function RichTextRenderer({
  content,
  clamp = false,
  proseStyle = false,
  className,
}: Props) {
  const lastContentRef = useRef<string>("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: false,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    editable: false,
    immediatelyRender: false,
  });

  /* ---------------------------------- */
  /* Sync content updates               */
  /* ---------------------------------- */

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

  /* ---------------------------------- */
  /* Classes                            */
  /* ---------------------------------- */

  const wrapperClass = cn(
    "max-w-none",

    // prose styles
    proseStyle && "prose prose-sm dark:prose-invert",

    // clamp
    clamp && "line-clamp-2",

    // external override
    className,
  );

  /* ---------------------------------- */
  /* Render                             */
  /* ---------------------------------- */

  return (
    <div className={wrapperClass}>
      <EditorContent editor={editor} />
    </div>
  );
}
