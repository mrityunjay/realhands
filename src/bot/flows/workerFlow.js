const { getSession, setSession, updateData } = require('../sessions');
const { SKILLS, EXPERIENCE, WAGES } = require('../constants');
const msg = require('../messages');
const { sendMessage } = require('../../services/whatsapp');
const { createWorker, getWorkerByPhone, setWorkerAvailability, getPendingRequestForWorker, updateJobRequestStatus } = require('../../db/queries');
const { sendMessage: wa } = require('../../services/whatsapp');

async function handleWorkerFlow(phone, text, session) {
  const lang = session.language;
  const step = session.step;
  const upper = text.trim().toUpperCase();

  // ── Step: language already set, ask name ──────────────────────────────────
  if (step === 'worker_name') {
    const name = text.trim();
    if (name.length < 2) {
      await sendMessage(phone, msg.nameHint(lang));
      return;
    }
    updateData(phone, { name });
    setSession(phone, { step: 'worker_skill' });
    await sendMessage(phone, msg.askSkill(lang));
    return;
  }

  // ── Step: skill selection ─────────────────────────────────────────────────
  if (step === 'worker_skill') {
    const skill = SKILLS[text.trim()];
    if (!skill) {
      await sendMessage(phone, msg.pickNumber(lang) + '\n\n' + msg.askSkill(lang));
      return;
    }
    updateData(phone, { skill: skill.code, skillLabel: lang === 'en' ? skill.en : skill.hi });
    setSession(phone, { step: 'worker_experience' });
    await sendMessage(phone, msg.askExperience(lang));
    return;
  }

  // ── Step: experience ──────────────────────────────────────────────────────
  if (step === 'worker_experience') {
    const exp = EXPERIENCE[text.trim()];
    if (!exp) {
      await sendMessage(phone, msg.pickNumber(lang) + '\n\n' + msg.askExperience(lang));
      return;
    }
    updateData(phone, { experience: exp.code, expLabel: lang === 'en' ? exp.en : exp.hi });
    setSession(phone, { step: 'worker_location' });
    await sendMessage(phone, msg.askLocation(lang));
    return;
  }

  // ── Step: location ────────────────────────────────────────────────────────
  if (step === 'worker_location') {
    // WhatsApp sends location as special message type — handled in messageHandler
    // If we're here, it's a text area name
    const area = text.trim();
    updateData(phone, { city: `${area}, Hyderabad`, latitude: null, longitude: null });
    setSession(phone, { step: 'worker_wage' });
    await sendMessage(phone, msg.askWage(lang));
    return;
  }

  // ── Step: wage ────────────────────────────────────────────────────────────
  if (step === 'worker_wage') {
    const wage = WAGES[text.trim()];
    if (!wage) {
      await sendMessage(phone, msg.pickNumber(lang) + '\n\n' + msg.askWage(lang));
      return;
    }
    updateData(phone, { wageMin: wage.min, wageMax: wage.max, wageLabel: lang === 'en' ? wage.en : wage.hi });
    setSession(phone, { step: 'worker_availability' });
    await sendMessage(phone, msg.askAvailability(lang));
    return;
  }

  // ── Step: availability ────────────────────────────────────────────────────
  if (step === 'worker_availability') {
    const choice = text.trim();
    if (!['1', '2', '3'].includes(choice)) {
      await sendMessage(phone, msg.pickNumber(lang) + '\n\n' + msg.askAvailability(lang));
      return;
    }
    const available = choice !== '3';
    const d = session.data;
    const workerId = createWorker({
      phone,
      name: d.name,
      skill: d.skill,
      experience: d.experience,
      city: d.city || 'Hyderabad',
      latitude: d.latitude || null,
      longitude: d.longitude || null,
      wage_min: d.wageMin,
      wage_max: d.wageMax,
      language: lang,
    });
    if (!available) setWorkerAvailability(phone, false);
    setSession(phone, { step: 'registered', type: 'worker' });
    await sendMessage(phone, msg.registrationComplete(lang, d.name, workerId, d.skillLabel, d.expLabel, d.wageLabel));
    return;
  }

  // ── Step: registered — handle ongoing interactions ────────────────────────
  if (step === 'registered') {
    if (upper === 'AVAILABLE') {
      setWorkerAvailability(phone, true);
      await sendMessage(phone, msg.availabilityConfirmed(lang));
      return;
    }
    if (upper === 'NOTAVAILABLE' || upper === 'NOT AVAILABLE') {
      setWorkerAvailability(phone, false);
      await sendMessage(phone, msg.unavailabilityConfirmed(lang));
      return;
    }
    // Handle job offer response (1/2/3)
    if (['1', '2', '3'].includes(text.trim())) {
      await handleJobOfferResponse(phone, text.trim(), lang);
      return;
    }
    // Handle rating response
    if (['1','2','3','4','5'].includes(text.trim()) && session.data.ratingPending) {
      await handleRatingResponse(phone, text.trim(), session, lang);
      return;
    }
    await sendMessage(phone, msg.helpText(lang));
    return;
  }
}

async function handleJobOfferResponse(phone, choice, lang) {
  const request = getPendingRequestForWorker(phone);
  if (!request) return;

  const { sendMessages } = require('../../services/whatsapp');
  const { getWorkerByPhone } = require('../../db/queries');
  const worker = getWorkerByPhone(phone);
  const { getSkillByCode } = require('../constants');
  const skillObj = getSkillByCode(request.skill_needed);
  const skillLabel = skillObj ? (lang === 'en' ? skillObj.en : skillObj.hi) : request.skill_needed;

  if (choice === '1') {
    updateJobRequestStatus(request.job_id, phone, 'accepted');
    const msgs = msg.workerAccepted(lang, worker, { phone: request.employer_phone, name: null });
    await sendMessage(phone, msgs.toWorker);
    await sendMessage(request.employer_phone, msgs.toEmployer);
    // Schedule rating after 24h (simplified: just remind after next ping)
    updateData(phone, { ratingPending: false });
  } else if (choice === '2') {
    updateJobRequestStatus(request.job_id, phone, 'rejected');
    await sendMessage(phone, msg.unavailabilityConfirmed(lang));
    await sendMessage(request.employer_phone, msg.workerDeclined('hi', worker?.name || 'Worker'));
  } else if (choice === '3') {
    // They want to talk — reveal number directly
    await sendMessage(phone, `📞 Employer ka number: ${request.employer_phone}\nSeedha call karein!`);
    await sendMessage(request.employer_phone, `📞 Worker ${worker?.name} ka number: ${phone}\nSeedha call karein!`);
  }
}

async function handleRatingResponse(phone, rating, session, lang) {
  const { saveRating } = require('../../db/queries');
  const { clearSession, setSession } = require('../sessions');
  const pending = session.data.ratingTarget;
  if (pending) {
    saveRating(pending.workerPhone, phone, parseInt(rating));
    updateData(phone, { ratingPending: false, ratingTarget: null });
    await sendMessage(phone, msg.ratingConfirmed(lang));
  }
}

module.exports = { handleWorkerFlow };
