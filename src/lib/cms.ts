import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type {
  AnnouncementContent,
  Banner,
  CheckoutContent,
  Faq,
  FooterContent,
  HomepageContent,
  NavItem,
  PaymentMethod,
  Promotion,
  SocialLink,
  WebsiteContent,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/* site_content (key/value CMS blocks)                                  */
/* ------------------------------------------------------------------ */

export const DEFAULT_HOMEPAGE: HomepageContent = {
  hero: {
    enabled: true,
    eyebrow: "PlayStation Digital Store",
    title: "Level up with Tag Store",
    subtitle: "",
    description:
      "Digital PlayStation games at honest prices. Choose your account type and start playing.",
    button_text: "Shop Now",
    button_url: "/shop",
    secondary_button_text: "Contact Us",
    secondary_button_url: "/contact",
    background_image: null,
  },
  sections: [
    { id: "banners", label: "Banners", enabled: true, title: "", subtitle: "" },
    { id: "categories", label: "Categories", enabled: true, title: "Categories", subtitle: "" },
    { id: "featured", label: "Featured Products", enabled: true, title: "Featured Products", subtitle: "" },
    { id: "latest", label: "Latest Products", enabled: true, title: "Latest Products", subtitle: "" },
    { id: "bestsellers", label: "Best Sellers", enabled: false, title: "Best Sellers", subtitle: "" },
    { id: "promotions", label: "Promotional Sections", enabled: true, title: "", subtitle: "" },
    { id: "why", label: "Why Choose Us", enabled: true, title: "Why Choose Us", subtitle: "" },
    { id: "faq", label: "FAQ", enabled: true, title: "Frequently Asked Questions", subtitle: "" },
    { id: "cta", label: "Help CTA", enabled: true, title: "Need help choosing a game?", subtitle: "" },
  ],
  why_items: [],
};

export const DEFAULT_ANNOUNCEMENT: AnnouncementContent = {
  enabled: false,
  text: "",
  link: "",
  button_text: "",
  position: "top",
};

export const DEFAULT_FOOTER: FooterContent = {
  description: "Tag Store — Premium PlayStation digital games.",
  copyright: "",
  show_contact: true,
  columns: [],
};

export const DEFAULT_CHECKOUT: CheckoutContent = {
  title: "Checkout",
  eyebrow: "Secure order",
  description: "Choose a payment method, send the total, then upload your payment screenshot.",
  payment_instructions: "",
  screenshot_required: true,
  phone_enabled: true,
  phone_required: true,
  email_enabled: true,
  email_required: true,
  notes_enabled: true,
  notes_required: false,
};

export const DEFAULT_WEBSITE: WebsiteContent = {
  title: "Tag Store",
  description: "",
  seo_title: "",
  seo_description: "",
  maintenance_mode: false,
  maintenance_message: "We are performing maintenance. Please check back soon.",
};

async function fetchContent<T>(key: string, fallback: T): Promise<T> {
  const { data, error } = await supabase
    .from("site_content")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  if (!data?.value) return fallback;
  return { ...fallback, ...(data.value as object) } as T;
}

function useContent<T>(key: string, fallback: T) {
  return useQuery({
    queryKey: ["site-content", key],
    queryFn: () => fetchContent<T>(key, fallback),
    staleTime: 30_000,
  });
}

export const useHomepageContent = () => useContent("homepage", DEFAULT_HOMEPAGE);
export const useAnnouncement = () => useContent("announcement", DEFAULT_ANNOUNCEMENT);
export const useFooterContent = () => useContent("footer", DEFAULT_FOOTER);
export const useCheckoutContent = () => useContent("checkout", DEFAULT_CHECKOUT);
export const useWebsiteContent = () => useContent("website", DEFAULT_WEBSITE);

export function useSaveContent(key: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (value: unknown) => {
      const { error } = await supabase
        .from("site_content")
        .upsert({ key, value: value as never }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["site-content", key] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Ordered collections                                                  */
/* ------------------------------------------------------------------ */

function useCollection<T>(table: string, columns = "*") {
  return useQuery({
    queryKey: [table],
    queryFn: async (): Promise<T[]> => {
      const { data, error } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from(table as any)
        .select(columns)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as T[];
    },
  });
}

export const useBanners = () => useCollection<Banner>("banners");
export const usePromotions = () => useCollection<Promotion>("promotions");
export const useFaqs = () => useCollection<Faq>("faqs");
export const useNavItems = () => useCollection<NavItem>("nav_items");
export const useSocialLinks = () => useCollection<SocialLink>("social_links");
export const usePaymentMethods = () => useCollection<PaymentMethod>("payment_methods");

export function useCollectionMutations(table: string) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: [table] });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = () => supabase.from(table as any);

  const create = useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      const { error } = await t().insert(row as never);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      const { error } = await t()
        .update(values as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await t().delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const reorder = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((id, index) =>
          t()
            .update({ sort_order: index } as never)
            .eq("id", id),
        ),
      );
    },
    onSuccess: invalidate,
  });

  return { create, update, remove, reorder };
}

/** Banners that are active and inside their scheduled window. */
export function activeBanners(banners: Banner[] | undefined): Banner[] {
  const now = Date.now();
  return (banners ?? []).filter((b) => {
    if (!b.is_active) return false;
    if (b.start_date && new Date(b.start_date).getTime() > now) return false;
    if (b.end_date && new Date(b.end_date).getTime() < now) return false;
    return true;
  });
}
