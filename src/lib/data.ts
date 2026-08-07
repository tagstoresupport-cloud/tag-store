import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Category, Product, StoreSettings } from "@/lib/types";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, sort_order")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Category[];
    },
  });
}

export function useProducts(options?: { adminView?: boolean }) {
  const adminView = options?.adminView ?? false;
  return useQuery({
    queryKey: ["products", adminView],
    queryFn: async (): Promise<Product[]> => {
      let query = supabase.from("products").select("*").order("created_at", { ascending: false });
      if (!adminView) query = query.eq("is_visible", true);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as Product[];
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as Product) ?? null;
    },
  });
}

export function useStoreSettings() {
  return useQuery({
    queryKey: ["store-settings"],
    queryFn: async (): Promise<StoreSettings> => {
      const { data, error } = await supabase.from("store_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data as unknown as StoreSettings;
    },
    staleTime: 1000 * 60 * 5,
  });
}
