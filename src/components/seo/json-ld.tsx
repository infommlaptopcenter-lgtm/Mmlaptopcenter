import { serializeJsonLd } from "@/lib/seo";

export function JsonLd({ data }: { data: unknown | unknown[] }) {
  const entries = Array.isArray(data) ? data : [data];

  return entries.map((entry, index) => (
    <script
      key={index}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(entry) }}
    />
  ));
}
