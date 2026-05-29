const express = require('express');
const router = express.Router();
const { getWorkerStats, getRecentJobs, getAllActiveWorkers } = require('../db/queries');

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'realhands123';

function auth(req, res, next) {
  const key = req.query.key || req.headers['x-dashboard-key'];
  if (key === DASHBOARD_PASSWORD) return next();
  res.status(401).json({ error: 'Unauthorized. Add ?key=YOUR_PASSWORD to the URL.' });
}

router.get('/stats', auth, (req, res) => {
  const stats = getWorkerStats();
  const jobs = getRecentJobs(10);
  res.json({ stats, recentJobs: jobs, timestamp: new Date().toISOString() });
});

router.get('/workers', auth, (req, res) => {
  const workers = getAllActiveWorkers();
  res.json({ workers, count: workers.length });
});

module.exports = router;
