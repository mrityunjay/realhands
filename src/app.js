require('dotenv').config();
const express = require('express');
const path = require('path');

const webhookRouter = require('./routes/webhook');
const dashboardRouter = require('./routes/dashboard');
const { startScheduler } = require('./services/scheduler');
const { getDb } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dashboard')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/', webhookRouter);
app.use('/api', dashboardRouter);

// ── Dashboard UI ──────────────────────────────────────────────────────────────
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'index.html'));
});

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
