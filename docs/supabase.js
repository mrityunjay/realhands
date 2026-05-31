// ── RealHands database config ────────────────────────────────────────────────
// To turn ON the database: create a free project at https://supabase.com,
// then paste your Project URL and the "anon public" key below (Settings → API).
// Until then, forms still work — they send the details to WhatsApp.

const SUPABASE_URL = 'https://byqihicwqxqnkugrkexv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kcPMHpOQWUp5aRpQHYW4TQ_N-XK4krG';  // publishable (public) key — safe in frontend

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
