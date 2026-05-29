const express = require('express');
const router = express.Router();
const { handleIncomingMessage } = require('../bot/messageHandler');

// ── Webhook verification (Meta requires this on setup) ────────────────────────
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('[Webhook] Verification successful');
    return res.status(200).send(challenge);
  }
  console.warn('[Webhook] Verification failed');
  return res.sendStatus(403);
});

// ── Receive messages ──────────────────────────────────────────────────────────
router.post('/webhook', async (req, res) => {
  // Acknowledge immediately — WhatsApp expects 200 within 5 seconds
  res.sendStatus(200);

  try {
    const body = req.body;
    if (body.object !== 'whatsapp_business_account') return;

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;
        if (!value.messages) continue;

        for (const message of value.messages) {
          const phone = message.from;
          const messageData = parseMessage(message);
          console.log(`[Webhook] Message from ${phone}: type=${messageData.type} text="${messageData.text}"`);
          await handleIncomingMessage(phone, messageData);
        }
      }
    }
  } catch (err) {
    console.error('[Webhook] Processing error:', err.message);
  }
});

function parseMessage(message) {
  const type = message.type;

  if (type === 'text') {
    return { type: 'text', text: message.text?.body || '' };
  }

  if (type === 'location') {
    return {
      type: 'location',
      text: '',
      location: {
        latitude: message.location?.latitude,
        longitude: message.location?.longitude,
        name: message.location?.name,
        address: message.location?.address,
      },
    };
  }

  if (type === 'interactive') {
    // Button or list reply
    const reply = message.interactive?.button_reply || message.interactive?.list_reply;
    return { type: 'text', text: reply?.id || reply?.title || '' };
  }

  // Ignore audio/image/etc — send help
  return { type: 'unsupported', text: '' };
}

module.exports = router;
