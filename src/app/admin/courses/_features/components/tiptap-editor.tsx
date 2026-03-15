"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { Toggle } from "@/src/components/ui/toggle";
import { useEffect } from "react";

type Props = {
  initialValue: Record<string, unknown> | null;
  onChange: (value: Record<string, unknown>) => void;
  disabled?: boolean;
};

export function TipTapEditor({
  initialValue,
  onChange,
  disabled = false,
}: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: false,
    //  Initialize ONLY once
    content: initialValue ?? {
      type: "doc",
      content: [],
    },

    //  Send updates back to RHF
    onUpdate({ editor }) {
      onChange(editor.getJSON());
    },

    editorProps: {
      attributes: {
        class:
          "tiptap-editor min-h-[160px] px-3 py-2 text-sm " +
          "focus:outline-none bg-card text-foreground",
      },
    },
  });
  useEffect(() => {
    if (!editor) return;

    editor.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) return null;

  return (
    <div className="border rounded-md bg-card">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b p-1">
        <Toggle
          disabled={disabled}
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Toggle>

        <Toggle
          disabled={disabled}
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Toggle>

        <Toggle
          disabled={disabled}
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
        >
          <List className="h-4 w-4" />
        </Toggle>

        <Toggle
          disabled={disabled}
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
