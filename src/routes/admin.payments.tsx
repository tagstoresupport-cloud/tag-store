import { createFileRoute } from "@tanstack/react-router";
import { GripVertical, ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_CHECKOUT,
  useCheckoutContent,
  useCollectionMutations,
  usePaymentMethods,
  useSaveContent,
} from "@/lib/cms";
import { StorageImage } from "@/lib/storage-image";
import type { CheckoutContent, PaymentMethod } from "@/lib/types";

export const Route = createFileRoute("/admin/payments")({
  component: AdminPayments,
});

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
const MAX_BYTES = 5 * 1024 * 1024;

async function uploadLogo(file: File): Promise<string | null> {
  if (!ALLOWED.includes(file.type)) {
    toast.error("Only JPG, PNG, WEBP or SVG images are allowed");
    return null;
  }
  if (file.size > MAX_BYTES) {
    toast.error("Image must be smaller than 5MB");
    return null;
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const path = `payment-methods/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type });
  if (error) {
    toast.error(error.message);
    return null;
  }
  return path;
}

function LogoPicker({
  path,
  onChange,
}: {
  path: string | null;
  onChange: (path: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border bg-secondary/40 transition-colors hover:border-primary"
        aria-label={path ? "Change payment logo" : "Upload payment logo"}
      >
        {busy ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : path ? (
          <StorageImage path={path} alt="Payment logo" className="h-16 w-16 object-contain" />
        ) : (
          <ImagePlus className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {path && !busy && (
        <button
          type="button"
          className="text-[11px] font-medium text-destructive hover:underline"
          onClick={() => onChange(null)}
        >
          Remove
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          const uploaded = await uploadLogo(file);
          setBusy(false);
          if (uploaded) onChange(uploaded);
        }}
      />
    </div>
  );
}

type Draft = {
  name: string;
  account_number: string;
  account_name: string;
  instructions: string;
  logo_path: string | null;
  is_enabled: boolean;
};

const EMPTY: Draft = {
  name: "",
  account_number: "",
  account_name: "",
  instructions: "",
  logo_path: null,
  is_enabled: true,
};

function MethodForm({
  value,
  submitting,
  submitLabel,
  onChange,
  onSubmit,
  onCancel,
}: {
  value: Draft;
  submitting: boolean;
  submitLabel: string;
  onChange: (draft: Draft) => void;
  onSubmit: () => void;
  onCancel?: () => void;
}) {
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.name.trim()) {
          toast.error("Payment method name is required");
          return;
        }
        onSubmit();
      }}
    >
      <div className="flex gap-4">
        <LogoPicker path={value.logo_path} onChange={(logo_path) => onChange({ ...value, logo_path })} />
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Payment method name</Label>
            <Input
              className="mt-2 rounded-xl"
              placeholder="Vodafone Cash"
              value={value.name}
              onChange={(e) => onChange({ ...value, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Account / phone number</Label>
            <Input
              className="mt-2 rounded-xl"
              dir="ltr"
              placeholder="01068012140"
              value={value.account_number}
              onChange={(e) => onChange({ ...value, account_number: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Account name</Label>
            <Input
              className="mt-2 rounded-xl"
              placeholder="Tag Store"
              value={value.account_name}
              onChange={(e) => onChange({ ...value, account_name: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div>
        <Label>Payment instructions</Label>
        <Textarea
          rows={3}
          className="mt-2 rounded-xl"
          placeholder="Send the exact order amount to this number, then upload the payment screenshot below."
          value={value.instructions}
          onChange={(e) => onChange({ ...value, instructions: e.target.value })}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={value.is_enabled}
            onCheckedChange={(is_enabled) => onChange({ ...value, is_enabled })}
          />
          Enabled
        </label>
        <div className="ml-auto flex gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" className="rounded-xl" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={submitting} className="rounded-xl font-semibold">
            {submitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}

function AdminPayments() {
  const { data: methods = [], isLoading } = usePaymentMethods();
  const { create, update, remove, reorder } = useCollectionMutations("payment_methods");

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(EMPTY);
  const [dragId, setDragId] = useState<string | null>(null);

  const startEdit = (m: PaymentMethod) => {
    setEditingId(m.id);
    setEditDraft({
      name: m.name,
      account_number: m.account_number,
      account_name: m.account_name,
      instructions: m.instructions,
      logo_path: m.logo_path,
      is_enabled: m.is_enabled,
    });
  };

  const onDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const ids = methods.map((m) => m.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(to, 0, ids.splice(from, 1)[0]!);
    setDragId(null);
    reorder.mutate(ids, { onSuccess: () => toast.success("Order updated") });
  };

  return (
    <AdminShell title="Payment methods">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold">Payment methods</h2>
              <p className="text-xs text-muted-foreground">
                Only enabled methods appear at checkout. Drag to reorder.
              </p>
            </div>
            {!adding && (
              <Button
                className="rounded-xl font-semibold"
                onClick={() => {
                  setDraft(EMPTY);
                  setAdding(true);
                }}
              >
                <Plus className="mr-1.5 h-4 w-4" /> Add method
              </Button>
            )}
          </div>

          {adding && (
            <div className="mt-5 rounded-2xl border p-4">
              <MethodForm
                value={draft}
                submitting={create.isPending}
                submitLabel="Add payment method"
                onChange={setDraft}
                onCancel={() => setAdding(false)}
                onSubmit={() =>
                  create.mutate(
                    {
                      name: draft.name.trim(),
                      account_number: draft.account_number.trim(),
                      account_name: draft.account_name.trim(),
                      instructions: draft.instructions.trim(),
                      logo_path: draft.logo_path,
                      is_enabled: draft.is_enabled,
                      sort_order: methods.length,
                    },
                    {
                      onSuccess: () => {
                        setAdding(false);
                        setDraft(EMPTY);
                        toast.success("Payment method added");
                      },
                      onError: (e: Error) => toast.error(e.message),
                    },
                  )
                }
              />
            </div>
          )}

          <ul className="mt-5 space-y-3">
            {isLoading && <li className="text-sm text-muted-foreground">Loading...</li>}
            {!isLoading && methods.length === 0 && !adding && (
              <li className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                No payment methods yet. Add one so customers can pay.
              </li>
            )}
            {methods.map((m) => (
              <li
                key={m.id}
                draggable
                onDragStart={() => setDragId(m.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(m.id)}
                className="rounded-2xl border bg-card p-4"
              >
                {editingId === m.id ? (
                  <MethodForm
                    value={editDraft}
                    submitting={update.isPending}
                    submitLabel="Save changes"
                    onChange={setEditDraft}
                    onCancel={() => setEditingId(null)}
                    onSubmit={() =>
                      update.mutate(
                        {
                          id: m.id,
                          values: {
                            name: editDraft.name.trim(),
                            account_number: editDraft.account_number.trim(),
                            account_name: editDraft.account_name.trim(),
                            instructions: editDraft.instructions.trim(),
                            logo_path: editDraft.logo_path,
                            is_enabled: editDraft.is_enabled,
                          },
                        },
                        {
                          onSuccess: () => {
                            setEditingId(null);
                            toast.success("Payment method updated");
                          },
                          onError: (e: Error) => toast.error(e.message),
                        },
                      )
                    }
                  />
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
                    <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border bg-secondary/40">
                      {m.logo_path ? (
                        <StorageImage
                          path={m.logo_path}
                          alt={m.name}
                          className="h-12 w-12 object-contain"
                        />
                      ) : (
                        <ImagePlus className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{m.name}</p>
                      <p className="truncate text-xs text-muted-foreground" dir="ltr">
                        {m.account_number || "No account number"}
                        {m.account_name ? ` · ${m.account_name}` : ""}
                      </p>
                    </div>
                    <span
                      className={`rounded-lg px-2 py-1 text-[11px] font-semibold ${
                        m.is_enabled
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {m.is_enabled ? "Enabled" : "Disabled"}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => startEdit(m)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl"
                        onClick={() =>
                          update.mutate({ id: m.id, values: { is_enabled: !m.is_enabled } })
                        }
                      >
                        {m.is_enabled ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-destructive"
                        onClick={() => {
                          if (confirm(`Delete ${m.name}?`)) remove.mutate(m.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        <CheckoutSettings />
      </div>
    </AdminShell>
  );
}

function CheckoutSettings() {
  const { data } = useCheckoutContent();
  const save = useSaveContent("checkout");
  const [form, setForm] = useState<CheckoutContent>(DEFAULT_CHECKOUT);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const set = <K extends keyof CheckoutContent>(key: K, value: CheckoutContent[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <section className="glass rounded-2xl p-5">
      <h2 className="font-display text-lg font-semibold">Checkout settings</h2>
      <p className="text-xs text-muted-foreground">
        Control the checkout page copy and which customer fields are shown or required.
      </p>

      <form
        className="mt-5 grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(form, {
            onSuccess: () => toast.success("Checkout settings saved"),
            onError: (err: Error) => toast.error(err.message),
          });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Eyebrow</Label>
            <Input
              className="mt-2 rounded-xl"
              value={form.eyebrow}
              onChange={(e) => set("eyebrow", e.target.value)}
            />
          </div>
          <div>
            <Label>Checkout title</Label>
            <Input
              className="mt-2 rounded-xl"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label>Checkout description</Label>
          <Textarea
            rows={2}
            className="mt-2 rounded-xl"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
        <div>
          <Label>General payment instructions (shown above the methods)</Label>
          <Textarea
            rows={2}
            className="mt-2 rounded-xl"
            value={form.payment_instructions}
            onChange={(e) => set("payment_instructions", e.target.value)}
          />
        </div>

        <div className="grid gap-3 rounded-2xl border p-4 sm:grid-cols-2">
          <Toggle
            label="Payment screenshot required"
            checked={form.screenshot_required}
            onChange={(v) => set("screenshot_required", v)}
          />
          <div />
          <Toggle
            label="Phone field enabled"
            checked={form.phone_enabled}
            onChange={(v) => set("phone_enabled", v)}
          />
          <Toggle
            label="Phone required"
            checked={form.phone_required}
            onChange={(v) => set("phone_required", v)}
          />
          <Toggle
            label="Email field enabled"
            checked={form.email_enabled}
            onChange={(v) => set("email_enabled", v)}
          />
          <Toggle
            label="Email required"
            checked={form.email_required}
            onChange={(v) => set("email_required", v)}
          />
          <Toggle
            label="Notes field enabled"
            checked={form.notes_enabled}
            onChange={(v) => set("notes_enabled", v)}
          />
          <Toggle
            label="Notes required"
            checked={form.notes_required}
            onChange={(v) => set("notes_required", v)}
          />
        </div>

        <Button type="submit" disabled={save.isPending} className="rounded-xl font-semibold">
          {save.isPending ? "Saving..." : "Save checkout settings"}
        </Button>
      </form>
    </section>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      {label}
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
