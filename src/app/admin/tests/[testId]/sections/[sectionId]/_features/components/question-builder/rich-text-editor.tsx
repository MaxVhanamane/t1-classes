"use client";

import { useState, useRef } from "react";
import {
  useEditor,
  EditorContent,
  JSONContent,
  useEditorState,
  nodeInputRule,
} from "@tiptap/react";
import { Extension, textInputRule } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
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
  Loader2,
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
import { QuickSymbolsAccordion } from "./quick-symbols-accordion";
import { cn } from "@/src/lib/utils";
import { ShortcutsPopover } from "./shortcuts-popover";
import { CustomInteractiveImage } from "./custom-image-extension";
import { useR2Upload } from "@/src/hooks/use-r2-upload";
import { toast } from "sonner";

/* ------------------------------------------------------------
 * Custom Extension: Auto-Formatting STEM Shortcuts
 * ---------------------------------------------------------- */
export const StemShortcuts = Extension.create({
  name: "stemShortcuts",

  addInputRules() {
    const mathNodeType = this.editor.schema.nodes.inlineMath;

    const mathRule = (find: RegExp, latexValue: string) => {
      return nodeInputRule({
        find,
        type: mathNodeType,
        getAttributes: () => ({ latex: latexValue }),
      });
    };

    return [
      textInputRule({ find: /->$/, replace: "→" }),
      textInputRule({ find: /<-$/, replace: "←" }),
      textInputRule({ find: /<=>$/, replace: "⇌" }),
      textInputRule({ find: /=>$/, replace: "⇒" }),
      textInputRule({ find: /!=$/, replace: "≠" }),
      textInputRule({ find: />=$/, replace: "≥" }),
      textInputRule({ find: /<=$/, replace: "≤" }),
      textInputRule({ find: /\+-$/, replace: "±" }),
      textInputRule({ find: /~=$/, replace: "≈" }),

      mathRule(/_angle\s$/, "\\angle"),
      mathRule(/_tri\s$/, "\\triangle"),
      mathRule(/_theta\s$/, "\\theta"),
      mathRule(/_alpha\s$/, "\\alpha"),
      mathRule(/_beta\s$/, "\\beta"),
      mathRule(/_pi\s$/, "\\pi"),
      mathRule(/_delta\s$/, "\\Delta"),

      textInputRule({ find: /_deg\s$/, replace: "° " }),
    ];
  },
});

/* ------------------------------------------------------------
 * Toolbar & Size Presets
 * ---------------------------------------------------------- */
export type EditorToolbar =
  | "question"
  | "option"
  | "description"
  | "explanation";
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
  testId?: string;
}

type MathMode = "inline" | "block";

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  toolbar = "question",
  size = "md",
  testId,
}: Props) {
  const [mathMode, setMathMode] = useState<MathMode | null>(null);
  const minHeight = sizeToMinHeight[size];

  // Image Upload Hook & Ref
  const { uploadFile, uploading: isUploadingImage } = useR2Upload();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      StemShortcuts,
      ...(showImage ? [CustomInteractiveImage] : []),
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
      if (!ctx.editor)
        return { isInTable: false, hasContent: false, active: {} };
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
        isInTable: ctx.editor.isActive("table"),
        hasContent:
          ctx.editor.state.doc.textContent.trim().length > 0 ||
          hasNonTextContent,
        active: {
          bold: ctx.editor.isActive("bold"),
          italic: ctx.editor.isActive("italic"),
          bulletList: ctx.editor.isActive("bulletList"),
          orderedList: ctx.editor.isActive("orderedList"),
          subscript: ctx.editor.isActive("subscript"),
          superscript: ctx.editor.isActive("superscript"),
        },
      };
    },
  });

  const isInTable = editorState?.isInTable ?? false;
  const activeStyles = editorState?.active ?? {};

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

  // --- UPDATED: Image Upload Handler ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    // Strict TestID enforcement
    if (!testId) {
      toast.error("Error: Test ID is required to upload images.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      const result = await uploadFile({
        file,
        assetType: "question_image",
        testId: testId,
      });

      if (result.publicUrl) {
        // Insert just the image (user can add space using the overlay buttons if needed)
        editor
          .chain()
          .focus()
          .insertContent({
            type: "image",
            attrs: {
              src: result.publicUrl,
              r2Key: result.key,
              bucket: result.bucket,
            },
          })
          .run();
      }
    } catch (error) {
      console.error("Failed to upload image", error);
      toast.error(
        "Image upload failed. Please ensure the file is under the size limit.",
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const activeClass =
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary";
  const inactiveClass = "hover:bg-muted text-muted-foreground";

  return (
    <>
      <Card className="overflow-hidden pt-0 bg-card gap-0">
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
                      activeStyles.bold ? activeClass : inactiveClass,
                    )}
                    onMouseDown={(e) => e.preventDefault()}
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
                      activeStyles.italic ? activeClass : inactiveClass,
                    )}
                    onMouseDown={(e) => e.preventDefault()}
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
                      activeStyles.bulletList ? activeClass : inactiveClass,
                    )}
                    onMouseDown={(e) => e.preventDefault()}
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
                      activeStyles.orderedList ? activeClass : inactiveClass,
                    )}
                    onMouseDown={(e) => e.preventDefault()}
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
                      activeStyles.subscript ? activeClass : inactiveClass,
                    )}
                    onMouseDown={(e) => e.preventDefault()}
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
                      activeStyles.superscript ? activeClass : inactiveClass,
                    )}
                    onMouseDown={(e) => e.preventDefault()}
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
                    onMouseDown={(e) => e.preventDefault()}
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
                    onMouseDown={(e) => e.preventDefault()}
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

            {/* IMAGE UPLOAD BUTTON */}
            {showImage && !isInTable && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative inline-block">
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.webp,.avif"
                      onChange={handleImageUpload}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className={inactiveClass}
                      disabled={isUploadingImage}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {isUploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <ImageIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Upload Image</TooltipContent>
              </Tooltip>
            )}

            {/* Insert Table */}
            {showTable && !isInTable && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className={inactiveClass}
                    onMouseDown={(e) => e.preventDefault()}
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

            {/* Table row controls */}
            {showTable && isInTable && (
              <div className="flex items-center gap-1 rounded-md border border-border bg-muted/60 px-1.5 py-0.5">
                <span className="text-xs text-muted-foreground mr-1 font-medium">
                  Table:
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs hover:bg-background"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                >
                  + Row
                </Button>
                <div className="w-px h-4 bg-border mx-0.5" />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs hover:bg-background text-destructive hover:text-destructive"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().deleteRow().run()}
                >
                  − Row
                </Button>
                <div className="w-px h-4 bg-border mx-0.5" />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs hover:bg-background text-destructive hover:text-destructive"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().deleteTable().run()}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}

            <div className="w-px h-6 bg-border mx-1" />

            {/* Clear Formatting */}
            {showClear && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className={inactiveClass}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor.commands.clearContent()}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear Content</TooltipContent>
              </Tooltip>
            )}

            <ShortcutsPopover inactiveClass={inactiveClass} />
          </div>
        </TooltipProvider>

        {/* Quick Symbols Panel */}
        {(showMath || showBasic) && <QuickSymbolsAccordion editor={editor} />}

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
