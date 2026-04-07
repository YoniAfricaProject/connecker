-- ============================================
-- Connec'Kër - Schema Setup for Supabase
-- Execute this in Supabase SQL Editor
-- ============================================

-- --- Enums ---

CREATE TYPE property_type AS ENUM ('apartment', 'house', 'villa', 'studio', 'land', 'office', 'commercial');
CREATE TYPE transaction_type AS ENUM ('sale', 'rent');
CREATE TYPE property_status AS ENUM ('draft', 'pending', 'published', 'expired', 'rejected');
CREATE TYPE user_role AS ENUM ('visitor', 'user', 'announcer', 'admin');
CREATE TYPE lead_status AS ENUM ('new', 'read', 'contacted', 'closed');

-- --- Users ---

CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --- Properties ---

CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  property_type property_type NOT NULL,
  transaction_type transaction_type NOT NULL,
  status property_status DEFAULT 'pending',
  price NUMERIC(15, 2) NOT NULL CHECK (price > 0),
  currency TEXT DEFAULT 'XOF',
  surface_area NUMERIC(10, 2),
  rooms INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  floor INTEGER,
  total_floors INTEGER,
  year_built INTEGER,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  country TEXT DEFAULT 'SN',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  features TEXT[] DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  leads_count INTEGER DEFAULT 0,
  announcer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --- Property Images ---

CREATE TABLE public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --- Leads ---

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_phone TEXT,
  message TEXT NOT NULL,
  status lead_status DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --- Favorites ---

CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- --- Indexes ---

CREATE INDEX idx_properties_city ON public.properties(city);
CREATE INDEX idx_properties_type ON public.properties(property_type);
CREATE INDEX idx_properties_transaction ON public.properties(transaction_type);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_price ON public.properties(price);
CREATE INDEX idx_properties_announcer ON public.properties(announcer_id);
CREATE INDEX idx_leads_property ON public.leads(property_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_favorites_user ON public.favorites(user_id);

-- --- Updated_at trigger ---

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- --- Auto-create user profile on auth signup ---

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --- RLS Policies ---

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "Users viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = auth_id);

-- Properties: published visible to all, owners see their own
CREATE POLICY "Published properties viewable" ON public.properties FOR SELECT USING (
  status = 'published' OR announcer_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);
CREATE POLICY "Announcers insert properties" ON public.properties FOR INSERT WITH CHECK (
  announcer_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);
CREATE POLICY "Announcers update own properties" ON public.properties FOR UPDATE USING (
  announcer_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);
CREATE POLICY "Announcers delete own properties" ON public.properties FOR DELETE USING (
  announcer_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);

-- Property images: public read, owners manage
CREATE POLICY "Property images viewable" ON public.property_images FOR SELECT USING (true);
CREATE POLICY "Owners manage images" ON public.property_images FOR INSERT WITH CHECK (
  property_id IN (SELECT id FROM public.properties WHERE announcer_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()))
);
CREATE POLICY "Owners update images" ON public.property_images FOR UPDATE USING (
  property_id IN (SELECT id FROM public.properties WHERE announcer_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()))
);
CREATE POLICY "Owners delete images" ON public.property_images FOR DELETE USING (
  property_id IN (SELECT id FROM public.properties WHERE announcer_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()))
);

-- Leads: anyone can create, announcers see their own
CREATE POLICY "Anyone creates leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Announcers see own leads" ON public.leads FOR SELECT USING (
  property_id IN (SELECT id FROM public.properties WHERE announcer_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()))
);
CREATE POLICY "Announcers update own leads" ON public.leads FOR UPDATE USING (
  property_id IN (SELECT id FROM public.properties WHERE announcer_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()))
);

-- Favorites: own only
CREATE POLICY "Users see own favorites" ON public.favorites FOR SELECT USING (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);
CREATE POLICY "Users add favorites" ON public.favorites FOR INSERT WITH CHECK (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);
CREATE POLICY "Users remove favorites" ON public.favorites FOR DELETE USING (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);

-- --- Storage buckets ---

INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Anyone can view property images" ON storage.objects FOR SELECT USING (bucket_id = 'property-images');
CREATE POLICY "Auth users upload property images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth users upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
