export const BLOG_CATEGORIES = ["New Supplements", "Health Insights", "Brand"] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

/** Narrowing guard — `.includes()` on a readonly literal tuple rejects `string`. */
export function isBlogCategory(value: unknown): value is BlogCategory {
  return typeof value === "string" && (BLOG_CATEGORIES as readonly string[]).includes(value);
}

/**
 * Article bodies are plain text: blank lines separate paragraphs, and a line
 * beginning with "## " is a subheading. Kept deliberately simple so editors
 * don't need to learn markdown and we don't need a parser dependency.
 */
export type ArticleBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string };

export function parseArticle(content: string): ArticleBlock[] {
  return content
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) =>
      block.startsWith("## ")
        ? { type: "heading" as const, text: block.slice(3).trim() }
        : { type: "paragraph" as const, text: block }
    );
}

export function formatPostDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
