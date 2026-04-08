import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://xkylbaiguwgpncyvfsyy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhreWxiYWlndXdncG5jeXZmc3l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NTIyMTksImV4cCI6MjA5MTEyODIxOX0.yywKlNp-Pl9KklJJ82XkxV6vWn1xrqAVOKz6Av7Iq0o';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
