export type Variant = {
  id: string;
  name: string;
  price: number;
  discount_price?: number | null;
  available: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string | null;
  images: string[];
  main_image: string | null;
  variants: Variant[];
  is_visible: boolean;
  is_featured: boolean;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type OrderItem = {
  product_id: string;
  product_name: string;
  image: string | null;
  variant_name: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email: string;
  notes: string | null;
  items: OrderItem[];
  total: number;
  payment_method: string;
  payment_screenshot_path: string | null;
  status: OrderStatus;
  created_at: string;
};

export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Completed",
  "Cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type StoreSettings = {
  id: number;
  store_name: string;
  logo_url: string | null;
  support_phone: string;
  vodafone_number: string;
  social_links: Record<string, string>;
  footer_text: string;
};

export function effectivePrice(v: Variant): number {
  return v.discount_price && v.discount_price > 0 ? v.discount_price : v.price;
}

export function formatEGP(value: number): string {
  return `${Number(value).toLocaleString("en-EG", { maximumFractionDigits: 2 })} EGP`;
}

export function priceRange(variants: Variant[]): string | null {
  const prices = variants.filter((v) => v.available).map(effectivePrice);
  if (prices.length === 0) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatEGP(min) : `${formatEGP(min)} — ${formatEGP(max)}`;
}

export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
      .replace(/^-+|-+$/g, "") || `item-${Date.now()}`
  );
}
