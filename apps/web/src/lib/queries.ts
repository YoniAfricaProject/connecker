import { getSupabase } from './supabase';
import type { Property, SearchFilters } from '@connecker/shared-types';

function mapProperty(row: any): Property {
  return {
    ...row,
    images: row.property_images || [],
    announcer: row.users || undefined,
  };
}

export async function getFeaturedProperties(limit = 6): Promise<Property[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('properties')
    .select('*, property_images(*), users!announcer_id(*)')
    .eq('status', 'published')
    .order('views_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured properties:', error);
    return [];
  }
  return (data || []).map(mapProperty);
}

export async function searchProperties(filters: SearchFilters): Promise<{ properties: Property[]; total: number }> {
  const supabase = getSupabase();
  let query = supabase
    .from('properties')
    .select('*, property_images(*), users!announcer_id(*)', { count: 'exact' })
    .eq('status', 'published');

  if (filters.city) query = query.ilike('city', `%${filters.city}%`);
  if (filters.district) query = query.ilike('district', `%${filters.district}%`);
  if (filters.transaction_type) query = query.eq('transaction_type', filters.transaction_type);
  if (filters.property_type?.length) query = query.in('property_type', filters.property_type);
  if (filters.price_min) query = query.gte('price', filters.price_min);
  if (filters.price_max) query = query.lte('price', filters.price_max);
  if (filters.surface_min) query = query.gte('surface_area', filters.surface_min);
  if (filters.rooms_min) query = query.gte('rooms', filters.rooms_min);
  if (filters.bedrooms_min) query = query.gte('bedrooms', filters.bedrooms_min);

  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    price_asc: { column: 'price', ascending: true },
    price_desc: { column: 'price', ascending: false },
    date_desc: { column: 'created_at', ascending: false },
    surface_desc: { column: 'surface_area', ascending: false },
  };
  const sort = sortMap[filters.sort_by || 'date_desc'];
  query = query.order(sort.column, { ascending: sort.ascending });

  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error searching properties:', error);
    return { properties: [], total: 0 };
  }

  return {
    properties: (data || []).map(mapProperty),
    total: count || 0,
  };
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('properties')
    .select('*, property_images(*), users!announcer_id(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching property:', error);
    return null;
  }

  // Increment views
  try { await supabase.rpc('increment_views', { property_id: id }); } catch {}

  return mapProperty(data);
}

export async function createLead(data: {
  property_id: string;
  sender_name: string;
  sender_email: string;
  sender_phone?: string;
  message: string;
}) {
  const supabase = getSupabase();
  const { error } = await supabase.from('leads').insert(data);
  if (error) throw error;
  // Increment leads count
  try { await supabase.rpc('increment_leads', { prop_id: data.property_id }); } catch {}
}

export async function getPropertyStats() {
  const supabase = getSupabase();
  const { count: totalProperties } = await supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'published');
  const { data: cities } = await supabase.from('properties').select('city').eq('status', 'published');

  const uniqueCities = new Set(cities?.map((c: any) => c.city) || []);

  return {
    totalProperties: totalProperties || 0,
    totalCities: uniqueCities.size,
  };
}
