import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const itemSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

const orderSchema = z.object({
  customer_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(30),
  email: z.string().trim().email().max(255),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  payment_screenshot_path: z.string().trim().min(1).max(500),
  items: z.array(itemSchema).min(1).max(50),
});

type Variant = {
  id: string;
  name: string;
  price: number;
  discount_price?: number | null;
  available: boolean;
};

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => orderSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const ids = [...new Set(data.items.map((i) => i.product_id))];
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("id, name, main_image, images, variants, is_visible")
      .in("id", ids);

    if (error) throw new Error(`Could not load products: ${error.message}`);

    const orderItems = data.items.map((item) => {
      const product = (products ?? []).find((p) => p.id === item.product_id);
      if (!product || !product.is_visible) {
        throw new Error("One of the products is no longer available.");
      }
      const variants = (product.variants ?? []) as unknown as Variant[];
      const variant = variants.find((v) => v.id === item.variant_id);
      if (!variant || !variant.available) {
        throw new Error(`The selected option for "${product.name}" is no longer available.`);
      }
      const price =
        variant.discount_price && variant.discount_price > 0
          ? Number(variant.discount_price)
          : Number(variant.price);

      const images = (product.images ?? []) as unknown as string[];
      return {
        product_id: product.id,
        product_name: product.name,
        image: product.main_image ?? images[0] ?? null,
        variant_name: variant.name,
        price,
        quantity: item.quantity,
      };
    });

    const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: data.customer_name,
        phone: data.phone,
        email: data.email,
        notes: data.notes || null,
        items: orderItems,
        total,
        payment_method: "Vodafone Cash",
        payment_screenshot_path: data.payment_screenshot_path,
        status: "Pending",
      })
      .select("order_number, total")
      .single();

    if (insertError) throw new Error(`Could not save the order: ${insertError.message}`);

    return { order_number: inserted.order_number, total: Number(inserted.total) };
  });
