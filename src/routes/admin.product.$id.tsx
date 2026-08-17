import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { Check, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { ImageUploader } from "@/components/admin/ImageUploader";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { usePlatforms } from "@/lib/cms";
import { useCategories } from "@/lib/data";
import { StorageImage } from "@/lib/storage-image";
import { slugify, type Product, type Variant } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/product/$id")({
  component: ProductEditor,
});

const emptyVariant = (): Variant => ({
  id: crypto.randomUUID(),
  name: "",
  price: 0,
  discount_price: null,
  available: true,
});

function ProductEditor() {
  const { id } = useParams({ from: "/admin/product/$id" });
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();
  const { data: platforms = [] } = usePlatforms();

  const { data: existing } = useQuery({
    queryKey: ["admin-product", id],
    enabled: !isNew,
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return (data as unknown as Product) ?? null;
    },
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("none");
  const [platformIds, setPlatformIds] = useState<string[]>([]);
  const [productType, setProductType] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [sortOrder, setSortOrder] = useState("0");
  const [isVisible, setIsVisible] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);

  useEffect(() => {
    if (!existing) return;
    setName(existing.name);
    setDescription(existing.description ?? "");
    setCategoryId(existing.category_id ?? "none");
    setPlatformIds(existing.platform_ids ?? []);
    setProductType(existing.product_type ?? "");
    setImages(existing.images ?? []);
    setMainImage(existing.main_image);
    setVariants(existing.variants ?? []);
    setPrice(existing.price ? String(existing.price) : "");
    setOldPrice(existing.old_price ? String(existing.old_price) : "");
    setDiscountEnabled(existing.discount_enabled ?? false);
    setInStock(existing.in_stock ?? true);
    setSortOrder(String(existing.sort_order ?? 0));
    setIsVisible(existing.is_visible);
    setIsFeatured(existing.is_featured);
    setIsBestSeller(existing.is_best_seller ?? false);
  }, [existing]);

  const save = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Product name is required");
      const basePrice = Number(price) || 0;
      const cleanVariants = variants
        .filter((v) => v.name.trim() !== "")
        .map((v) => ({
          ...v,
          name: v.name.trim(),
          price: Number(v.price) || 0,
          discount_price: v.discount_price ? Number(v.discount_price) : null,
        }));
      if (basePrice <= 0 && cleanVariants.length === 0) {
        throw new Error("Set a price, or add at least one option with a name and price");
      }

      const payload = {
        name: name.trim(),
        slug: slugify(name),
        description: description.trim(),
        category_id: categoryId === "none" ? null : categoryId,
        platform_ids: platformIds,
        product_type: productType.trim(),
        images,
        main_image: mainImage ?? images[0] ?? null,
        variants: cleanVariants,
        price: basePrice,
        old_price: oldPrice ? Number(oldPrice) : null,
        discount_enabled: discountEnabled,
        in_stock: inStock,
        sort_order: Number(sortOrder) || 0,
        is_visible: isVisible,
        is_featured: isFeatured,
        is_best_seller: isBestSeller,
      };

      if (isNew) {
        const { error } = await supabase.from("products").insert(payload as never);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("products")
          .update(payload as never)
          .eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product", id] });
      toast.success(isNew ? "Product created" : "Product updated");
      navigate({ to: "/admin/products" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateVariant = (index: number, patch: Partial<Variant>) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };

  const togglePlatform = (platformId: string) => {
    setPlatformIds((prev) =>
      prev.includes(platformId) ? prev.filter((p) => p !== platformId) : [...prev, platformId],
    );
  };

  return (
    <AdminShell title={isNew ? "Add product" : "Edit product"}>
      <form
        className="mx-auto max-w-3xl space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <div className="glass space-y-4 rounded-2xl p-5">
          <div>
            <Label htmlFor="name">Product name</Label>
            <Input
              id="name"
              className="mt-2 rounded-xl"
              placeholder="EA SPORTS FC 27"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={5}
              className="mt-2 rounded-xl"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="mt-2 rounded-xl">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Uncategorized</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ptype">Product type</Label>
              <Input
                id="ptype"
                className="mt-2 rounded-xl"
                placeholder="Digital Account"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Platforms</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Select one or more. Manage the list in Platforms.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {platforms.length === 0 && (
                <p className="text-xs text-muted-foreground">No platforms yet.</p>
              )}
              {platforms.map((p) => {
                const active = platformIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary/15 text-primary"
                        : "text-muted-foreground hover:border-primary/50 hover:text-foreground",
                    )}
                  >
                    {p.icon_path && (
                      <StorageImage
                        path={p.icon_path}
                        alt={p.name}
                        className="h-5 w-5 rounded object-contain"
                      />
                    )}
                    {p.name}
                    {active && <Check className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="glass space-y-4 rounded-2xl p-5">
          <h2 className="font-display text-lg font-bold">Pricing & stock</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="price">Price (EGP)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                className="mt-2 rounded-xl"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="oldprice">Old price (EGP)</Label>
              <Input
                id="oldprice"
                type="number"
                min="0"
                step="0.01"
                className="mt-2 rounded-xl"
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sort">Sort order</Label>
              <Input
                id="sort"
                type="number"
                className="mt-2 rounded-xl"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 text-sm font-medium">
              <Switch checked={discountEnabled} onCheckedChange={setDiscountEnabled} /> Show discount
            </label>
            <label className="flex items-center gap-3 text-sm font-medium">
              <Switch checked={inStock} onCheckedChange={setInStock} /> In stock
            </label>
            <label className="flex items-center gap-3 text-sm font-medium">
              <Switch checked={isVisible} onCheckedChange={setIsVisible} /> Visible in store
            </label>
            <label className="flex items-center gap-3 text-sm font-medium">
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} /> Featured
            </label>
            <label className="flex items-center gap-3 text-sm font-medium">
              <Switch checked={isBestSeller} onCheckedChange={setIsBestSeller} /> Best seller
            </label>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg font-bold">Images</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            The starred image is used as the main product image.
          </p>
          <ImageUploader
            images={images}
            mainImage={mainImage}
            onChange={(next, main) => {
              setImages(next);
              setMainImage(main);
            }}
          />
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold">Options (optional)</h2>
              <p className="text-xs text-muted-foreground">
                e.g. Primary Account, Secondary Account, Full Game. Leave empty to sell at the
                single price above.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0 rounded-xl"
              onClick={() => setVariants((prev) => [...prev, emptyVariant()])}
            >
              <Plus className="mr-1.5 h-4 w-4" /> Add
            </Button>
          </div>

          <div className="mt-4 space-y-4">
            {variants.map((variant, index) => (
              <div key={variant.id} className="rounded-xl border p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label>Option name</Label>
                    <Input
                      className="mt-2 rounded-xl"
                      placeholder="Primary Account"
                      value={variant.name}
                      onChange={(e) => updateVariant(index, { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="mt-2 rounded-xl"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, { price: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Discount price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="mt-2 rounded-xl"
                      value={variant.discount_price ?? ""}
                      onChange={(e) =>
                        updateVariant(index, {
                          discount_price: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <label className="flex items-center gap-3 text-sm font-medium">
                    <Switch
                      checked={variant.available}
                      onCheckedChange={(v) => updateVariant(index, { available: v })}
                    />
                    Available
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-xl text-destructive"
                    aria-label="Remove option"
                    onClick={() => setVariants((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" className="rounded-xl font-semibold" disabled={save.isPending}>
            {save.isPending ? "Saving..." : isNew ? "Create product" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl"
            onClick={() => navigate({ to: "/admin/products" })}
          >
            Cancel
          </Button>
        </div>
      </form>
    </AdminShell>
  );
}
