import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";

export function LegalPage({
  title,
  subtitle,
  sections,
}: {
  title: string;
  subtitle: string;
  sections: { heading: string; body: string }[];
}) {
  return (
    <SiteLayout>
      <PageHeader eyebrow="Legal" title={title} subtitle={subtitle} />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-lg font-semibold">{section.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>
    </SiteLayout>
  );
}
