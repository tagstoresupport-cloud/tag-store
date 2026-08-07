import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/lib/faqs";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Tag Store PlayStation Games" },
      {
        name: "description",
        content:
          "Answers about ordering, Vodafone Cash payment, delivery time and account types at Tag Store.",
      },
      { property: "og:title", content: "Tag Store FAQ" },
      {
        property: "og:description",
        content: "Answers about ordering, payment, delivery and account types.",
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Help center"
        title="Frequently Asked Questions"
        subtitle="Everything you need to know before ordering."
      />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Accordion type="single" collapsible>
          {FAQS.map((faq, i) => (
            <AccordionItem key={faq.q} value={`faq-${i}`}>
              <AccordionTrigger className="text-left font-display">{faq.q}</AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </SiteLayout>
  );
}
