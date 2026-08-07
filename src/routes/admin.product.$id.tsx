import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
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
import { useCategories } from "@/lib/data";
import { slugify, type Product, type Variant } from "@/lib/types";

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
  const [images, setImages] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [variants, setVariants] = useState<Variant[]>([emptyVariant()]);
  const [isVisible, setIsVisible] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    if (!existing) return;
    setName(existing.name);
    setDescription(existing.description ?? "");
    setCategoryId(existing.category_id ?? "none");
    setImages(existing.images ?? []);
    setMainImage(existing.main_image);
    setVariants(existing.variants?.length ? existing.variants : [emptyVariant()]);
    setIsVisible(existing.is_visible);
    setIsFeatured(existing.is_featured);
  }, [existing]);

  const save = useMutation({
    mutationFn: async () => {
      const cleanVariants = variants
        .filter((v) => v.name.trim() !== "")
        .map((v) => ({
          ...v,
          name: v.name.trim(),
          price: Number(v.price) || 0,
          discount_price: v.discount_price ? Number(v.discount_price) : null,
        }));
      if (!name.trim()) throw new Error("Product name is required");
      if (cleanVariants.length === 0) throw new Error("Add at least one option with a name");

      const payload = {
        name: name.trim(),
        slug: slugify(name),
        description: description.trim(),
        category_id: categoryId === "none" ? null : categoryId,
        images,
        main_image: mainImage ?? images[0] ?? null,
        variants: cleanVariants,
        is_visible: isVisible,
        is_featured: isFeatured,
      };

      if (isNew) {
        const { error } = await supabase.from("products").insert(payload as never);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").update(payload as never).eq("id", id);
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
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 text-sm font-medium">
              <Switch checked={isVisible} onCheckedChange={setIsVisible} /> Visible in store
            </label>
            <label className="flex items-center gap-3 text-sm font-medium">
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} /> Featured
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
              <h2 className="font-display text-lg font-bold">Options & pricing</h2>
              <p className="text-xs text-muted-foreground">
                e.g. Primary Account, Secondary Account, Full Game.
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
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-3">
                    <Label>Option name</Label>
                    <Input
                      className="mt-2 rounded-xl"
                      placeholder="Primary Account"
                      value={variant.name}
                      onChange={(e) => updateVariant(index, { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Price (EGP)</Label>
                    <Input
                      type="number"
                      min={0}
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
                      min={0}
                      step="0.01"
                      className="mt-2 rounded-xl"
                      value={variant.discount_price ?? ""}
                      onChange={(e) =>
                        updateVariant(index, {
                          discount_price: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="flex items-end justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm font-medium">
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
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={save.isPending} className="rounded-xl font-semibold">
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
