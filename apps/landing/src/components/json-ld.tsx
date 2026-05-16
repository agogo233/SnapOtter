export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: static build-time data only, no user input
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
