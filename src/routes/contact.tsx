import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, Phone, Wallet } from "lucide-react";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { useStoreSettings } from "@/lib/data";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Tag Store — Support & WhatsApp" },
      {
        name: "description",
        content: "Reach Tag Store support by phone or WhatsApp for help with orders and games.",
      },
      { property: "og:title", content: "Contact Tag Store" },
      { property: "og:description", content: "Phone and WhatsApp support for Tag Store customers." },
      { property: "og:image", content: "https://tag-store.lovable.app/__l5e/assets-v1/fe7cc6a6-9727-41a9-ae7e-95f4f01fb5de/tag-store-og.png" },
      { name: "twitter:image", content: "https://tag-store.lovable.app/__l5e/assets-v1/fe7cc6a6-9727-41a9-ae7e-95f4f01fb5de/tag-store-og.png" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: settings } = useStoreSettings();
  const phone = settings?.support_phone ?? "01205665404";
  const vodafone = settings?.vodafone_number ?? "01068012140";

  const cards = [
    {
      icon: Phone,
      title: "Call us",
      value: phone,
      href: `tel:${phone}`,
      text: "Available during working hours for order help.",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      value: phone,
      href: `https://wa.me/2${phone}`,
      text: "Fastest way to reach us about a pending order.",
    },
    {
      icon: Wallet,
      title: "Vodafone Cash",
      value: vodafone,
      href: null,
      text: "Send payments to this number only.",
    },
  ];

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Support"
        title="Contact Us"
        subtitle="We're here to help before, during and after your purchase."
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.title} className="card-hover rounded-2xl border bg-card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
                <card.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold">{card.title}</h2>
              {card.href ? (
                <a
                  href={card.href}
                  target={card.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer noopener"
                  className="mt-1 block font-display text-xl font-bold text-primary"
                  dir="ltr"
                >
                  {card.value}
                </a>
              ) : (
                <p className="mt-1 font-display text-xl font-bold text-primary" dir="ltr">
                  {card.value}
                </p>
              )}
              <p className="mt-2 text-sm text-muted-foreground">{card.text}</p>
            </div>
          ))}
        </div>

        <div className="glass mt-10 rounded-2xl p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Mail className="h-5 w-5 text-primary" /> Order questions
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            When contacting support about an existing order, please include your Order ID (it looks
            like TS-01001) so we can find your order faster.
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
