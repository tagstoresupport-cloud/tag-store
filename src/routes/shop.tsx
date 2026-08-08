import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo } from "react";

import { EmptyState, ProductCard } from "@/components/site/ProductCard";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useProducts } from "@/lib/data";
import { effectivePrice, type Product } from "@/lib/types";

type ShopSearch = {
  q?: string | undefined;
  category?: string | undefined;
  sort?: "newest" | "price-asc" | "price-desc" | "name" | undefined;
  min?: number | undefined;
  max?: number | undefined;
};


export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    category: typeof search["category"] === "string" ? search["category"] : undefined,
    sort: ["newest", "price-asc", "price-desc", "name"].includes(String(search["sort"]))
      ? (search["sort"] as ShopSearch["sort"])
      : undefined,
    min: Number.isFinite(Number(search["min"])) && search["min"] !== undefined
      ? Number(search["min"])
      : undefined,
    max: Number.isFinite(Number(search["max"])) && search["max"] !== undefined
      ? Number(search["max"])
      : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop PlayStation Games — Tag Store" },
      {
        name: "description",
        content:
          "Browse the full Tag Store catalog of PlayStation digital games. Search, filter by category and price, and buy in minutes.",
      },
      { property: "og:title", content: "Shop PlayStation Games — Tag Store" },
      {
        property: "og:description",
        content: "Search and filter the full Tag Store PlayStation game catalog.",
      },
      { property: "og:image", content: "https://tag-store.lovable.app/__l5e/assets-v1/fe7cc6a6-9727-41a9-ae7e-95f4f01fb5de/tag-store-og.png" },
      { name: "twitter:image", content: "https://tag-store.lovable.app/__l5e/assets-v1/fe7cc6a6-9727-41a9-ae7e-95f4f01fb5de/tag-store-og.png" },
    ],
  }),
  component: ShopPage,
});

function minPrice(p: Product): number {
  const prices = (p.variants ?? []).filter((v) => v.available).map(effectivePrice);
  return prices.length ? Math.min(...prices) : Number.POSITIVE_INFINITY;
}

function ShopPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();

  const setSearch = (patch: Partial<ShopSearch>) => {
    navigate({ search: (prev: ShopSearch) => ({ ...prev, ...patch }), replace: true });
  };

  const filtered = useMemo(() => {
    const categoryId = categories?.find((c) => c.slug === search.category)?.id;
    let list = (products ?? []).filter((p) => {
      if (search.q && !p.name.toLowerCase().includes(search.q.toLowerCase())) return false;
      if (categoryId && p.category_id !== categoryId) return false;
      const price = minPrice(p);
      if (search.min !== undefined && price < search.min) return false;
      if (search.max !== undefined && price > search.max) return false;
      return true;
    });

    switch (search.sort) {
      case "price-asc":
        list = [...list].sort((a, b) => minPrice(a) - minPrice(b));
        break;
      case "price-desc":
        list = [...list].sort((a, b) => minPrice(b) - minPrice(a));
        break;
      case "name":
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return list;
  }, [products, categories, search]);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Catalog"
        title="Shop"
        subtitle="Find your next PlayStation game. Filter by category, price, and more."
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border bg-card p-5 lg:sticky lg:top-24">
            <h2 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider">
              <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters
            </h2>

            <div className="mt-5 space-y-5">
              <div>
                <Label htmlFor="search" className="text-xs uppercase tracking-wider">
                  Search
                </Label>
                <div className="relative mt-2">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search"
                    value={search.q ?? ""}
                    placeholder="Game name..."
                    className="rounded-xl pl-9"
                    onChange={(e) => setSearch({ q: e.target.value || undefined })}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider">Category</Label>
                <Select
                  value={search.category ?? "all"}
                  onValueChange={(v) => setSearch({ category: v === "all" ? undefined : v })}
                >
                  <SelectTrigger className="mt-2 rounded-xl">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {(categories ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider">Price (EGP)</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    min={0}
                    placeholder="Min"
                    className="rounded-xl"
                    value={search.min ?? ""}
                    onChange={(e) =>
                      setSearch({ min: e.target.value ? Number(e.target.value) : undefined })
                    }
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="Max"
                    className="rounded-xl"
                    value={search.max ?? ""}
                    onChange={(e) =>
                      setSearch({ max: e.target.value ? Number(e.target.value) : undefined })
                    }
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider">Sort by</Label>
                <Select
                  value={search.sort ?? "newest"}
                  onValueChange={(v) => setSearch({ sort: v as ShopSearch["sort"] })}
                >
                  <SelectTrigger className="mt-2 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-asc">Price: low to high</SelectItem>
                    <SelectItem value="price-desc">Price: high to low</SelectItem>
                    <SelectItem value="name">Name A–Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="secondary"
                className="w-full rounded-xl"
                onClick={() =>
                  navigate({ search: {}, replace: true })
                }
              >
                Reset filters
              </Button>
            </div>
          </aside>

          <div>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-2xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                title="No products found"
                description="The catalog is empty or no product matches your filters. New products appear here as soon as they are added from the Admin Dashboard."
              />
            ) : (
              <>
                <p className="mb-5 text-sm text-muted-foreground">
                  {filtered.length} product{filtered.length === 1 ? "" : "s"}
                </p>
                <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">
                  {filtered.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
