import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, ChevronLeft, ShoppingCart, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/lib/cart";
import { useCategories, useProduct } from "@/lib/data";
import { StorageImage } from "@/lib/storage-image";
import { effectivePrice, formatEGP } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Tag Store` },
      {
        name: "description",
        content: "Product details, account options and prices at Tag Store.",
      },
      { property: "og:title", content: "Product — Tag Store" },
      {
        property: "og:description",
        content: "Product details, account options and prices at Tag Store.",
      },
      { property: "og:image", content: "https://tag-store.lovable.app/__l5e/assets-v1/fe7cc6a6-9727-41a9-ae7e-95f4f01fb5de/tag-store-og.png" },
      { name: "twitter:image", content: "https://tag-store.lovable.app/__l5e/assets-v1/fe7cc6a6-9727-41a9-ae7e-95f4f01fb5de/tag-store-og.png" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product, isLoading } = useProduct(slug);
  const { data: categories } = useCategories();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [variantId, setVariantId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (!product) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This product may have been removed or hidden.
          </p>
          <Button asChild className="mt-6 rounded-xl">
            <Link to="/shop">Back to shop</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const images = product.images?.length
    ? product.images
    : product.main_image
      ? [product.main_image]
      : [];
  const cover = activeImage ?? product.main_image ?? images[0] ?? null;
  const variants = product.variants ?? [];
  const selected = variants.find((v) => v.id === variantId) ?? null;
  const category = categories?.find((c) => c.id === product.category_id);
  const inStock = variants.some((v) => v.available);

  const handleAdd = (buyNow: boolean) => {
    if (!selected) {
      toast.error("Please select an option first");
      return;
    }
    addItem({
      product_id: product.id,
      product_name: product.name,
      image: product.main_image ?? images[0] ?? null,
      variant_id: selected.id,
      variant_name: selected.name,
      price: effectivePrice(selected),
      quantity: 1,
    });
    toast.success(`${product.name} — ${selected.name} added to cart`);
    if (buyNow) navigate({ to: "/checkout" });
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" /> Back to shop
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-3xl border bg-card shadow-card">
              <StorageImage
                path={cover}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-3">
                {images.map((img) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={cn(
                      "overflow-hidden rounded-xl border-2 transition-colors",
                      cover === img ? "border-primary" : "border-transparent hover:border-border",
                    )}
                  >
                    <StorageImage
                      path={img}
                      alt={`${product.name} thumbnail`}
                      className="aspect-square w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {category && (
              <Badge variant="secondary" className="rounded-full">
                {category.name}
              </Badge>
            )}
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{product.name}</h1>

            <p className="mt-2 text-sm font-medium">
              {inStock ? (
                <span className="text-success">In stock</span>
              ) : (
                <span className="text-destructive">Currently unavailable</span>
              )}
            </p>

            {product.description && (
              <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            )}

            <div className="mt-8">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider">
                Choose your option
              </h2>
              {variants.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  No options available for this product yet.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {variants.map((v) => {
                    const isSelected = v.id === variantId;
                    const hasDiscount = Boolean(v.discount_price && v.discount_price > 0);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        disabled={!v.available}
                        onClick={() => setVariantId(v.id)}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary/10 shadow-glow"
                            : "bg-card hover:border-primary/50",
                          !v.available && "cursor-not-allowed opacity-45",
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className={cn(
                              "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                              isSelected && "border-primary bg-primary text-primary-foreground",
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </span>
                          <span className="truncate font-medium">{v.name}</span>
                        </span>
                        <span className="shrink-0 text-right">
                          {hasDiscount && (
                            <span className="mr-2 text-xs text-muted-foreground line-through">
                              {formatEGP(v.price)}
                            </span>
                          )}
                          <span className="font-semibold text-primary">
                            {formatEGP(effectivePrice(v))}
                          </span>
                          {!v.available && (
                            <span className="ml-2 text-xs text-muted-foreground">Unavailable</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                className="flex-1 rounded-xl font-semibold"
                disabled={!inStock}
                onClick={() => handleAdd(false)}
              >
                <ShoppingCart className="mr-1 h-4 w-4" /> Add to Cart
              </Button>
              <Button
                size="lg"
                className="flex-1 rounded-xl font-semibold shadow-glow"
                disabled={!inStock}
                onClick={() => handleAdd(true)}
              >
                <Zap className="mr-1 h-4 w-4" /> Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
