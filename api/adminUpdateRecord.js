import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username, password, table, recordData } = req.body;

  if (username !== 'admin' || password !== 'admin1234') {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    const { id, ...updates } = recordData;

    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    return res.status(200).json({ success: true, record: data[0] });
  } catch (error) {
    console.error(`Failed to update ${table}:`, error);
    return res.status(500).json({ error: error.message });
  }
}
