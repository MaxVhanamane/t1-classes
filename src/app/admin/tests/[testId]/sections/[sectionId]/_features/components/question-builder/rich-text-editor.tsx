"use client";

import { useState } from "react";
import {
  useEditor,
  EditorContent,
  JSONContent,
  useEditorState,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Mathematics from "@tiptap/extension-mathematics";
import { TableKit } from "@tiptap/extension-table";
import {
  Bold,
  Italic,
  List,
  Image as ImageIcon,
  RotateCcw,
  Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon,
  ListOrdered,
  TableIcon,
  Trash2,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { MathEquationModal } from "./math-equation-modal";
import { cn } from "@/src/lib/utils";

/* ------------------------------------------------------------
 * Toolbar presets
 * "question"    — full toolbar: bold, italic, lists, sub/super,
 *                 math, image, table, clear  (default)
 * "option"      — math-focused: bold, italic, sub/super, math only
 * "description" — basic: bold, italic, lists only
 * ---------------------------------------------------------- */
export type EditorToolbar =
  | "question"
  | "option"
  | "description"
  | "explanation";

/* ------------------------------------------------------------
 * Editor size presets
 * "sm" — single line height, for options         (~42px)
 * "md" — default, standard question height       (140px)
 * "lg" — large, for descriptions/explanations    (240px)
 * ---------------------------------------------------------- */
export type EditorSize = "sm" | "md" | "lg";

const sizeToMinHeight: Record<EditorSize, string> = {
  sm: "42px",
  md: "140px",
  lg: "240px",
};

interface Props {
  value: JSONContent;
  onChange: (value: JSONContent) => void;
  placeholder?: string;
  toolbar?: EditorToolbar;
  size?: EditorSize;
}

type MathMode = "inline" | "block";

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  toolbar = "question",
  size = "md",
}: Props) {
  const [mathMode, setMathMode] = useState<MathMode | null>(null);

  const minHeight = sizeToMinHeight[size];

  // Toolbar capability flags
  const showBasic =
    toolbar === "question" ||
    toolbar === "description" ||
    toolbar === "explanation";
  const showLists =
    toolbar === "question" ||
    toolbar === "description" ||
    toolbar === "explanation";
  const showSubSuper =
    toolbar === "question" || toolbar === "option" || toolbar === "explanation";
  const showMath =
    toolbar === "question" || toolbar === "option" || toolbar === "explanation";
  const showImage = toolbar === "question" || toolbar === "explanation";
  const showTable = toolbar === "question";
  const showClear = true;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      ...(showImage ? [Image] : []),
      ...(showSubSuper ? [Subscript, Superscript] : []),
      ...(showMath ? [Mathematics] : []),
      ...(showTable ? [TableKit.configure()] : []),
    ],
    content: value ?? {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    onUpdate({ editor }) {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: "rich-content focus:outline-none max-w-none cursor-text",
        style: `min-height: ${minHeight}`,
      },
    },
  });

  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      if (!ctx.editor) return { isInTable: false, hasContent: false };

      let hasNonTextContent = false;
      ctx.editor.state.doc.descendants((node) => {
        if (
          node.type.name === "inlineMath" ||
          node.type.name === "blockMath" ||
          node.type.name === "table" ||
          node.type.name === "image" ||
          node.type.name === "bulletList" ||
          node.type.name === "orderedList"
        ) {
          hasNonTextContent = true;
        }
      });

      return {
        isInTable: ctx.editor?.isActive("table") ?? false,
        hasContent:
          ctx.editor.state.doc.textContent.trim().length > 0 ||
          hasNonTextContent,
      };
    },
  });

  const isInTable = editorState?.isInTable ?? false;
  const hasContent =
    (editorState?.hasContent ?? false) ||
    (value?.content?.some(
      (node) =>
        (node.content && node.content.length > 0) ||
        node.type === "table" ||
        node.type === "image",
    ) ??
      false);

  if (!editor) return null;

  const insertMath = (latex: string) => {
    if (!editor || !mathMode) return;
    const trimmed = latex.trim();
    if (!trimmed) return;
    const nodeType = mathMode === "inline" ? "inlineMath" : "blockMath";
    const mathNode = JSON.parse(
      JSON.stringify({ type: nodeType, attrs: { latex: trimmed } }),
    );
    editor
      .chain()
      .focus()
      .insertContent([mathNode, { type: "text", text: " " }])
      .run();
    setMathMode(null);
  };

  const activeClass =
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary";
  const inactiveClass = "hover:bg-muted";

  return (
    <>
      <Card className="overflow-hidden pt-0 bg-card">
        <TooltipProvider delayDuration={200}>
          <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 p-2">
            {/* Bold */}
            {showBasic && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "transition-all",
                      editor.isActive("bold") ? activeClass : inactiveClass,
                    )}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bold (Ctrl+B)</TooltipContent>
              </Tooltip>
            )}

            {/* Italic */}
            {showBasic && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "transition-all",
                      editor.isActive("italic") ? activeClass : inactiveClass,
                    )}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Italic (Ctrl+I)</TooltipContent>
              </Tooltip>
            )}

            {/* Bullet List */}
            {showLists && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "transition-all",
                      editor.isActive("bulletList")
                        ? activeClass
                        : inactiveClass,
                    )}
                    onClick={() =>
                      editor.chain().focus().toggleBulletList().run()
                    }
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bullet List</TooltipContent>
              </Tooltip>
            )}

            {/* Numbered List */}
            {showLists && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "transition-all",
                      editor.isActive("orderedList")
                        ? activeClass
                        : inactiveClass,
                    )}
                    onClick={() =>
                      editor.chain().focus().toggleOrderedList().run()
                    }
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Numbered List</TooltipContent>
              </Tooltip>
            )}

            {/* Subscript */}
            {showSubSuper && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "transition-all",
                      editor.isActive("subscript")
                        ? activeClass
                        : inactiveClass,
                    )}
                    onClick={() =>
                      editor.chain().focus().toggleSubscript().run()
                    }
                  >
                    <SubscriptIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Subscript (H₂O)</TooltipContent>
              </Tooltip>
            )}

            {/* Superscript */}
            {showSubSuper && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "transition-all",
                      editor.isActive("superscript")
                        ? activeClass
                        : inactiveClass,
                    )}
                    onClick={() =>
                      editor.chain().focus().toggleSuperscript().run()
                    }
                  >
                    <SuperscriptIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Superscript (x²)</TooltipContent>
              </Tooltip>
            )}

            {/* Divider before math */}
            {showMath && <div className="w-px h-6 bg-border mx-1" />}

            {/* Inline Equation */}
            {showMath && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className={cn(
                      "transition-all",
                      mathMode === "inline" ? activeClass : inactiveClass,
                    )}
                    onClick={() => setMathMode("inline")}
                  >
                    Inline Exp
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Insert Inline Equation</TooltipContent>
              </Tooltip>
            )}

            {/* Block Equation */}
            {showMath && !isInTable && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className={cn(
                      "transition-all",
                      mathMode === "block" ? activeClass : inactiveClass,
                    )}
                    onClick={() => setMathMode("block")}
                  >
                    Block Exp
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Insert Block Equation</TooltipContent>
              </Tooltip>
            )}

            {/* Divider before image/table */}
            {(showImage || showTable) && (
              <div className="w-px h-6 bg-border mx-1" />
            )}

            {/* Image */}
            {showImage && !isInTable && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      const url = prompt("Paste image URL");
                      if (url)
                        editor.chain().focus().setImage({ src: url }).run();
                    }}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Insert Image</TooltipContent>
              </Tooltip>
            )}

            {/* Insert Table — only when NOT in a table */}
            {showTable && !isInTable && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .insertTable({ rows: 2, cols: 2, withHeaderRow: false })
                        .run()
                    }
                  >
                    <TableIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Insert Match Table (2×2)</TooltipContent>
              </Tooltip>
            )}

            {/* Table row controls — only when inside a table */}
            {showTable && isInTable && (
              <div className="flex items-center gap-1 rounded-md border border-border bg-muted/60 px-1.5 py-0.5">
                <span className="text-xs text-muted-foreground mr-1 font-medium">
                  Table:
                </span>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs hover:bg-background"
                      onClick={() => editor.chain().focus().addRowAfter().run()}
                    >
                      + Row
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add Row Below</TooltipContent>
                </Tooltip>

                <div className="w-px h-4 bg-border mx-0.5" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs hover:bg-background text-destructive hover:text-destructive"
                      onClick={() => editor.chain().focus().deleteRow().run()}
                    >
                      − Row
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete Current Row</TooltipContent>
                </Tooltip>

                <div className="w-px h-4 bg-border mx-0.5" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs hover:bg-background text-destructive hover:text-destructive"
                      onClick={() => editor.chain().focus().deleteTable().run()}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete Table</TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* Divider before clear */}
            <div className="w-px h-6 bg-border mx-1" />

            {/* Clear */}
            {showClear && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => editor.commands.clearContent()}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear Content</TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>

        {/* Editor */}
        <div className="p-3 relative">
          <EditorContent editor={editor} />
          {!hasContent && placeholder && (
            <p className="pointer-events-none absolute top-4 left-4 text-sm text-muted-foreground">
              {placeholder}
            </p>
          )}
        </div>
      </Card>

      {showMath && (
        <MathEquationModal
          open={mathMode !== null}
          onClose={() => setMathMode(null)}
          onInsert={insertMath}
        />
      )}
    </>
  );
}
