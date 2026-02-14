"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Bold, Italic, List, Image as ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert min-h-[140px] focus:outline-none max-w-none",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <Card className="overflow-hidden pt-0">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b bg-muted/40 p-2 ">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => {
            const url = prompt("Paste image URL");
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.commands.clearContent()}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div className="p-3 relative">
        <EditorContent editor={editor} />
        {!value && placeholder && (
          <p className="pointer-events-none absolute top-4 left-4 text-sm text-muted-foreground">
            {placeholder}
          </p>
        )}
      </div>
    </Card>
  );
}
