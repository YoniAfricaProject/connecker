-- Execute this in Supabase SQL Editor
-- RPC functions for counters

CREATE OR REPLACE FUNCTION increment_views(property_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.properties SET views_count = views_count + 1 WHERE id = property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_leads(prop_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.properties SET leads_count = leads_count + 1 WHERE id = prop_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
