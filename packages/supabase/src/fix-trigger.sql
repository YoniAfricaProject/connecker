-- Fix: More robust user creation trigger
-- Execute this in Supabase SQL Editor

-- Drop old trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(
      CASE
        WHEN NEW.raw_user_meta_data->>'role' IN ('user', 'announcer', 'admin')
        THEN (NEW.raw_user_meta_data->>'role')::user_role
        ELSE 'user'::user_role
      END,
      'user'::user_role
    )
  )
  ON CONFLICT (email) DO UPDATE SET
    auth_id = NEW.id,
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', public.users.full_name),
    phone = COALESCE(NEW.raw_user_meta_data->>'phone', public.users.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
