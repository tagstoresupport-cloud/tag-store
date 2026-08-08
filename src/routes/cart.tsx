import { Link, createFileRoute } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/site/ProductCard";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { StorageImage } from "@/lib/storage-image";
import { formatEGP } from "@/lib/types";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Tag Store" },
      { name: "description", content: "Review the games in your Tag Store cart before checkout." },
      { property: "og:title", content: "Your Cart — Tag Store" },
      { property: "og:description", content: "Review your selected PlayStation games." },
      { property: "og:image", content: "https://tag-store.lovable.app/__l5e/assets-v1/fe7cc6a6-9727-41a9-ae7e-95f4f01fb5de/tag-store-og.png" },
      { name: "twitter:image", content: "https://tag-store.lovable.app/__l5e/assets-v1/fe7cc6a6-9727-41a9-ae7e-95f4f01fb5de/tag-store-og.png" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, total, setQuantity, removeItem } = useCart();

  return (
    <SiteLayout>
      <PageHeader eyebrow="Checkout" title="Your Cart" subtitle="Review your order before paying." />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {items.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            description="Browse the shop and add a game to get started."
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={`${item.product_id}-${item.variant_id}`}
                  className="flex gap-4 rounded-2xl border bg-card p-4"
                >
                  <StorageImage
                    path={item.image}
                    alt={item.product_name}
                    className="h-24 w-20 shrink-0 rounded-xl object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <h3 className="truncate font-display font-semibold">{item.product_name}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{item.variant_name}</p>
                    <p className="mt-1 text-sm font-semibold text-primary">
                      {formatEGP(item.price)}
                    </p>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                      <div className="flex items-center gap-1 rounded-xl border p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg"
                          onClick={() =>
                            setQuantity(item.product_id, item.variant_id, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg"
                          onClick={() =>
                            setQuantity(item.product_id, item.variant_id, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">
                          {formatEGP(item.price * item.quantity)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-destructive"
                          onClick={() => removeItem(item.product_id, item.variant_id)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="h-fit rounded-2xl border bg-card p-6 lg:sticky lg:top-24">
              <h2 className="font-display text-lg font-semibold">Order Summary</h2>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <dt>Subtotal</dt>
                  <dd>{formatEGP(total)}</dd>
                </div>
                <div className="flex justify-between border-t pt-3 text-base font-bold">
                  <dt>Total</dt>
                  <dd className="text-primary">{formatEGP(total)}</dd>
                </div>
              </dl>
              <Button asChild className="mt-6 w-full rounded-xl font-semibold shadow-glow">
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>
              <Button asChild variant="ghost" className="mt-2 w-full rounded-xl">
                <Link to="/shop">Continue shopping</Link>
              </Button>
            </aside>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
