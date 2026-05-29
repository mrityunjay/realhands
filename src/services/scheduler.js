const cron = require('node-cron');
const { getAllActiveWorkers } = require('../db/queries');
const { sendMessage } = require('./whatsapp');
const msg = require('../bot/messages');

function startScheduler() {
  // Daily ping at 7:00 AM IST (1:30 AM UTC)
  cron.schedule('30 1 * * *', async () => {
    console.log('[Scheduler] Sending daily availability pings...');
    const workers = getAllActiveWorkers();
    let sent = 0;
    for (const worker of workers) {
      try {
        await sendMessage(worker.phone, msg.dailyPing(worker.language || 'hi', worker.name));
        sent++;
        await new Promise(r => setTimeout(r, 500)); // avoid rate limits
      } catch (err) {
        console.error(`[Scheduler] Failed to ping ${worker.phone}:`, err.message);
      }
    }
    console.log(`[Scheduler] Daily ping sent to ${sent}/${workers.length} workers.`);
  }, { timezone: 'Asia/Kolkata' });

  console.log('[Scheduler] Daily ping scheduler started (7:00 AM IST)');
}

module.exports = { startScheduler };
