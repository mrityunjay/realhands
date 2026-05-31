// ── RealHands database config ────────────────────────────────────────────────
// To turn ON the database: create a free project at https://supabase.com,
// then paste your Project URL and the "anon public" key below (Settings → API).
// Until then, forms still work — they send the details to WhatsApp.

const SUPABASE_URL = 'YOUR_SUPABASE_URL';            // e.g. https://abcd1234.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';  // long "anon public" key

const SUPABASE_CONFIGURED =
  !SUPABASE_URL.startsWith('YOUR_') && !SUPABASE_ANON_KEY.startsWith('YOUR_');

let _client = null;
function sbClient() {
  if (!SUPABASE_CONFIGURED) return null;
  if (!_client && window.supabase) {
    _client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _client;
}

// Insert a row. Returns { saved: true } or { saved: false, reason }.
async function saveToDatabase(table, row) {
  const c = sbClient();
  if (!c) return { saved: false, reason: 'not_configured' };
  try {
    const { error } = await c.from(table).insert(row);
    return error ? { saved: false, reason: error.message } : { saved: true };
  } catch (e) {
    return { saved: false, reason: e.message };
  }
}
