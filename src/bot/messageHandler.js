const { getSession, setSession, clearSession, updateData } = require('./sessions');
const { sendMessage } = require('../services/whatsapp');
const { getWorkerByPhone, setWorkerAvailability } = require('../db/queries');
const { handleWorkerFlow } = require('./flows/workerFlow');
const { handleEmployerFlow } = require('./flows/employerFlow');
const msg = require('./messages');

const WORKER_TRIGGERS = ['KAAM', 'KAM', 'WORK', 'REGISTER', 'JOB', 'काम', 'MAZDOOR'];
const EMPLOYER_TRIGGERS = ['HIRE', 'CHAHIYE', 'NEED', 'चाहिए', 'DHUNDH', 'MAZDOOR CHAHIYE'];
const HELP_TRIGGERS = ['HELP', 'MADAD', 'मदद', '?'];
const AVAILABLE_TRIGGER = 'AVAILABLE';
const NOTAVAILABLE_TRIGGER = 'NOTAVAILABLE';
const RESTART_TRIGGER = 'RESTART';

async function handleIncomingMessage(phone, messageData) {
  try {
    const { type, text, location } = messageData;
    const rawText = (text || '').trim();
    const upper = rawText.toUpperCase();

    // ── Global commands (work at any point) ──────────────────────────────────
    if (HELP_TRIGGERS.includes(upper)) {
      const session = getSession(phone);
      await sendMessage(phone, msg.helpText(session?.language || 'hi'));
      return;
    }

    if (upper === RESTART_TRIGGER) {
      clearSession(phone);
      await sendMessage(phone, msg.welcome());
      return;
    }

    // ── Handle availability shortcuts for registered workers ─────────────────
    if (upper === AVAILABLE_TRIGGER) {
      const worker = getWorkerByPhone(phone);
      if (worker) {
        setWorkerAvailability(phone, true);
        await sendMessage(phone, msg.availabilityConfirmed(worker.language || 'hi'));
        return;
      }
    }

    if (upper === NOTAVAILABLE_TRIGGER) {
      const worker = getWorkerByPhone(phone);
      if (worker) {
        setWorkerAvailability(phone, false);
        await sendMessage(phone, msg.unavailabilityConfirmed(worker.language || 'hi'));
        return;
      }
    }

    // ── Get or create session ────────────────────────────────────────────────
    let session = getSession(phone);

    // ── Handle location message type ─────────────────────────────────────────
    if (type === 'location' && location) {
      if (session?.step === 'worker_location') {
        updateData(phone, {
          latitude: location.latitude,
          longitude: location.longitude,
          city: location.name || 'Hyderabad',
        });
        setSession(phone, { step: 'worker_wage' });
        await sendMessage(phone, msg.askWage(session.language));
        return;
      }
      if (session?.step === 'employer_location') {
        updateData(phone, {
          jobLatitude: location.latitude,
          jobLongitude: location.longitude,
          jobAddress: location.name || location.address || 'Hyderabad',
        });
        await require('./flows/employerFlow').handleEmployerFlow(phone, '', { ...session, data: { ...(session.data || {}), jobLatitude: location.latitude, jobLongitude: location.longitude, jobAddress: location.name || 'Hyderabad' } });
        return;
      }
    }

    // ── No session → Welcome ─────────────────────────────────────────────────
    if (!session) {
      const existingWorker = getWorkerByPhone(phone);
      const isEmployerTrigger = EMPLOYER_TRIGGERS.some(t => upper.includes(t));
      const isWorkerTrigger = WORKER_TRIGGERS.some(t => upper === t || upper.startsWith(t + ' '));

      // Already-registered worker messaging (unless they want to hire)
      if (existingWorker && !isEmployerTrigger) {
        await sendMessage(phone, msg.alreadyRegistered(existingWorker.language || 'hi', existingWorker));
        setSession(phone, { type: 'worker', step: 'registered', language: existingWorker.language || 'hi', data: {} });
        return;
      }

      // Remember KAAM/HIRE intent so we skip the role question after language.
      const pendingType = isEmployerTrigger ? 'employer' : isWorkerTrigger ? 'worker' : null;
      await sendMessage(phone, msg.welcome());
      setSession(phone, { step: 'select_language', pendingType });
      return;
    }

    // ── Language selection ────────────────────────────────────────────────────
    if (session.step === 'select_language') {
      const lang = rawText === '2' ? 'en' : 'hi';

      // If they opened with KAAM/HIRE, go straight into that flow.
      if (session.pendingType === 'employer') {
        setSession(phone, { step: 'employer_skill', type: 'employer', language: lang, pendingType: null });
        await sendMessage(phone, msg.askSkillNeeded(lang));
        return;
      }
      if (session.pendingType === 'worker') {
        const existingWorker = getWorkerByPhone(phone);
        if (existingWorker) {
          await sendMessage(phone, msg.alreadyRegistered(lang, existingWorker));
          setSession(phone, { type: 'worker', step: 'registered', language: existingWorker.language || lang, data: {} });
          return;
        }
        setSession(phone, { step: 'worker_name', type: 'worker', language: lang, pendingType: null });
        await sendMessage(phone, msg.askName(lang));
        return;
      }

      setSession(phone, { step: 'select_role', language: lang });
      await sendMessage(phone, msg.askRole(lang));
      return;
    }

    // ── Role selection (accepts 1/2 and common words; guides on anything else) ──
    if (session.step === 'select_role') {
      const lang = session.language;
      const wantsHire = rawText === '2' || /chahiye|चाहिए|\bhire\b/i.test(rawText);
      const wantsWork = rawText === '1' || /\b(work|job|kaam|naukri|majdoor|mazdoor)\b/i.test(rawText) || /काम|मज़दूर|नौकरी/.test(rawText);

      if (wantsHire) {
        setSession(phone, { step: 'employer_skill', type: 'employer' });
        await sendMessage(phone, msg.askSkillNeeded(lang));
      } else if (wantsWork) {
        setSession(phone, { step: 'worker_name', type: 'worker' });
        await sendMessage(phone, msg.askName(lang));
      } else {
        await sendMessage(phone, msg.pickNumber(lang) + '\n\n' + msg.askRole(lang));
      }
      return;
    }

    // ── Trigger-based entry points (from any step) ───────────────────────────
    if (WORKER_TRIGGERS.some(t => upper === t || upper.startsWith(t + ' '))) {
      const lang = session.language || 'hi';
      const existingWorker = getWorkerByPhone(phone);
      if (existingWorker) {
        await sendMessage(phone, msg.alreadyRegistered(lang, existingWorker));
        setSession(phone, { type: 'worker', step: 'registered', language: existingWorker.language || lang, data: {} });
        return;
      }
      setSession(phone, { step: 'worker_name', type: 'worker', language: lang });
      await sendMessage(phone, msg.askName(lang));
      return;
    }

    if (EMPLOYER_TRIGGERS.some(t => upper.includes(t))) {
      const lang = session.language || 'hi';
      setSession(phone, { step: 'employer_skill', type: 'employer', language: lang });
      await sendMessage(phone, msg.askSkillNeeded(lang));
      return;
    }

    // ── Route to correct flow ─────────────────────────────────────────────────
    session = getSession(phone);

    if (session.type === 'worker' || session.step?.startsWith('worker_')) {
      await handleWorkerFlow(phone, rawText, session);
      return;
    }

    if (session.type === 'employer' || session.step?.startsWith('employer_')) {
      await handleEmployerFlow(phone, rawText, session);
      return;
    }

    // ── Fallback ──────────────────────────────────────────────────────────────
    await sendMessage(phone, msg.welcome());
    clearSession(phone);

  } catch (err) {
    console.error(`[MessageHandler] Error for ${phone}:`, err.message);
    await sendMessage(phone, `Kuch problem aayi. Please "RESTART" likhein. 🙏`).catch(() => {});
  }
}

module.exports = { handleIncomingMessage };
