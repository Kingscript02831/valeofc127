
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ritmuavmqobhwtwyegot.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpdG11YXZtcW9iaHd0d3llZ290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5MzYwMTYsImV4cCI6MjA1NDUxMjAxNn0.eUDRNsBpcwPkvVFqQEjmg6dNCiy108fnzk77nEn9ATg";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
