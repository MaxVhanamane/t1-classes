import { JSONContent } from "@tiptap/react";
import { generateHTML } from "@tiptap/html";
import katex from "katex";
import "katex/dist/katex.min.css";

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

const mathCache = new Map<string, string>();

function renderLatex(latex: string) {
  const cached = mathCache.get(latex);
  if (cached) return cached;

  const rendered = katex.renderToString(latex, {
    throwOnError: false,
    strict: "ignore",
    output: "html", // <-- no displayMode
  });

  mathCache.set(latex, rendered);

  return rendered;
}

function renderMath(html: string) {
  const container = document.createElement("div");
  container.innerHTML = html;

  // Inline equations
  container.querySelectorAll("[data-type='inline-math']").forEach((node) => {
    const latex = node.getAttribute("data-latex") ?? "";

    node.outerHTML = renderLatex(latex);
  });

  // Block equations
  container.querySelectorAll("[data-type='block-math']").forEach((node) => {
    const latex = node.getAttribute("data-latex") ?? "";

    node.outerHTML = `
      <div
        class="tiptap-mathematics-render"
        data-type="block-math"
        data-latex="${latex.replace(/"/g, "&quot;")}"
      >
        <div class="block-math-inner">
          ${renderLatex(latex)}
        </div>
      </div>
    `;
  });

  return container.innerHTML;
}

export function RichTextHTMLContent({
  content,
  clamp = false,
  variant = "rich-content",
  className,
}: Props) {
  const isProse = variant === "prose";

  const html = useMemo(() => {
    const generated = generateHTML(content ?? EMPTY_DOC, TiptapExtensions);
    return renderMath(generated);
  }, [content]);

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
