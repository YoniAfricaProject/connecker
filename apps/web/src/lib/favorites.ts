import { getSupabase } from './supabase';

export async function getUserFavorites(userId: string): Promise<string[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('favorites')
    .select('property_id')
    .eq('user_id', userId);
  return (data || []).map((f: any) => f.property_id);
}

export async function toggleFavorite(userId: string, propertyId: string, isFavorite: boolean) {
  const supabase = getSupabase();
  if (isFavorite) {
    await supabase.from('favorites').delete().eq('user_id', userId).eq('property_id', propertyId);
  } else {
    await supabase.from('favorites').insert({ user_id: userId, property_id: propertyId });
  }
}
