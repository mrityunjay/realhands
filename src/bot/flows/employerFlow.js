const { getSession, setSession, updateData } = require('../sessions');
const { SKILLS, WORKER_COUNT, getSkillByCode } = require('../constants');
const msg = require('../messages');
const { sendMessage } = require('../../services/whatsapp');
const {
  upsertEmployer, createJob, createJobRequest,
  findNearbyWorkers, findWorkersByCity, getWorkerByPhone,
} = require('../../db/queries');

async function handleEmployerFlow(phone, text, session) {
  const lang = session.language;
  const step = session.step;

  // ── Step: skill needed ────────────────────────────────────────────────────
  if (step === 'employer_skill') {
    const skill = SKILLS[text.trim()];
    if (!skill) {
      await sendMessage(phone, msg.askSkillNeeded(lang));
      return;
    }
    updateData(phone, { skillNeeded: skill.code, skillLabel: lang === 'en' ? skill.en : skill.hi });
    setSession(phone, { step: 'employer_count' });
    await sendMessage(phone, msg.askWorkerCount(lang));
    return;
  }

  // ── Step: worker count ────────────────────────────────────────────────────
  if (step === 'employer_count') {
    const count = WORKER_COUNT[text.trim()];
    if (!count) {
      await sendMessage(phone, msg.askWorkerCount(lang));
      return;
    }
    updateData(phone, { workersNeeded: count });
    setSession(phone, { step: 'employer_date' });
    await sendMessage(phone, msg.askStartDate(lang));
    return;
  }

  // ── Step: start date ──────────────────────────────────────────────────────
  if (step === 'employer_date') {
    let startDate;
    const choice = text.trim();
    if (choice === '1') startDate = 'Aaj / Today';
    else if (choice === '2') startDate = 'Kal / Tomorrow';
    else if (choice === '3') startDate = 'Is hafte / This week';
    else startDate = choice;
    updateData(phone, { startDate });
    setSession(phone, { step: 'employer_location' });
    await sendMessage(phone, msg.askJobLocation(lang));
    return;
  }

  // ── Step: job location ────────────────────────────────────────────────────
  if (step === 'employer_location') {
    // Text area name — location share handled in messageHandler
    const address = text.trim();
    updateData(phone, { jobAddress: `${address}, Hyderabad`, jobLatitude: null, jobLongitude: null });
    await performSearch(phone, session, lang);
    return;
  }

  // ── Step: select worker ───────────────────────────────────────────────────
  if (step === 'employer_select') {
    await handleWorkerSelection(phone, text.trim(), session, lang);
    return;
  }
}

async function performSearch(phone, session, lang) {
  const d = session.data;
  await sendMessage(phone, msg.searchingWorkers(lang));

  let workers = [];

  if (d.jobLatitude && d.jobLongitude) {
    workers = findNearbyWorkers(d.skillNeeded, d.jobLatitude, d.jobLongitude, 15, 5);
  }

  if (workers.length === 0) {
    workers = findWorkersByCity(d.skillNeeded, 'Hyderabad', 5);
  }

  if (workers.length === 0) {
    const skillObj = getSkillByCode(d.skillNeeded);
    const skillLabel = skillObj ? (lang === 'en' ? skillObj.en : skillObj.hi) : d.skillNeeded;
    await sendMessage(phone, msg.noWorkersFound(lang, skillLabel));

    // Save as pending job anyway
    upsertEmployer(phone, null);
    createJob({
      employer_phone: phone,
      skill_needed: d.skillNeeded,
      workers_needed: d.workersNeeded,
      start_date: d.startDate,
      latitude: d.jobLatitude || null,
      longitude: d.jobLongitude || null,
      address: d.jobAddress || 'Hyderabad',
    });
    setSession(phone, { step: 'employer_done' });
    return;
  }

  // Save workers list in session for selection
  updateData(phone, { searchResults: workers });
  setSession(phone, { step: 'employer_select' });

  const skillObj = getSkillByCode(d.skillNeeded);
  const skillLabel = skillObj ? (lang === 'en' ? skillObj.en : skillObj.hi) : d.skillNeeded;
  await sendMessage(phone, msg.showWorkerResults(lang, workers, skillLabel));
}

async function handleWorkerSelection(phone, choice, session, lang) {
  const workers = session.data.searchResults || [];
  const index = parseInt(choice) - 1;

  if (isNaN(index) || index < 0 || index >= workers.length) {
    await sendMessage(phone, msg.invalidOption(lang));
    return;
  }

  const selectedWorker = workers[index];
  const d = session.data;

  upsertEmployer(phone, null);
  const jobId = createJob({
    employer_phone: phone,
    skill_needed: d.skillNeeded,
    workers_needed: d.workersNeeded,
    start_date: d.startDate,
    latitude: d.jobLatitude || null,
    longitude: d.jobLongitude || null,
    address: d.jobAddress || 'Hyderabad',
  });

  createJobRequest(jobId, selectedWorker.phone, phone);

  setSession(phone, { step: 'employer_done' });
  await sendMessage(phone, msg.workerRequestSent(lang, selectedWorker.name));

  // Notify the worker
  const workerSession = require('../sessions').getSession(selectedWorker.phone);
  const workerLang = selectedWorker.language || 'hi';
  const skillObj = getSkillByCode(d.skillNeeded);
  const skillLabel = skillObj ? (workerLang === 'en' ? skillObj.en : skillObj.hi) : d.skillNeeded;

  await sendMessage(selectedWorker.phone, msg.jobOfferToWorker(workerLang, {
    skill_needed: d.skillNeeded,
    start_date: d.startDate,
    address: d.jobAddress || 'Hyderabad',
    job_id: jobId,
  }, skillLabel));

  // Ensure worker session is in registered state to handle response
  if (!workerSession || workerSession.step !== 'registered') {
    require('../sessions').setSession(selectedWorker.phone, {
      type: 'worker',
      step: 'registered',
      language: workerLang,
      data: { ...((workerSession && workerSession.data) || {}) },
    });
  }
}

module.exports = { handleEmployerFlow };
