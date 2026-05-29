const { SKILLS, EXPERIENCE, WAGES } = require('./constants');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function t(lang, hi, en) {
  return lang === 'en' ? en : hi;
}

function skillListText(lang) {
  return Object.entries(SKILLS)
    .map(([k, v]) => `${k}️⃣ ${v.emoji} ${lang === 'en' ? v.en : v.hi}`)
    .join('\n');
}

function expListText(lang) {
  return Object.entries(EXPERIENCE)
    .map(([k, v]) => `${k}️⃣ ${lang === 'en' ? v.en : v.hi}`)
    .join('\n');
}

function wageListText(lang) {
  return Object.entries(WAGES)
    .map(([k, v]) => `${k}️⃣ ${lang === 'en' ? v.en : v.hi}`)
    .join('\n');
}

// ─── Welcome ──────────────────────────────────────────────────────────────────

function welcome() {
  return `🙏 *RealHands* mein aapka swagat hai!
Connecting workers & employers across Hyderabad.

Apni bhasha chuniye / Choose your language:

1️⃣ हिंदी
2️⃣ English`;
}

function askRole(lang) {
  return t(lang,
    `आप क्या करना चाहते हैं?\n\n1️⃣ 💼 काम ढूंढना है (मैं मज़दूर हूँ)\n2️⃣ 👷 मज़दूर ढूंढना है (मुझे काम कराना है)`,
    `What would you like to do?\n\n1️⃣ 💼 Looking for work (I am a worker)\n2️⃣ 👷 Looking to hire (I need workers)`
  );
}

// ─── Worker Flow ──────────────────────────────────────────────────────────────

function askName(lang) {
  return t(lang,
    `अच्छा! पहले आपका नाम बताइए:\n(सिर्फ पहला नाम काफी है)`,
    `Great! Please tell me your name:\n(First name is enough)`
  );
}

function askSkill(lang) {
  return t(lang,
    `आप कौन सा काम करते हैं?\n\n${skillListText('hi')}`,
    `What kind of work do you do?\n\n${skillListText('en')}`
  );
}

function askExperience(lang) {
  return t(lang,
    `आपको यह काम कितने सालों से आता है?\n\n${expListText('hi')}`,
    `How many years of experience do you have?\n\n${expListText('en')}`
  );
}

function askLocation(lang) {
  return t(lang,
    `आप अभी Hyderabad में कहाँ हैं?\n\n📍 *Location Share* करें (नीचे + बटन दबाएं)\n\nया अपना इलाका लिखें (जैसे: Kukatpally, Secunderabad, LB Nagar)`,
    `Where are you in Hyderabad right now?\n\n📍 *Share your Location* (tap + button below)\n\nOR type your area (e.g. Kukatpally, Secunderabad)`
  );
}

function askWage(lang) {
  return t(lang,
    `आप रोज़ कितना कमाना चाहते हैं?\n\n${wageListText('hi')}`,
    `How much do you want to earn per day?\n\n${wageListText('en')}`
  );
}

function askAvailability(lang) {
  return t(lang,
    `क्या आप अभी काम के लिए उपलब्ध हैं?\n\n1️⃣ ✅ हाँ, आज से\n2️⃣ 📅 कल से\n3️⃣ ❌ अभी नहीं`,
    `Are you available for work?\n\n1️⃣ ✅ Yes, starting today\n2️⃣ 📅 From tomorrow\n3️⃣ ❌ Not right now`
  );
}

function registrationComplete(lang, name, workerId, skillLabel, expLabel, wageLabel) {
  return t(lang,
    `✅ *${name} ji, aapka profile ban gaya!*\n\n` +
    `📋 Aapki jankari:\n` +
    `• काम: ${skillLabel}\n` +
    `• अनुभव: ${expLabel}\n` +
    `• मजदूरी: ${wageLabel}\n` +
    `• जगह: Hyderabad\n\n` +
    `🆔 Aapka ID: *${workerId}*\n\n` +
    `Jab koi aapko call karega, aapko yahan message aayega.\n\n` +
    `💡 *Tip:* Roz subah "AVAILABLE" likhein — isse aap upar dikhenge aur jaldi kaam milega! 🙌`,
    `✅ *${name}, your profile is ready!*\n\n` +
    `📋 Your details:\n` +
    `• Skill: ${skillLabel}\n` +
    `• Experience: ${expLabel}\n` +
    `• Wage: ${wageLabel}\n` +
    `• Location: Hyderabad\n\n` +
    `🆔 Your ID: *${workerId}*\n\n` +
    `You will get a message here when someone wants to hire you.\n\n` +
    `💡 *Tip:* Type "AVAILABLE" every morning to appear at the top! 🙌`
  );
}

// ─── Employer Flow ────────────────────────────────────────────────────────────

