"use client";

import Image from "@tiptap/extension-image";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  NodeViewProps,
} from "@tiptap/react";
import { NodeSelection, Plugin, PluginKey } from "@tiptap/pm/state";
import { Trash2, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";

export function InteractiveImageNode(props: NodeViewProps) {
  const { src, r2Key, bucket } = props.node.attrs;
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Tiptap tells us if the user has tapped/clicked the image!
  const isSelected = props.selected;

  const handleDelete = async () => {
    if (!r2Key) {
      props.deleteNode();
      return;
    }

    setIsDeleting(true);
    try {
      await fetch("/api/uploads/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: r2Key, bucket }),
      });

      props.deleteNode();
      toast.success("Image deleted successfully");
    } catch {
      setIsDeleting(false);
      toast.error("Failed to delete image from server.");
    }
  };

  const handleInsertAbove = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof props.getPos !== "function") return;
    const pos = props.getPos();
    if (typeof pos !== "number") return;

    props.editor
      .chain()
      .insertContentAt(pos, { type: "paragraph" })
      .focus(pos + 1)
      .run();
  };

  const handleInsertBelow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof props.getPos !== "function") return;
    const pos = props.getPos();
    if (typeof pos !== "number") return;

    const endPos = pos + props.node.nodeSize;
    props.editor
      .chain()
      .insertContentAt(endPos, { type: "paragraph" })
      .focus(endPos + 1)
      .run();
  };

  return (
    // We add a subtle outline to the wrapper when selected so they know it's active
    <NodeViewWrapper
      className={cn(
        "relative block group max-w-full my-6 rounded-md ring-offset-2 transition-all",
        isSelected ? "ring-2 ring-primary" : "",
      )}
    >
      <div className="relative inline-block w-full max-w-fit">
        {/* Insert Above Button */}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className={cn(
            "absolute -top-3 left-1/2 -translate-x-1/2 transition-opacity h-6 px-2 text-[10px] shadow-md z-10 rounded-full",
            // 2. Visible if tapped (mobile) OR hovered (desktop)
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
          onClick={handleInsertAbove}
        >
          <ArrowUp className="h-3 w-3 mr-1" /> Text Above
        </Button>

        <img
          src={src}
          className={cn(
            "max-w-full max-h-[300px] w-auto object-contain rounded-md border bg-muted/20",
            isDeleting ? "opacity-50 blur-sm" : "",
          )}
          alt="Question upload"
        />

        {isDeleting ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary h-8 w-8" />
          </div>
        ) : (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className={cn(
              "absolute top-2 right-2 transition-opacity h-8 w-8 shadow-md",
              // Visible if tapped (mobile) OR hovered (desktop)
              isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            )}
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}

        {/* Insert Below Button */}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className={cn(
            "absolute -bottom-3 left-1/2 -translate-x-1/2 transition-opacity h-6 px-2 text-[10px] shadow-md z-10 rounded-full",
            // Visible if tapped (mobile) OR hovered (desktop)
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
          onClick={handleInsertBelow}
        >
          <ArrowDown className="h-3 w-3 mr-1" /> Text Below
        </Button>
      </div>
    </NodeViewWrapper>
  );
}

// 2. The Tiptap Extension Definition
export const CustomInteractiveImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      r2Key: { default: null },
      bucket: { default: null },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(InteractiveImageNode);
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { selection } = editor.state;

        if (
          selection instanceof NodeSelection &&
          selection.node.type.name === this.name
        ) {
          toast.info("Please use the trash icon on the image to delete it.");
          return true;
        }
        return false;
      },
      Delete: ({ editor }) => {
        const { selection } = editor.state;

        if (
          selection instanceof NodeSelection &&
          selection.node.type.name === this.name
        ) {
          toast.info("Please use the trash icon on the image to delete it.");
          return true;
        }
        return false;
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("preventImageOverwrite"),
        props: {
          handleKeyDown: (view, event) => {
            const { selection } = view.state;

            if (
              selection instanceof NodeSelection &&
              selection.node.type.name === this.name
            ) {
              if (
                event.key.startsWith("Arrow") ||
                event.ctrlKey ||
                event.metaKey ||
                event.altKey
              ) {
                return false;
              }

              if (event.key.length === 1 || event.key === "Enter") {
                toast.info(
                  "Click the 'Text Above/Below' buttons to continue typing.",
                );
                return true;
              }
            }
            return false;
          },
        },
      }),
    ];
  },
});
