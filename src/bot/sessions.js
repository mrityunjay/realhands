// In-memory session store. Sufficient for MVP.
// Each session expires after 30 minutes of inactivity.

const sessions = new Map();
const SESSION_TTL_MS = 30 * 60 * 1000;

function getSession(phone) {
  const session = sessions.get(phone);
  if (!session) return null;
  if (Date.now() - session.updatedAt > SESSION_TTL_MS) {
    sessions.delete(phone);
    return null;
  }
  return session;
}

function setSession(phone, updates) {
  const existing = sessions.get(phone) || { phone, type: null, step: 'welcome', language: 'hi', data: {} };
  sessions.set(phone, { ...existing, ...updates, updatedAt: Date.now() });
}

function clearSession(phone) {
  sessions.delete(phone);
}

function updateData(phone, dataUpdates) {
  const session = getSession(phone) || { phone, type: null, step: 'welcome', language: 'hi', data: {}, updatedAt: Date.now() };
  session.data = { ...session.data, ...dataUpdates };
  session.updatedAt = Date.now();
  sessions.set(phone, session);
}

module.exports = { getSession, setSession, clearSession, updateData };
