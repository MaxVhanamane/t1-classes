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

// Cap to avoid unbounded growth in long-lived sessions (e.g. admin editing many questions).
const MAX_CACHE_SIZE = 500;
const mathCache = new Map<string, string>();

function renderLatex(latex: string): string {
  const cached = mathCache.get(latex);
  if (cached !== undefined) return cached;

  let rendered: string;
  try {
    rendered = katex.renderToString(latex, {
      throwOnError: false,
      strict: "ignore",
      output: "html",
    });
  } catch {
    // Should be rare since throwOnError is false, but guard against katex
    // internal errors (e.g. pathological input) so one bad expression
    // never breaks the whole page render.
    rendered = `<span class="katex-error" title="Failed to render expression">${escapeHtml(
      latex,
    )}</span>`;
  }

  if (mathCache.size >= MAX_CACHE_SIZE) {
    const firstKey = mathCache.keys().next().value;
    if (firstKey !== undefined) mathCache.delete(firstKey);
  }
  mathCache.set(latex, rendered);

  return rendered;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getAttr(attrs: string, name: string): string {
  const match = attrs.match(new RegExp(`${name}="([^"]*)"`));
  return match ? match[1] : "";
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

// Matches ONLY empty math nodes: <span ... data-type="inline-math" ...></span>
// or self-closing <span ... data-type="inline-math" .../>
// Never matches tags with real children, so it can't swallow surrounding HTML.
const MATH_NODE_RE =
  /<(span|div)([^>]*data-type="(inline-math|block-math)"[^>]*)>\s*(?:<\/\1>)|<(span|div)([^>]*data-type="(inline-math|block-math)"[^>]*)\/>/g;

function renderMath(html: string): string {
  try {
    return html.replace(
      MATH_NODE_RE,
      (_match, _tag1, attrs1, type1, _tag2, attrs2, type2) => {
        const attrs: string = attrs1 ?? attrs2;
        const type: string = type1 ?? type2;

        const rawLatex = getAttr(attrs, "data-latex");
        const latex = decodeHtmlEntities(rawLatex);
        const rendered = renderLatex(latex);

        if (type === "inline-math") {
          return rendered;
        }

        return `<div class="tiptap-mathematics-render" data-type="block-math" data-latex="${rawLatex}"><div class="block-math-inner">${rendered}</div></div>`;
      },
    );
  } catch {
    // Worst case: math nodes stay unrendered (visually missing) but the
    // rest of the content (tables, text, images) still renders fine.
    return html;
  }
}

function safeGenerateHTML(content: JSONContent): string {
  try {
    return generateHTML(content, TiptapExtensions);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("Failed to generate HTML from Tiptap content:", err);
    }
    return "";
  }
}

export function RichTextHTMLContent({
  content,
  clamp = false,
  variant = "rich-content",
  className,
}: Props) {
  const isProse = variant === "prose";

  const html = useMemo(() => {
    const generated = safeGenerateHTML(content ?? EMPTY_DOC);
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
