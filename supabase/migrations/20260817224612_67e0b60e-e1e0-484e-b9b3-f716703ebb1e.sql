CREATE TABLE public.platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  slug text NOT NULL DEFAULT '',
  icon_path text,
  is_enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.platforms TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platforms TO authenticated;
GRANT ALL ON public.platforms TO service_role;

ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platforms public read" ON public.platforms FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "platforms admin write" ON public.platforms FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER platforms_set_updated_at BEFORE UPDATE ON public.platforms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS platform_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS product_type text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS in_stock boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS old_price numeric,
  ADD COLUMN IF NOT EXISTS discount_enabled boolean NOT NULL DEFAULT false;

ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS whatsapp_number text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'EGP',
  ADD COLUMN IF NOT EXISTS store_status text NOT NULL DEFAULT 'open';

INSERT INTO public.platforms (name, slug, sort_order) VALUES
  ('PlayStation', 'playstation', 1),
  ('Xbox', 'xbox', 2),
  ('Steam', 'steam', 3),
  ('EA App', 'ea-app', 4),
  ('Epic Games', 'epic-games', 5),
  ('Nintendo', 'nintendo', 6);