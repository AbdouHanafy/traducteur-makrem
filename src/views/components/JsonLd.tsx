type JsonLdValue =
  | null
  | boolean
  | number
  | string
  | JsonLdValue[]
  | { [key: string]: JsonLdValue };

/** Serializes server-built structured data without allowing `</script>` injection. */
export default function JsonLd({ data }: { data: JsonLdValue | JsonLdValue[] }) {
  const graph = Array.isArray(data) ? data : [data];
  const payload = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: payload }} />;
}
