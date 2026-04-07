-- ============================================
-- Connec'Kër - Database Schema
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- --- Enums ---

CREATE TYPE property_type AS ENUM ('apartment', 'house', 'villa', 'studio', 'land', 'office', 'commercial');
CREATE TYPE transaction_type AS ENUM ('sale', 'rent');
CREATE TYPE property_status AS ENUM ('draft', 'pending', 'published', 'expired', 'rejected');
CREATE TYPE user_role AS ENUM ('visitor', 'user', 'announcer', 'admin');
CREATE TYPE lead_status AS ENUM ('new', 'read', 'contacted', 'closed');

-- --- Users ---

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  location GEOGRAPHY(POINT, 4326),
  features TEXT[] DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  leads_count INTEGER DEFAULT 0,
  announcer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --- Property Images ---

CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --- Leads ---

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_phone TEXT,
  message TEXT NOT NULL,
  status lead_status DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --- Favorites ---

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- --- Indexes ---

CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_transaction ON properties(transaction_type);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_announcer ON properties(announcer_id);
CREATE INDEX idx_properties_location ON properties USING GIST(location);
CREATE INDEX idx_leads_property ON leads(property_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_favorites_user ON favorites(user_id);

-- --- RLS Policies ---

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users: anyone can read, only own profile editable
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = auth_id);

-- Properties: published visible to all, own properties manageable
CREATE POLICY "Published properties are viewable" ON properties FOR SELECT USING (status = 'published' OR announcer_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Announcers can insert properties" ON properties FOR INSERT WITH CHECK (announcer_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Announcers can update own properties" ON properties FOR UPDATE USING (announcer_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Announcers can delete own properties" ON properties FOR DELETE USING (announcer_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Property images: follow property access
CREATE POLICY "Property images follow property access" ON property_images FOR SELECT USING (true);
CREATE POLICY "Announcers manage own property images" ON property_images FOR ALL USING (
  property_id IN (SELECT id FROM properties WHERE announcer_id = (SELECT id FROM users WHERE auth_id = auth.uid()))
);

-- Leads: announcer sees own, anyone can create
CREATE POLICY "Anyone can create leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Announcers see own leads" ON leads FOR SELECT USING (
  property_id IN (SELECT id FROM properties WHERE announcer_id = (SELECT id FROM users WHERE auth_id = auth.uid()))
);

-- Favorites: own only
CREATE POLICY "Users manage own favorites" ON favorites FOR ALL USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- --- Functions ---

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- --- Auto-create user profile on auth signup ---

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (auth_id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