function askSkillNeeded(lang) {
  return t(lang,
    `आपको कौन सा काम करने वाला चाहिए?\n\n${skillListText('hi')}`,
    `What kind of worker do you need?\n\n${skillListText('en')}`
  );
}

function askWorkerCount(lang) {
  return t(lang,
    `कितने लोग चाहिए?\n\n1️⃣ 1 आदमी\n2️⃣ 2-5 लोग\n3️⃣ 5-10 लोग\n4️⃣ 10+ लोग`,
    `How many workers do you need?\n\n1️⃣ 1 person\n2️⃣ 2-5 people\n3️⃣ 5-10 people\n4️⃣ 10+ people`
  );
}

function askStartDate(lang) {
  return t(lang,
    `कब से काम चाहिए?\n\n1️⃣ ⚡ आज\n2️⃣ 📅 कल\n3️⃣ 📆 इस हफ्ते\n4️⃣ तारीख लिखें (DD/MM)`,
    `When do you need workers?\n\n1️⃣ ⚡ Today\n2️⃣ 📅 Tomorrow\n3️⃣ 📆 This week\n4️⃣ Type a date (DD/MM)`
  );
}

function askJobLocation(lang) {
  return t(lang,
    `काम की जगह कहाँ है?\n\n📍 *Location Share* करें\n\nया इलाके का नाम लिखें (जैसे: Banjara Hills, Ameerpet)`,
    `Where is the work location?\n\n📍 *Share the Location*\n\nOR type the area name (e.g. Banjara Hills, Ameerpet)`
  );
}

function searchingWorkers(lang) {
  return t(lang, `🔍 ढूंढ रहा हूँ...`, `🔍 Searching nearby workers...`);
}

function noWorkersFound(lang, skill) {
  return t(lang,
    `😔 अभी आपके पास ${skill} उपलब्ध नहीं है।\n\nआपकी request save कर ली है। जैसे ही कोई available होगा, आपको message करेंगे! 🙏`,
    `😔 No ${skill} workers available near you right now.\n\nWe've saved your request. We'll message you as soon as someone is available! 🙏`
  );
}

function showWorkerResults(lang, workers, skillLabel) {
  const header = t(lang,
    `✅ आपके पास *${workers.length} ${skillLabel}* मिले:\n`,
    `✅ Found *${workers.length} ${skillLabel}* near you:\n`
  );
  const list = workers.map((w, i) => {
    const dist = w.distance_km ? ` — ${w.distance_km.toFixed(1)}km` : '';
    const exp = w.experience.replace('lt1', '<1yr').replace('1to3', '1-3yr').replace('3to7', '3-7yr').replace('7plus', '7+yr');
    return `${i + 1}️⃣ *${w.name}* — ${exp} exp — ₹${w.wage_min}-${w.wage_max}/day${dist}`;
  }).join('\n');
  const footer = t(lang,
    `\nKisse baat karni hai? Number likhein (1, 2, 3...)`,
    `\nWhich one would you like to contact? Reply with a number (1, 2, 3...)`
  );
  return header + list + footer;
}

function workerRequestSent(lang, workerName) {
  return t(lang,
    `✅ *${workerName}* ko aapka request bhej diya!\n\nUnka jawab aane par aapko yahan message milega. 🙏`,
    `✅ Request sent to *${workerName}*!\n\nYou'll be notified here once they respond. 🙏`
  );
}

// ─── Worker Notified of Job ───────────────────────────────────────────────────

function jobOfferToWorker(lang, jobData, skillLabel) {
  return t(lang,
    `💼 *Naya kaam ka offer!*\n\n` +
    `• काम: ${skillLabel}\n` +
    `• जगह: ${jobData.address || 'Hyderabad'}\n` +
    `• कब से: ${jobData.start_date}\n\n` +
    `Kya aap yeh kaam lena chahte hain?\n\n1️⃣ ✅ Haan, le lunga\n2️⃣ ❌ Nahi chahiye\n3️⃣ ❓ Pehle baat karni hai`,
    `💼 *New job offer!*\n\n` +
    `• Work: ${skillLabel}\n` +
    `• Location: ${jobData.address || 'Hyderabad'}\n` +
    `• Starting: ${jobData.start_date}\n\n` +
    `Would you like to take this job?\n\n1️⃣ ✅ Yes, I'll take it\n2️⃣ ❌ No, not interested\n3️⃣ ❓ Want to talk first`
  );
}

function workerAccepted(lang, worker, employer) {
  return {
    toWorker: t(lang,
      `✅ Badiya! ${employer.name || 'Employer'} ka number: 📞 ${employer.phone}\nSamay pe pahunch jaana. Shubhkamnayein! 🙏`,
      `✅ Great! Here is the employer's number: 📞 ${employer.phone}\nBe on time. Best of luck! 🙏`
    ),
    toEmployer: t(lang,
      `✅ *${worker.name}* ne accept kar liya!\n\nUnka number: 📞 ${worker.phone}\n\nSamay pe aa jayenge. 🙏`,
      `✅ *${worker.name}* has accepted!\n\nTheir number: 📞 ${worker.phone}\n\nThey will be on time. 🙏`
    ),
  };
}

