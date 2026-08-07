import { ArrowLeft, ArrowRight, Loader2, Star, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { StorageImage } from "@/lib/storage-image";
import { cn } from "@/lib/utils";

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export function ImageUploader({
  images,
  mainImage,
  onChange,
}: {
  images: string[];
  mainImage: string | null;
  onChange: (images: string[], mainImage: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      if (!ALLOWED.includes(file.type)) {
        toast.error(`${file.name}: only JPG, PNG and WEBP are allowed`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        toast.error(`${file.name}: must be smaller than 5MB`);
        continue;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
      const path = `products/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type });
      if (error) {
        toast.error(`${file.name}: ${error.message}`);
        continue;
      }
      uploaded.push(path);
    }
    setUploading(false);
    if (uploaded.length > 0) {
      const next = [...images, ...uploaded];
      onChange(next, mainImage ?? next[0] ?? null);
      toast.success(`${uploaded.length} image(s) uploaded`);
    }
  };

  const remove = async (path: string) => {
    await supabase.storage.from("product-images").remove([path]);
    const next = images.filter((p) => p !== path);
    onChange(next, mainImage === path ? (next[0] ?? null) : mainImage);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const current = next[index]!;
    next[index] = next[target]!;
    next[target] = current;
    onChange(next, mainImage);
  };

  return (
    <div>
      <label
        htmlFor="product-images"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void upload(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "hover:border-primary/60",
        )}
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : (
          <Upload className="h-6 w-6 text-primary" />
        )}
        <span className="text-sm font-medium">
          {uploading ? "Uploading..." : "Drag & drop images here, or click to select"}
        </span>
        <span className="text-xs text-muted-foreground">JPG, PNG or WEBP · up to 5MB each</span>
        <input
          id="product-images"
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={(e) => void upload(e.target.files)}
        />
      </label>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((path, index) => (
            <div
              key={path}
              className={cn(
                "overflow-hidden rounded-xl border bg-card",
                mainImage === path && "border-primary",
              )}
            >
              <StorageImage path={path} alt="Product" className="aspect-square w-full object-cover" />
              <div className="flex items-center justify-between gap-1 p-1.5">
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => move(index, -1)}
                    aria-label="Move left"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => move(index, 1)}
                    aria-label="Move right"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn("h-7 w-7", mainImage === path && "text-primary")}
                    onClick={() => onChange(images, path)}
                    aria-label="Set as main image"
                  >
                    <Star className={cn("h-3.5 w-3.5", mainImage === path && "fill-current")} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => void remove(path)}
                    aria-label="Delete image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
