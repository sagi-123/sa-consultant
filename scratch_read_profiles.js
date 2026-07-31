import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hqonpbkoutnkffjtshxw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxb25wYmtvdXRua2ZmanRzaHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDE4NTUsImV4cCI6MjA5MDI3Nzg1NX0.jN5AYaZRse3SEA51XTh1TL-d0hDb48jLXIkxH3iQN-k';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data, error } = await supabase.from('profiles').select('*');
  console.log('Profiles:', data);
  if (error) console.error('Error:', error);
}

main();
