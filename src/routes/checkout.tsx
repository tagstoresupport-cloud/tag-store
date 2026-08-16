import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Copy, Upload, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { EmptyState } from "@/components/site/ProductCard";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { useStoreSettings } from "@/lib/data";
import { notifyStoreOfOrder } from "@/lib/order-notification";
import { placeOrder } from "@/lib/orders.functions";

import { StorageImage } from "@/lib/storage-image";
import { DEFAULT_CHECKOUT, useCheckoutContent, usePaymentMethods } from "@/lib/cms";
import { formatEGP, type CheckoutContent, type PaymentMethod } from "@/lib/types";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Tag Store" },
      {
        name: "description",
        content: "Complete your Tag Store order and pay securely with Vodafone Cash.",
      },
      { property: "og:title", content: "Checkout — Tag Store" },
      { property: "og:description", content: "Pay with Vodafone Cash and upload your receipt." },
      { property: "og:image", content: "https://tag-store.lovable.app/__l5e/assets-v1/fe7cc6a6-9727-41a9-ae7e-95f4f01fb5de/tag-store-og.png" },
      { name: "twitter:image", content: "https://tag-store.lovable.app/__l5e/assets-v1/fe7cc6a6-9727-41a9-ae7e-95f4f01fb5de/tag-store-og.png" },
    ],
  }),
  component: CheckoutPage,
});

function buildSchema(content: CheckoutContent) {
  const phone = z
    .string()
    .trim()
    .max(30)
    .regex(/^[0-9+\-\s()]*$/, "Phone number may only contain digits");
  const email = z.string().trim().max(255);

  return z.object({
    customer_name: z.string().trim().min(2, "Please enter your full name").max(100),
    phone:
      content.phone_enabled && content.phone_required
        ? phone.min(6, "Please enter a valid phone number")
        : phone.optional().or(z.literal("")),
    email:
      content.email_enabled && content.email_required
        ? email.email("Please enter a valid email").min(1, "Please enter your email")
        : email.optional().or(z.literal("")),
    notes:
      content.notes_enabled && content.notes_required
        ? z.string().trim().min(1, "Please add a note").max(1000)
        : z.string().trim().max(1000).optional().or(z.literal("")),
  });
}

const ALLOWED = ["image/jpeg", "image/jpg", "image/png"];
const MAX_BYTES = 5 * 1024 * 1024;

