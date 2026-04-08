import { getSupabase } from './supabase';

export async function logAction(adminName: string, action: string, targetType?: string, targetId?: string, details?: string) {
  const supabase = getSupabase();
  await supabase.from('admin_logs').insert({
    admin_name: adminName,
    action,
    target_type: targetType || null,
    target_id: targetId || null,
    details: details || null,
  });
}