function workerDeclined(lang, workerName) {
  return t(lang,
    `😔 *${workerName}* abhi available nahi hain.\n\nDusra worker dhundh rahe hain... 🙏`,
    `😔 *${workerName}* is not available right now.\n\nLooking for another worker... 🙏`
  );
}

// ─── Daily Ping ───────────────────────────────────────────────────────────────

function dailyPing(lang, name) {
  return t(lang,
    `🌅 *${name} ji, Namaskar!*\n\nAaj kaam chahiye?\n\n1️⃣ ✅ Haan, aaj available hoon\n2️⃣ ❌ Nahi, aaj nahi\n3️⃣ 📅 Kal se available hoon`,
    `🌅 *Good morning ${name}!*\n\nAre you available for work today?\n\n1️⃣ ✅ Yes, available today\n2️⃣ ❌ No, not today\n3️⃣ 📅 Available from tomorrow`
  );
}

function availabilityConfirmed(lang) {
  return t(lang,
    `✅ Shukriya! Aap aaj available hain — koi employer contact karega to batayenge. 🙏`,
    `✅ Thank you! You're marked available today. We'll notify you if an employer reaches out. 🙏`
  );
}

function unavailabilityConfirmed(lang) {
  return t(lang,
    `👍 Theek hai. Aapko aaj jobs nahi dikhayenge. Kal phir poochha jayega. 🙏`,
    `👍 Okay. You won't receive job offers today. We'll check in tomorrow. 🙏`
  );
}

// ─── Ratings ─────────────────────────────────────────────────────────────────

function askRating(lang, workerName) {
  return t(lang,
    `⭐ ${workerName} ka kaam kaisa raha?\n\nRating dein (1-5):\n1️⃣ ⭐ Bahut bura\n2️⃣ ⭐⭐ Theek\n3️⃣ ⭐⭐⭐ Achha\n4️⃣ ⭐⭐⭐⭐ Bahut achha\n5️⃣ ⭐⭐⭐⭐⭐ Zabardast!`,
    `⭐ How was ${workerName}'s work?\n\nRate them (1-5):\n1️⃣ ⭐ Very bad\n2️⃣ ⭐⭐ Okay\n3️⃣ ⭐⭐⭐ Good\n4️⃣ ⭐⭐⭐⭐ Very good\n5️⃣ ⭐⭐⭐⭐⭐ Excellent!`
  );
}

function ratingConfirmed(lang) {
  return t(lang,
    `🙏 Shukriya! Aapki rating save ho gayi.`,
    `🙏 Thank you! Your rating has been saved.`
  );
}

// ─── Generic ──────────────────────────────────────────────────────────────────

function invalidOption(lang) {
  return t(lang,
    `❌ Sahi number likhein please. 1, 2, 3... mein se chuniye.`,
    `❌ Please enter a valid option number.`
  );
}

function helpText(lang) {
  return t(lang,
    `ℹ️ *RealHands Help*\n\n• Kaam ke liye: KAAM likhein\n• Hire ke liye: HIRE likhein\n• Availability: AVAILABLE likhein\n• Nayi shuruat: RESTART likhein`,
    `ℹ️ *RealHands Help*\n\n• For work: type KAAM\n• To hire: type HIRE\n• Mark available: type AVAILABLE\n• Start over: type RESTART`
  );
}

function alreadyRegistered(lang, worker) {
  return t(lang,
    `👋 *${worker.name} ji!* Aap pehle se registered hain.\n\n🆔 ID: ${worker.worker_id}\n\nAvailability update karne ke liye:\n1️⃣ AVAILABLE — aaj kaam chahiye\n2️⃣ NOTAVAILABLE — aaj nahi`,
    `👋 *${worker.name}!* You're already registered.\n\n🆔 ID: ${worker.worker_id}\n\nTo update availability:\n1️⃣ AVAILABLE — ready to work\n2️⃣ NOTAVAILABLE — not today`
  );
}

module.exports = {
  welcome, askRole, askName, askSkill, askExperience, askLocation, askWage,
  askAvailability, registrationComplete, askSkillNeeded, askWorkerCount,
  askStartDate, askJobLocation, searchingWorkers, noWorkersFound,
  showWorkerResults, workerRequestSent, jobOfferToWorker, workerAccepted,
  workerDeclined, dailyPing, availabilityConfirmed, unavailabilityConfirmed,
  askRating, ratingConfirmed, invalidOption, helpText, alreadyRegistered,
};
