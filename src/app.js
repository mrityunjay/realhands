require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const webhookRouter = require('./routes/webhook');
const dashboardRouter = require('./routes/dashboard');
const { startScheduler } = require('./services/scheduler');
const { getDb } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ── Customer landing page (public homepage at /) ──────────────────────────────
// The WhatsApp "click to chat" number is injected from env (WA_NUMBER) at serve time.
app.get('/', (req, res) => {
  const waNumber = process.env.WA_NUMBER || '910000000000';
  fs.readFile(path.join(__dirname, 'public', 'index.html'), 'utf8', (err, html) => {
    if (err) return res.status(500).send('Landing page unavailable');
    res.send(html.replace(/__WA_NUMBER__/g, waNumber));
  });
});
app.use(express.static(path.join(__dirname, 'public')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/', webhookRouter);
app.use('/api', dashboardRouter);

// ── Dashboard UI (admin) ──────────────────────────────────────────────────────
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'index.html'));
});

// ── Local chat simulator (dev only — never mounted in production) ──────────────
if (process.env.NODE_ENV !== 'production') {
  app.use('/sim', require('./routes/simulator'));
  app.get('/simulator', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard', 'simulator.html'));
  });
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'RealHands', time: new Date().toISOString() });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  // Initialize DB on startup
  getDb();
  startScheduler();
  console.log(`
╔══════════════════════════════════════════════╗
║          RealHands Server Started            ║
║  Port     : ${PORT}                               ║
║  Webhook  : POST /webhook                    ║
║  Dashboard: http://localhost:${PORT}/dashboard    ║
║  Health   : http://localhost:${PORT}/health       ║
╚══════════════════════════════════════════════╝
  `);
});

module.exports = app;
