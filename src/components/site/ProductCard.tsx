import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePlatforms } from "@/lib/cms";
import { useCategories } from "@/lib/data";
import { StorageImage } from "@/lib/storage-image";
import { formatEGP, productPricing, type Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { data: platforms = [] } = usePlatforms();
  const { data: categories = [] } = useCategories();
  const pricing = productPricing(product);
  const cover = product.main_image ?? product.images?.[0] ?? null;

  const productPlatforms = platforms.filter((p) => (product.platform_ids ?? []).includes(p.id));
  const category = categories.find((c) => c.id === product.category_id);
  const typeLabel = product.product_type || category?.name || null;

  return (
    <article className="card-hover group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-[4/5] overflow-hidden bg-secondary/30"
      >
        <StorageImage
          path={cover}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-x-2 top-2 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {productPlatforms.slice(0, 2).map((p) => (
              <span
                key={p.id}
                className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground backdrop-blur"
              >
                {p.name}
              </span>
            ))}
          </div>
          {pricing.off !== null && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              -{pricing.off}%
            </span>
          )}
        </div>
        {!product.in_stock && (
          <span className="absolute inset-x-0 bottom-0 bg-background/85 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur">
            Out of stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        {typeLabel && (
          <Badge variant="secondary" className="w-fit rounded-full text-[10px]">
            {typeLabel}
          </Badge>
        )}
        <h3 className="line-clamp-2 min-h-[2.5rem] font-display text-sm font-semibold sm:text-base">
          {product.name}
        </h3>
        <div className="mt-auto flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-bold text-primary sm:text-base">
            {pricing.current > 0 ? formatEGP(pricing.current) : "—"}
          </span>
          {pricing.old !== null && (
            <span className="text-xs text-muted-foreground line-through">
              {formatEGP(pricing.old)}
            </span>
          )}
        </div>
        <Button asChild size="sm" className="mt-1 w-full rounded-xl font-semibold">
          <Link to="/product/$slug" params={{ slug: product.slug }}>
            View &amp; Buy
          </Link>
        </Button>
      </div>
    </article>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-card/40 px-6 py-16 text-center">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
