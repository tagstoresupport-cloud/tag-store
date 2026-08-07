
CREATE POLICY "product images public read" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product-images');
CREATE POLICY "product images admin insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "product images admin update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "product images admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "payment screenshots customer insert" ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'payment-screenshots');
CREATE POLICY "payment screenshots admin read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'payment-screenshots' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "payment screenshots admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'payment-screenshots' AND public.has_role(auth.uid(),'admin'));
