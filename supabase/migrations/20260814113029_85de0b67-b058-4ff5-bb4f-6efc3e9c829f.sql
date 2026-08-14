-- BANNERS
CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_path text,
  mobile_image_path text,
  button_text text NOT NULL DEFAULT '',
  button_url text NOT NULL DEFAULT '',
  start_date timestamptz,
  end_date timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "banners public read" ON public.banners FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "banners admin write" ON public.banners FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER banners_updated_at BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PROMOTIONS
CREATE TABLE public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_path text,
  button_text text NOT NULL DEFAULT '',
  button_url text NOT NULL DEFAULT '',
  is_enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.promotions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promotions TO authenticated;
GRANT ALL ON public.promotions TO service_role;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promotions public read" ON public.promotions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "promotions admin write" ON public.promotions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER promotions_updated_at BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- FAQS
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL DEFAULT '',
  answer text NOT NULL DEFAULT '',
  is_enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faqs public read" ON public.faqs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "faqs admin write" ON public.faqs FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER faqs_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- NAV ITEMS
CREATE TABLE public.nav_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '/',
  is_visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.nav_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nav_items TO authenticated;
GRANT ALL ON public.nav_items TO service_role;
ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nav public read" ON public.nav_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "nav admin write" ON public.nav_items FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER nav_items_updated_at BEFORE UPDATE ON public.nav_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SOCIAL LINKS
CREATE TABLE public.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'link',
  is_enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.social_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_links TO authenticated;
GRANT ALL ON public.social_links TO service_role;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "social public read" ON public.social_links FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "social admin write" ON public.social_links FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER social_links_updated_at BEFORE UPDATE ON public.social_links FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PAYMENT METHODS
CREATE TABLE public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  account_number text NOT NULL DEFAULT '',
  account_name text NOT NULL DEFAULT '',
  instructions text NOT NULL DEFAULT '',
  logo_path text,
  is_enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payment_methods TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_methods TO authenticated;
GRANT ALL ON public.payment_methods TO service_role;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payment methods public read" ON public.payment_methods FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "payment methods admin write" ON public.payment_methods FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER payment_methods_updated_at BEFORE UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.payment_methods (name, account_number, account_name, instructions, is_enabled, sort_order)
VALUES ('Vodafone Cash', '01068012140', 'Tag Store', 'Send the exact order amount to this number, then upload the payment screenshot below.', true, 0);

