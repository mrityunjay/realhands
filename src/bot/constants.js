const SKILLS = {
  '1': { hi: 'राजमिस्त्री', en: 'Mason/Mistri', code: 'mason', emoji: '🧱' },
  '2': { hi: 'बढ़ई',        en: 'Carpenter',    code: 'carpenter', emoji: '🔨' },
  '3': { hi: 'इलेक्ट्रीशियन', en: 'Electrician', code: 'electrician', emoji: '⚡' },
  '4': { hi: 'प्लंबर',      en: 'Plumber',       code: 'plumber', emoji: '🔧' },
  '5': { hi: 'लेबर (सामान्य)', en: 'General Labour', code: 'labour', emoji: '🏗️' },
  '6': { hi: 'ड्राइवर',     en: 'Driver',         code: 'driver', emoji: '🚛' },
  '7': { hi: 'पेंटर',       en: 'Painter',         code: 'painter', emoji: '🎨' },
  '8': { hi: 'सफाई कर्मी',  en: 'Cleaner',         code: 'cleaner', emoji: '🧹' },
  '9':  { hi: 'सिक्योरिटी गार्ड', en: 'Security Guard', code: 'security', emoji: '💂' },
  '10': { hi: 'माली',           en: 'Gardener',       code: 'gardener', emoji: '🌱' },
  '11': { hi: 'रसोइया / मेड',    en: 'Cook / Maid',    code: 'cook_maid', emoji: '🍳' },
  '12': { hi: 'वेल्डर',         en: 'Welder',         code: 'welder', emoji: '🔥' },
};

const EXPERIENCE = {
  '1': { hi: '1 साल से कम', en: 'Less than 1 year', code: 'lt1' },
  '2': { hi: '1-3 साल',     en: '1-3 years',        code: '1to3' },
  '3': { hi: '3-7 साल',     en: '3-7 years',        code: '3to7' },
  '4': { hi: '7+ साल',      en: '7+ years',         code: '7plus' },
};

const WAGES = {
  '1': { min: 400,  max: 500,  hi: '₹400–500/दिन',  en: '₹400–500/day'  },
  '2': { min: 500,  max: 700,  hi: '₹500–700/दिन',  en: '₹500–700/day'  },
  '3': { min: 700,  max: 900,  hi: '₹700–900/दिन',  en: '₹700–900/day'  },
  '4': { min: 900,  max: 1200, hi: '₹900–1200/दिन', en: '₹900–1200/day' },
  '5': { min: 1200, max: 2000, hi: '₹1200+/दिन',    en: '₹1200+/day'    },
};

const WORKER_COUNT = {
  '1': 1,
  '2': 3,
  '3': 7,
  '4': 15,
};

function getSkillByCode(code) {
  return Object.values(SKILLS).find(s => s.code === code);
}

module.exports = { SKILLS, EXPERIENCE, WAGES, WORKER_COUNT, getSkillByCode };
