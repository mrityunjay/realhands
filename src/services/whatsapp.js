const axios = require('axios');

const BASE_URL = 'https://graph.facebook.com/v18.0';

// ── Local outbox ────────────────────────────────────────────────────────────
// Captures every outgoing message in memory (last 50 per phone) so the local
// chat simulator can display the bot's replies without WhatsApp being wired up.
const outbox = new Map();

function recordOutgoing(to, text) {
  const arr = outbox.get(to) || [];
  arr.push({ text, at: Date.now() });
  if (arr.length > 50) arr.shift();
  outbox.set(to, arr);
}

function drainOutbox(to) {
  const arr = outbox.get(to) || [];
  outbox.set(to, []);
  return arr;
}

function credsConfigured() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  return token && token !== 'your_access_token_here';
}

async function sendMessage(to, text) {
  recordOutgoing(to, text);

  // No real WhatsApp credentials (local/dev) → capture only, skip the API call.
  if (!credsConfigured()) return;

  try {
    await axios.post(
      `${BASE_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text, preview_url: false },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    console.error(`[WhatsApp] Failed to send to ${to}: ${msg}`);
  }
}

async function sendMessages(to, texts) {
  for (const text of texts) {
    await sendMessage(to, text);
    await new Promise(r => setTimeout(r, 300));
  }
}

module.exports = { sendMessage, sendMessages, drainOutbox };
