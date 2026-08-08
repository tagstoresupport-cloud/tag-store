import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Gamepad2,
  Headphones,
  Phone,
  ShieldCheck,
  Wallet,
  Zap,
} from "lucide-react";

import { EmptyState, ProductCard } from "@/components/site/ProductCard";
import { SiteLayout } from "@/components/site/SiteLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useProducts, useStoreSettings } from "@/lib/data";
import { FAQS } from "@/lib/faqs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tag Store — PlayStation Digital Games in Egypt" },
      {
        name: "description",
        content:
          "Buy PlayStation digital games from Tag Store. Primary, secondary and full-access accounts with fast delivery and Vodafone Cash payment.",
      },
      { property: "og:title", content: "Tag Store — PlayStation Digital Games" },
      {
        property: "og:description",
        content: "Premium PS4 and PS5 digital games with fast delivery and Vodafone Cash payment.",
      },
      { property: "og:image", content: "https://tag-store.lovable.app/__l5e/assets-v1/fe7cc6a6-9727-41a9-ae7e-95f4f01fb5de/tag-store-og.png" },
      { name: "twitter:image", content: "https://tag-store.lovable.app/__l5e/assets-v1/fe7cc6a6-9727-41a9-ae7e-95f4f01fb5de/tag-store-og.png" },
    ],
  }),
  component: HomePage,
});

const WHY = [
  {
    icon: Zap,
    title: "Fast Delivery",
    text: "Orders are reviewed and delivered as quickly as possible after payment confirmation.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & Trusted",
    text: "Every order is tracked with a unique order ID and verified payment proof.",
  },
  {
    icon: Wallet,
    title: "Vodafone Cash",
    text: "Simple local payment — send the amount and upload your payment screenshot.",
  },
  {
    icon: Headphones,
    title: "Real Support",
    text: "Talk to a real person on WhatsApp or phone whenever you need help.",
  },
];

function HomePage() {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: settings } = useStoreSettings();

  const featured = (products ?? []).filter((p) => p.is_featured).slice(0, 8);
  const latest = (products ?? []).slice(0, 8);

  return (
    <SiteLayout>
      <section className="hero-glow relative overflow-hidden border-b">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Gamepad2 className="h-3.5 w-3.5" /> PlayStation Digital Store
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] sm:text-6xl">
              Level up with <span className="gradient-text">{settings?.store_name ?? "Tag Store"}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              Digital PlayStation games at honest prices. Choose your account type, pay with
              Vodafone Cash, and start playing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-xl font-semibold shadow-glow">
                <Link to="/shop">
                  Shop Now <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="rounded-xl font-semibold">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-primary" /> Verified orders
              </span>
              <span className="flex items-center gap-2" dir="ltr">
                <Phone className="h-4 w-4 text-primary" /> {settings?.support_phone ?? "01205665404"}
              </span>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="animate-float glass rounded-3xl p-8 shadow-glow">
              <div className="grid grid-cols-2 gap-4">
                {["PS5 Games", "PS4 Games", "Primary", "Secondary"].map((label) => (
                  <div
                    key={label}
                    className="rounded-2xl border bg-background/60 p-6 text-center font-display font-semibold"
                  >
                    {label}
                  </div>
                ))}
              </div>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Real accounts. Real support. Real prices.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionTitle title="Categories" subtitle="Browse the store by category." />
        {categories && categories.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                to="/shop"
                search={{ category: c.slug }}
                className="card-hover overflow-hidden rounded-2xl border bg-card shadow-card"
              >
                {c.image_path ? (
                  <StorageImage
                    path={c.image_path}
                    alt={c.name}
                    className="h-36 w-full object-cover"
                  />
                ) : (
                  <div className="grid h-36 w-full place-items-center bg-secondary/40">
                    <Gamepad2 className="h-7 w-7 text-primary" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold">{c.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Explore {c.name}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              title="No categories yet"
              description="Categories added from the dashboard will appear here automatically."
            />
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <SectionTitle title="Featured Products" subtitle="Hand-picked titles from our catalog." />
        <ProductGrid loading={isLoading} products={featured} empty="No featured products yet." />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionTitle title="Latest Products" subtitle="The newest additions to Tag Store." />
        <ProductGrid loading={isLoading} products={latest} empty="No products yet." />
      </section>

      <section className="border-y bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionTitle title="Why Choose Tag Store" subtitle="Built for gamers, not for bots." />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((item) => (
              <div key={item.title} className="card-hover rounded-2xl border bg-card p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <SectionTitle title="Frequently Asked Questions" subtitle="Quick answers before you buy." />
        <Accordion type="single" collapsible className="mt-8">
          {FAQS.slice(0, 5).map((faq, i) => (
            <AccordionItem key={faq.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-display">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="glass flex flex-col items-center gap-4 rounded-3xl px-6 py-12 text-center shadow-glow">
          <h2 className="text-2xl font-bold sm:text-3xl">Need help choosing a game?</h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            Message us and we'll help you pick the right account type for your console.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-xl font-semibold">
              <a href={`tel:${settings?.support_phone ?? "01205665404"}`}>
                Call {settings?.support_phone ?? "01205665404"}
              </a>
            </Button>
            <Button asChild variant="secondary" className="rounded-xl font-semibold">
              <Link to="/contact">Contact page</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function ProductGrid({
  loading,
  products,
  empty,
}: {
  loading: boolean;
  products: ReturnType<typeof useProducts>["data"];
  empty: string;
}) {
  if (loading) {
    return (
      <div className="mt-8 grid gap-5 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          title={empty}
          description="Products added from the Admin Dashboard will show up here instantly."
        />
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
