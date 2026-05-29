const axios = require('axios');

const BASE_URL = 'https://graph.facebook.com/v18.0';

async function sendMessage(to, text) {
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

module.exports = { sendMessage, sendMessages };
