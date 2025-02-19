
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = 'https://cxnktrfpqjjkdfmiyhdz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bmt0cmZwcWpqa2RmbWl5aGR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg5ODM1NzksImV4cCI6MjAyNDU1OTU3OX0.BjlFnYr1Y3xtGQvBc9LI-QfJfv8pPmQSFM7LUrgbgx8';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
