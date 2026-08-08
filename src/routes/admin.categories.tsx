import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/lib/data";
import { StorageImage } from "@/lib/storage-image";
import { slugify, type Category } from "@/lib/types";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

async function uploadCategoryImage(file: File): Promise<string | null> {
  if (!ALLOWED.includes(file.type)) {
    toast.error("Only JPG, PNG and WEBP images are allowed");
    return null;
  }
  if (file.size > MAX_BYTES) {
    toast.error("Image must be smaller than 5MB");
    return null;
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const path = `categories/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type });
  if (error) {
    toast.error(error.message);
    return null;
  }
  return path;
}

function ImagePicker({
  path,
  busy,
  onPick,
  onRemove,
}: {
  path: string | null;
  busy: boolean;
  onPick: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border bg-secondary/40 transition-colors hover:border-primary"
        aria-label={path ? "Change category image" : "Upload category image"}
      >
        {busy ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : path ? (
          <StorageImage path={path} alt="Category image" className="h-16 w-16 object-cover" />
        ) : (
          <ImagePlus className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {path && !busy && (
        <button
          type="button"
          className="text-[11px] font-medium text-destructive hover:underline"
          onClick={onRemove}
        >
          Remove
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onPick(file);
        }}
      />
    </div>
  );
}

function AdminCategories() {
  const { data: categories = [], isLoading } = useCategories();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [newImage, setNewImage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["categories"] });

  const create = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Category name is required");
      const { error } = await supabase.from("categories").insert({
        name: name.trim(),
        slug: slugify(name),
        sort_order: categories.length,
        image_path: newImage,
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      setName("");
      setNewImage(null);
      invalidate();
      toast.success("Category added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rename = useMutation({
    mutationFn: async ({ category, newName }: { category: Category; newName: string }) => {
      const { error } = await supabase
        .from("categories")
        .update({ name: newName.trim(), slug: slugify(newName) })
        .eq("id", category.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const setImage = async (category: Category, path: string | null) => {
    setBusyId(category.id);
    if (category.image_path && category.image_path !== path) {
      await supabase.storage.from("product-images").remove([category.image_path]);
    }
    const { error } = await supabase
      .from("categories")
      .update({ image_path: path } as never)
      .eq("id", category.id);
    setBusyId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    invalidate();
    toast.success(path ? "Category image updated" : "Category image removed");
  };

  const remove = useMutation({
    mutationFn: async (category: Category) => {
      if (category.image_path) {
        await supabase.storage.from("product-images").remove([category.image_path]);
      }
      const { error } = await supabase.from("categories").delete().eq("id", category.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Category deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell title="Categories">
      <div className="mx-auto max-w-2xl">
        <form
          className="glass flex items-start gap-3 rounded-2xl p-5"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <ImagePicker
            path={newImage}
            busy={busyId === "new"}
            onPick={async (file) => {
              setBusyId("new");
              const path = await uploadCategoryImage(file);
              setBusyId(null);
              if (path) setNewImage(path);
            }}
            onRemove={async () => {
              if (newImage) await supabase.storage.from("product-images").remove([newImage]);
              setNewImage(null);
            }}
          />
          <Input
            placeholder="New category name"
            className="mt-2 rounded-xl"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button type="submit" className="mt-2 shrink-0 rounded-xl font-semibold">
            <Plus className="mr-1.5 h-4 w-4" /> Add
          </Button>
        </form>

        <div className="glass mt-5 rounded-2xl">
          {isLoading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No categories yet.</p>
          ) : (
            <ul className="divide-y">
              {categories.map((category) => (
                <li key={category.id} className="flex items-start gap-3 p-3">
                  <ImagePicker
                    path={category.image_path}
                    busy={busyId === category.id}
                    onPick={async (file) => {
                      setBusyId(category.id);
                      const path = await uploadCategoryImage(file);
                      setBusyId(null);
                      if (path) await setImage(category, path);
                    }}
                    onRemove={() => setImage(category, null)}
                  />
                  <Input
                    defaultValue={category.name}
                    className="mt-2 rounded-xl border-transparent bg-transparent"
                    onBlur={(e) => {
                      if (e.target.value.trim() && e.target.value !== category.name) {
                        rename.mutate({ category, newName: e.target.value });
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mt-2 shrink-0 rounded-xl text-destructive"
                    aria-label="Delete category"
                    onClick={() => {
                      if (confirm(`Delete category "${category.name}"?`)) remove.mutate(category);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
