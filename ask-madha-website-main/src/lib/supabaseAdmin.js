import { createClient } from '@supabase/supabase-js';

let _client = null;

/**
 * Lazy Supabase admin client using the service role key.
 * Created on first use so the module can be imported at build time
 * without env vars being set.
 */
function getClient() {
  if (_client) return _client;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in your .env file.'
    );
  }

  _client = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _client;
}

/**
 * Proxy that lazily creates the Supabase admin client on first property access.
 * This allows the module to be imported at build time without env vars set.
 */
export const supabaseAdmin = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getClient();
      const value = client[prop];
      return typeof value === 'function' ? value.bind(client) : value;
    },
  }
);
