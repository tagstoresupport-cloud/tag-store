import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StorageImage } from "@/lib/storage-image";
import { priceRange, type Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const range = priceRange(product.variants ?? []);
  const cover = product.main_image ?? product.images?.[0] ?? null;

  return (
    <article className="card-hover group overflow-hidden rounded-2xl border bg-card shadow-card">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="block aspect-[3/4] overflow-hidden bg-muted"
      >
        <StorageImage
          path={cover}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          {(product.variants ?? []).slice(0, 3).map((v) => (
            <Badge key={v.id} variant="secondary" className="rounded-full text-[11px]">
              {v.name}
            </Badge>
          ))}
        </div>
        <h3 className="line-clamp-2 min-h-[2.75rem] font-display text-base font-semibold">
          {product.name}
        </h3>
        <p className="text-sm font-semibold text-primary">{range ?? "Out of stock"}</p>
        <Button asChild className="w-full rounded-xl font-semibold">
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
