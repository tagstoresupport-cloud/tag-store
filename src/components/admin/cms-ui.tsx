import { GripVertical, ImagePlus, Loader2 } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { StorageImage } from "@/lib/storage-image";
import { cn } from "@/lib/utils";

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadImage(file: File, folder: string): Promise<string | null> {
  if (!ALLOWED.includes(file.type)) {
    toast.error("Only JPG, PNG, WEBP and SVG images are allowed");
    return null;
  }
  if (file.size > MAX_BYTES) {
    toast.error("Image must be smaller than 5MB");
    return null;
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type });
  if (error) {
    toast.error(error.message);
    return null;
  }
  return path;
}

export function ImageField({
  label,
  path,
  folder,
  onChange,
  className,
}: {
  label: string;
  path: string | null;
  folder: string;
  onChange: (path: string | null) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    const uploaded = await uploadImage(file, folder);
    setBusy(false);
    if (uploaded) onChange(uploaded);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="grid h-16 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border bg-secondary/40 transition-colors hover:border-primary"
        >
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : path ? (
            <StorageImage path={path} alt={label} className="h-16 w-24 object-cover" />
          ) : (
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
        <div className="flex flex-col gap-1 text-xs">
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => inputRef.current?.click()}
          >
            {path ? "Change image" : "Upload image"}
          </button>
          {path && (
            <button
              type="button"
              className="font-medium text-destructive hover:underline"
              onClick={() => onChange(null)}
            >
              Remove
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  textarea,
  rows = 3,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm">{label}</Label>
      {textarea ? (
        <Textarea
          value={value}
          rows={rows}
          placeholder={placeholder}
          className="rounded-xl"
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input
          value={value}
          type={type}
          placeholder={placeholder}
          className="rounded-xl"
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

export function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function AdminCard({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

/** Simple HTML5 drag-and-drop list. Calls onReorder with the new id order. */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
}: {
  items: T[];
  onReorder: (ids: string[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
}) {
  const [dragId, setDragId] = useState<string | null>(null);

  const drop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const ids = items.map((i) => i.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(to, 0, ids.splice(from, 1)[0]!);
    setDragId(null);
    onReorder(ids);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => setDragId(item.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => drop(item.id)}
          className={cn(
            "rounded-2xl border bg-background p-4 transition-opacity",
            dragId === item.id && "opacity-50",
          )}
        >
          <div className="flex items-start gap-3">
            <GripVertical className="mt-1 h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
            <div className="min-w-0 flex-1">{renderItem(item, index)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