-- SITE CONTENT (flexible key/value CMS blocks)
CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site content public read" ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "site content admin write" ON public.site_content FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER site_content_updated_at BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_content (key, value) VALUES
('homepage', '{
  "hero": {
    "enabled": true,
    "eyebrow": "PlayStation Digital Store",
    "title": "Level up with Tag Store",
    "subtitle": "",
    "description": "Digital PlayStation games at honest prices. Choose your account type, pay with Vodafone Cash, and start playing.",
    "button_text": "Shop Now",
    "button_url": "/shop",
    "secondary_button_text": "Contact Us",
    "secondary_button_url": "/contact",
    "background_image": null
  },
  "sections": [
    {"id": "banners", "label": "Banners", "enabled": true, "title": "", "subtitle": ""},
    {"id": "categories", "label": "Categories", "enabled": true, "title": "Categories", "subtitle": "Browse the store by category."},
    {"id": "featured", "label": "Featured Products", "enabled": true, "title": "Featured Products", "subtitle": "Hand-picked titles from our catalog."},
    {"id": "latest", "label": "Latest Products", "enabled": true, "title": "Latest Products", "subtitle": "The newest additions to Tag Store."},
    {"id": "bestsellers", "label": "Best Sellers", "enabled": false, "title": "Best Sellers", "subtitle": "The titles gamers buy the most."},
    {"id": "promotions", "label": "Promotional Sections", "enabled": true, "title": "", "subtitle": ""},
    {"id": "why", "label": "Why Choose Us", "enabled": true, "title": "Why Choose Tag Store", "subtitle": "Built for gamers, not for bots."},
    {"id": "faq", "label": "FAQ", "enabled": true, "title": "Frequently Asked Questions", "subtitle": "Quick answers before you buy."},
    {"id": "cta", "label": "Help CTA", "enabled": true, "title": "Need help choosing a game?", "subtitle": "Message us and we will help you pick the right account type for your console."}
  ],
  "why_items": [
    {"icon": "Zap", "title": "Fast Delivery", "text": "Orders are reviewed and delivered as quickly as possible after payment confirmation."},
    {"icon": "ShieldCheck", "title": "Safe & Trusted", "text": "Every order is tracked with a unique order ID and verified payment proof."},
    {"icon": "Wallet", "title": "Easy Payment", "text": "Simple local payment — send the amount and upload your payment screenshot."},
    {"icon": "Headphones", "title": "Real Support", "text": "Talk to a real person on WhatsApp or phone whenever you need help."}
  ]
}'::jsonb),
('announcement', '{"enabled": false, "text": "Free delivery on selected orders", "link": "", "button_text": "", "position": "top"}'::jsonb),
('footer', '{
  "description": "Tag Store — Premium PlayStation digital games.",
  "copyright": "",
  "show_contact": true,
  "columns": [
    {"title": "Store", "links": [{"label": "Shop", "url": "/shop"}, {"label": "About Us", "url": "/about"}, {"label": "FAQ", "url": "/faq"}, {"label": "Contact Us", "url": "/contact"}]},
    {"title": "Legal", "links": [{"label": "Privacy Policy", "url": "/privacy"}, {"label": "Terms & Conditions", "url": "/terms"}]}
  ]
}'::jsonb),
('checkout', '{
  "title": "Checkout",
  "eyebrow": "Secure order",
  "description": "Choose a payment method, send the total, then upload your payment screenshot.",
  "payment_instructions": "",
  "screenshot_required": true,
  "phone_enabled": true,
  "phone_required": true,
  "email_enabled": true,
  "email_required": true,
  "notes_enabled": true,
  "notes_required": false
}'::jsonb),
('website', '{
  "title": "Tag Store — PlayStation Digital Games in Egypt",
  "description": "Buy PlayStation digital games from Tag Store. Primary, secondary and full-access accounts with fast delivery.",
  "seo_title": "",
  "seo_description": "",
  "maintenance_mode": false,
  "maintenance_message": "We are performing maintenance. Please check back soon."
}'::jsonb);

-- CATEGORIES / PRODUCTS / ORDERS / SETTINGS additions
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_best_seller boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS featured_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS best_seller_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_account text NOT NULL DEFAULT '';
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS favicon_url text;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS logo_path text;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS favicon_path text;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS store_description text NOT NULL DEFAULT '';
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS address text NOT NULL DEFAULT '';
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS working_hours text NOT NULL DEFAULT '';
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS support_email text NOT NULL DEFAULT 'tagstore.support@gmail.com';
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS og_image_path text;

-- Seed navigation, socials and FAQs from the current site content
INSERT INTO public.nav_items (label, url, is_visible, sort_order) VALUES
('Home', '/', true, 0),
('Shop', '/shop', true, 1),
('About', '/about', true, 2),
('FAQ', '/faq', true, 3),
('Contact', '/contact', true, 4);

INSERT INTO public.faqs (question, answer, is_enabled, sort_order) VALUES
('How do I place an order?', 'Pick a game, choose the account type you need, add it to your cart, then complete checkout with your details and payment screenshot.', true, 0),
('How do I pay?', 'Send the total amount to the payment account shown at checkout, then upload a screenshot of the transfer as proof of payment.', true, 1),
('What is the difference between Primary, Secondary and Full Access?', 'Primary lets you play offline on your own console at any time. Secondary usually requires being online. Full Access gives you the full account credentials. The exact terms of each option are listed on the product page.', true, 2),
('How long does delivery take?', 'Orders are processed manually after we confirm your payment. Most orders are delivered within a short time during working hours.', true, 3),
('How will I receive my game?', 'We contact you on the phone number or email you provide at checkout with the account details or activation instructions.', true, 4),
('Can I cancel or refund an order?', 'Digital products cannot be refunded once delivered. If there is a problem with your order, contact support and we will resolve it.', true, 5),
('Is my payment screenshot safe?', 'Yes. Payment screenshots are stored privately and can only be opened by the store administrator.', true, 6);