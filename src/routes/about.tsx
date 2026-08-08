import { createFileRoute } from "@tanstack/react-router";
import { Gamepad2, HeartHandshake, ShieldCheck } from "lucide-react";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Tag Store — Trusted PlayStation Games Seller" },
      {
        name: "description",
        content:
          "Tag Store is an Egyptian digital store for PlayStation games, focused on fair prices and real support.",
      },
      { property: "og:title", content: "About Tag Store" },
      {
        property: "og:description",
        content: "An Egyptian digital store for PlayStation games with fair prices and real support.",
      },
      { property: "og:image", content: "https://tag-store.lovable.app/__l5e/assets-v1/fe7cc6a6-9727-41a9-ae7e-95f4f01fb5de/tag-store-og.png" },
      { name: "twitter:image", content: "https://tag-store.lovable.app/__l5e/assets-v1/fe7cc6a6-9727-41a9-ae7e-95f4f01fb5de/tag-store-og.png" },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  {
    icon: Gamepad2,
    title: "Gamers first",
    text: "We only sell what we would buy ourselves, and we explain exactly what each account option gives you.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent",
    text: "Clear prices, clear terms, and a unique order ID for every purchase so nothing gets lost.",
  },
  {
    icon: HeartHandshake,
    title: "Human support",
    text: "You talk to a real person, not a bot, whenever you need help with an order.",
  },
];

function AboutPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Our story"
        title="About Tag Store"
        subtitle="Digital PlayStation games, delivered honestly."
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          <p>
            Tag Store started with a simple goal: make it easy and safe for gamers in Egypt to buy
            digital PlayStation games without paying international prices or worrying about scams.
          </p>
          <p>
            Every title in our catalog is listed with the account options we can actually deliver —
            primary, secondary, or full access — and the exact price of each one. You pay locally
            with Vodafone Cash, upload your payment screenshot, and we take it from there.
          </p>
          <p>
            We keep the store small and focused so that every order gets attention. If something
            goes wrong, you can reach a real person who will fix it.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {VALUES.map((value) => (
            <div key={value.title} className="card-hover rounded-2xl border bg-card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
                <value.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold">{value.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{value.text}</p>
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
