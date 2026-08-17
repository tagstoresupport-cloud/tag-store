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
  is_best_seller: boolean;
  featured_order: number;
  best_seller_order: number;
  sort_order: number;
  created_at: string;
  platform_ids: string[];
  product_type: string;
  in_stock: boolean;
  price: number;
  old_price: number | null;
  discount_enabled: boolean;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  image_path: string | null;
  is_visible: boolean;
};

export type Platform = {
  id: string;
  name: string;
  slug: string;
  icon_path: string | null;
  is_enabled: boolean;
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
  payment_account: string;
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
  favicon_url: string | null;
  logo_path: string | null;
  favicon_path: string | null;
  og_image_path: string | null;
  store_description: string;
  address: string;
  working_hours: string;
  support_email: string;
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

// ——— CMS types ———

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image_path: string | null;
  mobile_image_path: string | null;
  button_text: string;
  button_url: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  sort_order: number;
};

export type Promotion = {
  id: string;
  title: string;
  description: string;
  image_path: string | null;
  button_text: string;
  button_url: string;
  is_enabled: boolean;
  sort_order: number;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  is_enabled: boolean;
  sort_order: number;
};

export type NavItem = {
  id: string;
  label: string;
  url: string;
  is_visible: boolean;
  sort_order: number;
};

export type SocialLink = {
  id: string;
  platform: string;
  url: string;
  icon: string;
  is_enabled: boolean;
  sort_order: number;
};

export type PaymentMethod = {
  id: string;
  name: string;
  account_number: string;
  account_name: string;
  instructions: string;
  logo_path: string | null;
  is_enabled: boolean;
  sort_order: number;
};

export type HeroContent = {
  enabled: boolean;
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  button_text: string;
  button_url: string;
  secondary_button_text: string;
  secondary_button_url: string;
  background_image: string | null;
};

export type HomeSection = {
  id: string;
  label: string;
  enabled: boolean;
  title: string;
  subtitle: string;
};

export type WhyItem = { icon: string; title: string; text: string };

export type HomepageContent = {
  hero: HeroContent;
  sections: HomeSection[];
  why_items: WhyItem[];
};

export type AnnouncementContent = {
  enabled: boolean;
  text: string;
  link: string;
  button_text: string;
  position: "top" | "bottom";
};

export type FooterLink = { label: string; url: string };
export type FooterColumn = { title: string; links: FooterLink[] };
export type FooterContent = {
  description: string;
  copyright: string;
  show_contact: boolean;
  columns: FooterColumn[];
};

export type CheckoutContent = {
  title: string;
  eyebrow: string;
  description: string;
  payment_instructions: string;
  screenshot_required: boolean;
  phone_enabled: boolean;
  phone_required: boolean;
  email_enabled: boolean;
  email_required: boolean;
  notes_enabled: boolean;
  notes_required: boolean;
};

export type WebsiteContent = {
  title: string;
  description: string;
  seo_title: string;
  seo_description: string;
  maintenance_mode: boolean;
  maintenance_message: string;
};

export type Pricing = { current: number; old: number | null; off: number | null };

/** Resolves display pricing from the product base price, falling back to variants. */
export function productPricing(p: Product): Pricing {
  let current = Number(p.price) || 0;
  let old: number | null =
    p.discount_enabled && p.old_price ? Number(p.old_price) : null;

  if (!current) {
    const available = (p.variants ?? []).filter((v) => v.available);
    if (available.length > 0) {
      const cheapest = available.reduce((a, b) =>
        effectivePrice(a) <= effectivePrice(b) ? a : b,
      );
      current = effectivePrice(cheapest);
      if (cheapest.discount_price && cheapest.discount_price > 0) old = cheapest.price;
    }
  }

  const hasOld = old !== null && old > current;
  return {
    current,
    old: hasOld ? old : null,
    off: hasOld ? Math.round((1 - current / (old as number)) * 100) : null,
  };
}
