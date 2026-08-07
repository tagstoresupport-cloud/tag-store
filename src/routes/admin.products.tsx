import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, EyeOff, Pencil, PlusCircle, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useCategories, useProducts } from "@/lib/data";
import { StorageImage } from "@/lib/storage-image";
import { priceRange, type Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const { data: products = [], isLoading } = useProducts({ adminView: true });
  const { data: categories = [] } = useCategories();
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const toggle = useMutation({
    mutationFn: async ({ product, field }: { product: Product; field: "is_visible" | "is_featured" }) => {
      const patch =
        field === "is_visible"
          ? { is_visible: !product.is_visible }
          : { is_featured: !product.is_featured };
      const { error } = await supabase.from("products").update(patch).eq("id", product.id);
      if (error) throw error;
    },

    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (product: Product) => {
      if (product.images.length > 0) {
        await supabase.storage.from("product-images").remove(product.images);
      }
      const { error } = await supabase.from("products").delete().eq("id", product.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Product deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminShell title="Products">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <Input
          placeholder="Search products..."
          className="max-w-sm rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button asChild className="shrink-0 rounded-xl font-semibold">
          <Link to="/admin/product/$id" params={{ id: "new" }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add product
          </Link>
        </Button>
      </div>

      <div className="glass mt-5 overflow-hidden rounded-2xl">
        {isLoading ? (
          <p className="p-8 text-sm text-muted-foreground">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-display text-lg font-semibold">No products yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first game to start selling.
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {filtered.map((product) => (
              <li key={product.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-secondary">
                  <StorageImage
                    path={product.main_image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{product.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {categories.find((c) => c.id === product.category_id)?.name ?? "Uncategorized"}
                    {" · "}
                    {priceRange(product.variants) ?? "No price"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Badge variant={product.is_visible ? "secondary" : "outline"}>
                    {product.is_visible ? "Visible" : "Hidden"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("rounded-xl", product.is_featured && "text-primary")}
                    onClick={() => toggle.mutate({ product, field: "is_featured" })}
                    aria-label="Toggle featured"
                  >
                    <Star className={cn("h-4 w-4", product.is_featured && "fill-current")} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl"
                    onClick={() => toggle.mutate({ product, field: "is_visible" })}
                    aria-label="Toggle visibility"
                  >
                    {product.is_visible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button asChild variant="ghost" size="icon" className="rounded-xl">
                    <Link to="/admin/product/$id" params={{ id: product.id }} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl text-destructive"
                    aria-label="Delete"
                    onClick={() => {
                      if (confirm(`Delete "${product.name}"? This cannot be undone.`)) {
                        remove.mutate(product);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
