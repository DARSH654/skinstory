import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = 'https://femriciugoqpzmhiqbvo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXJpY2l1Z29xcHptaGlxYnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwODgxNTEsImV4cCI6MjEwNjY2NDE1MX0.CreHlaLcMf9HawsDlcND_q_r8G_UEmdHSvQaIXJSsfw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