function CheckoutPage() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const submitOrder = useServerFn(placeOrder);
  const { data: checkout = DEFAULT_CHECKOUT } = useCheckoutContent();
  const { data: allMethods = [] } = usePaymentMethods();
  const methods = useMemo(
    () => (allMethods as PaymentMethod[]).filter((m) => m.is_enabled),
    [allMethods],
  );
  const formSchema = useMemo(() => buildSchema(checkout), [checkout]);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [methodId, setMethodId] = useState<string | null>(null);
  const [done, setDone] = useState<{ order_number: string; total: number } | null>(null);

  const selected = methods.find((m) => m.id === methodId) ?? null;

  useEffect(() => {
    if (!methodId && methods.length === 1) setMethodId(methods[0]!.id);
  }, [methodId, methods]);

  const onFile = (selected: File | null) => {
    if (!selected) return;
    if (!ALLOWED.includes(selected.type)) {
      toast.error("Only JPG, JPEG and PNG files are allowed");
      return;
    }
    if (selected.size > MAX_BYTES) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const parsed = formSchema.safeParse({
      customer_name: formData.get("customer_name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      notes: formData.get("notes") || undefined,
    });

    const nextErrors: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        nextErrors[String(issue.path[0])] = issue.message;
      }
    }
    if (!file) nextErrors["screenshot"] = "Payment screenshot is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !parsed.success || !file) return;

    setSubmitting(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
      const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("payment-screenshots")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw new Error(uploadError.message);

      const orderedItems = items.map((i) => ({
        product_name: i.product_name,
        variant_name: i.variant_name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      }));

      const result = await submitOrder({
        data: {
          ...parsed.data,
          notes: parsed.data.notes ?? "",
          payment_screenshot_path: path,
          items: items.map((i) => ({
            product_id: i.product_id,
            variant_id: i.variant_id,
            quantity: i.quantity,
          })),
        },
      });

      clear();
      setDone(result);

      // Order is saved — notify the store. Never blocks or fails the order.
      void notifyStoreOfOrder({
        order_number: result.order_number,
        customer_name: parsed.data.customer_name,
        customer_email: parsed.data.email ?? "",
        phone: parsed.data.phone ?? "",
        notes: parsed.data.notes ?? "",
        total: result.total,
        items: orderedItems,
      });

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not place your order");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
          <h1 className="mt-6 text-3xl font-bold">Order received</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your order ID is{" "}
            <span className="font-display font-bold text-primary">{done.order_number}</span>. We
            will verify your payment and contact you shortly.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Total paid: <strong>{formatEGP(done.total)}</strong>
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-xl font-semibold">
              <Link to="/shop">Continue shopping</Link>
            </Button>
            <Button asChild variant="secondary" className="rounded-xl">
              <Link to="/contact">Contact support</Link>
            </Button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Secure order"
        title="Checkout"
        subtitle="Send the total with Vodafone Cash, then upload your payment screenshot."
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {items.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            description="Add a game to your cart before checking out."
          />
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <section className="rounded-2xl border bg-card p-6">
                <h2 className="font-display text-lg font-semibold">Your information</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name" name="customer_name" error={errors["customer_name"]}>
                    <Input
                      id="customer_name"
                      name="customer_name"
                      maxLength={100}
                      required
                      className="rounded-xl"
                      placeholder="Your name"
                    />
                  </Field>
                  <Field label="Phone Number" name="phone" error={errors["phone"]}>
                    <Input
                      id="phone"
                      name="phone"
                      maxLength={30}
                      required
                      dir="ltr"
                      className="rounded-xl"
                      placeholder="01xxxxxxxxx"
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Email" name="email" error={errors["email"]}>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        maxLength={255}
                        required
                        className="rounded-xl"
                        placeholder="you@example.com"
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Notes (optional)" name="notes" error={errors["notes"]}>
                      <Textarea
                        id="notes"
                        name="notes"
                        maxLength={1000}
                        rows={3}
                        className="rounded-xl"
                        placeholder="Anything we should know about your order"
                      />
                    </Field>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border bg-card p-6">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                  <Wallet className="h-5 w-5 text-primary" /> Payment — Vodafone Cash
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Transfer the exact total below to our Vodafone Cash number, then upload a
                  screenshot of the transfer as proof of payment.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3">
                  <span className="font-display text-xl font-bold tracking-wide" dir="ltr">
                    {selected?.account_number ?? ""}
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => {
                      navigator.clipboard.writeText(selected?.account_number ?? "");
                      toast.success("Number copied");
                    }}
                  >
                    <Copy className="mr-1 h-3.5 w-3.5" /> Copy
                  </Button>
                  <span className="ml-auto text-sm font-semibold">
                    Amount: {formatEGP(total)}
                  </span>
                </div>

                <div className="mt-6">
                  <Label className="text-sm font-semibold">
                    Upload Payment Screenshot <span className="text-destructive">*</span>
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Required. Accepted formats: JPG, JPEG, PNG (max 5MB). Your order cannot be
                    confirmed without proof of payment.
                  </p>
                  <label
                    htmlFor="screenshot"
                    className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors hover:border-primary/60"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      onFile(e.dataTransfer.files[0] ?? null);
                    }}
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="Payment screenshot preview"
                        className="max-h-56 rounded-xl object-contain"
                      />
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium">
                          Drag &amp; drop or click to upload
                        </span>
                      </>
                    )}
                    <input
                      id="screenshot"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      className="hidden"
                      onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {file && (
                    <p className="mt-2 text-xs text-muted-foreground">Selected: {file.name}</p>
                  )}
                  {errors["screenshot"] && (
                    <p className="mt-2 text-xs text-destructive">{errors["screenshot"]}</p>
                  )}
                </div>
              </section>
            </div>

            <aside className="h-fit rounded-2xl border bg-card p-6 lg:sticky lg:top-24">
              <h2 className="font-display text-lg font-semibold">Order Summary</h2>
              <ul className="mt-4 space-y-3">
                {items.map((item) => (
                  <li
                    key={`${item.product_id}-${item.variant_id}`}
                    className="flex items-center gap-3"
                  >
                    <StorageImage
                      path={item.image}
                      alt={item.product_name}
                      className="h-14 w-12 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.variant_name} × {item.quantity}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold">
                      {formatEGP(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex justify-between border-t pt-4 text-base font-bold">
                <span>Total</span>
                <span className="text-primary">{formatEGP(total)}</span>
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full rounded-xl font-semibold shadow-glow"
              >
                {submitting ? "Placing order..." : "Place Order"}
              </Button>
            </aside>
          </form>
        )}
      </div>
    </SiteLayout>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={name} className="text-sm">
        {label}
      </Label>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
