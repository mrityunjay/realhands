// Local WhatsApp chat simulator — drives the real bot logic without Meta.
// Mounted only outside production (see app.js).
const express = require('express');
const router = express.Router();

const { handleIncomingMessage } = require('../bot/messageHandler');
const { drainOutbox } = require('../services/whatsapp');
const { clearSession } = require('../bot/sessions');
const { deleteWorkerByPhone } = require('../db/queries');

// POST /sim/message  { phone, text }  OR  { phone, location: {latitude, longitude, name} }
router.post('/message', async (req, res) => {
  try {
    const { phone, text, location } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'phone is required' });

    const messageData = location
      ? { type: 'location', location }
      : { type: 'text', text: text || '' };

    await handleIncomingMessage(String(phone), messageData);

    const replies = drainOutbox(String(phone)).map(m => m.text);
    res.json({ replies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /sim/reset  { phone, wipe }  — clear the chat session; wipe also deletes the worker row.
router.post('/reset', (req, res) => {
  const { phone, wipe } = req.body || {};
  if (!phone) return res.status(400).json({ error: 'phone is required' });
  clearSession(String(phone));
  if (wipe) deleteWorkerByPhone(String(phone));
  res.json({ ok: true });
});

module.exports = router;
