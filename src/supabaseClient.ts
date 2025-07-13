import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase project values
const supabaseUrl =  'https://dlifuqsyevknjcvshajz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsaWZ1cXN5ZXZrbmpjdnNoYWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjQ2MDgsImV4cCI6MjA2ODAwMDYwOH0.htuBhsUiP9Z9uWzPXLrFKR52_lZg8FtCtgh4EGHPB7s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 