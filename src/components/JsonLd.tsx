/**
 * Renders a JSON-LD block.
 *
 * `JSON.stringify` output is injected as-is, so any string that reaches it must
 * be escaped: a product description containing `</script>` would otherwise end
 * the tag early and everything after it would be parsed as markup. Replacing
 * `<` with its unicode escape is enough — it is still valid JSON and the
 * browser's JSON parser reads it back identically.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  );
}
