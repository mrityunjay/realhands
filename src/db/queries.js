const { getDb } = require('./database');

// ─── Worker Queries ───────────────────────────────────────────────────────────

function createWorker(data) {
  const db = getDb();
  const workerId = 'KM-' + String(Math.floor(1000 + Math.random() * 9000));
  db.prepare(`
    INSERT OR REPLACE INTO workers
      (phone, name, skill, experience, city, latitude, longitude, wage_min, wage_max, language, available, worker_id)
    VALUES
      (@phone, @name, @skill, @experience, @city, @latitude, @longitude, @wage_min, @wage_max, @language, 1, @worker_id)
  `).run({ ...data, worker_id: workerId });
  return workerId;
}

function getWorkerByPhone(phone) {
  return getDb().prepare('SELECT * FROM workers WHERE phone = ?').get(phone);
}

function setWorkerAvailability(phone, available) {
  getDb().prepare(`
    UPDATE workers SET available = ?, last_active = datetime('now') WHERE phone = ?
  `).run(available ? 1 : 0, phone);
}

function getAllActiveWorkers() {
  return getDb().prepare("SELECT * FROM workers WHERE available = 1").all();
}

function findNearbyWorkers(skill, latitude, longitude, radiusKm = 15, limit = 5) {
  const workers = getDb().prepare(`
    SELECT *,
      (6371 * acos(
        cos(radians(?)) * cos(radians(latitude)) *
        cos(radians(longitude) - radians(?)) +
        sin(radians(?)) * sin(radians(latitude))
      )) AS distance_km
    FROM workers
    WHERE skill = ? AND available = 1 AND latitude IS NOT NULL
    ORDER BY distance_km ASC
    LIMIT ?
  `).all(latitude, longitude, latitude, skill, limit);

  return workers.filter(w => w.distance_km <= radiusKm);
}

function findWorkersByCity(skill, city, limit = 5) {
  return getDb().prepare(`
    SELECT * FROM workers
    WHERE skill = ? AND available = 1 AND city LIKE ?
    ORDER BY last_active DESC
    LIMIT ?
  `).all(skill, `%${city}%`, limit);
}

function getWorkerStats() {
  const db = getDb();
  return {
    total: db.prepare('SELECT COUNT(*) as c FROM workers').get().c,
    available: db.prepare('SELECT COUNT(*) as c FROM workers WHERE available = 1').get().c,
    bySkill: db.prepare(`
      SELECT skill, COUNT(*) as count FROM workers GROUP BY skill ORDER BY count DESC
    `).all(),
  };
}

// ─── Employer Queries ─────────────────────────────────────────────────────────

function upsertEmployer(phone, name) {
  getDb().prepare(`
    INSERT INTO employers (phone, name) VALUES (?, ?)
    ON CONFLICT(phone) DO UPDATE SET name = excluded.name
  `).run(phone, name || null);
}

// ─── Job Queries ──────────────────────────────────────────────────────────────

function createJob(data) {
  const result = getDb().prepare(`
    INSERT INTO jobs (employer_phone, skill_needed, workers_needed, start_date, latitude, longitude, address)
    VALUES (@employer_phone, @skill_needed, @workers_needed, @start_date, @latitude, @longitude, @address)
  `).run(data);
  return result.lastInsertRowid;
}

function createJobRequest(jobId, workerPhone, employerPhone) {
  getDb().prepare(`
    INSERT INTO job_requests (job_id, worker_phone, employer_phone)
    VALUES (?, ?, ?)
  `).run(jobId, workerPhone, employerPhone);
}

function updateJobRequestStatus(jobId, workerPhone, status) {
  getDb().prepare(`
    UPDATE job_requests SET status = ? WHERE job_id = ? AND worker_phone = ?
  `).run(status, jobId, workerPhone);
}

function getPendingRequestForWorker(workerPhone) {
  return getDb().prepare(`
    SELECT jr.*, j.skill_needed, j.start_date, j.address, j.latitude, j.longitude
    FROM job_requests jr
    JOIN jobs j ON j.id = jr.job_id
    WHERE jr.worker_phone = ? AND jr.status = 'pending'
    ORDER BY jr.created_at DESC
    LIMIT 1
  `).get(workerPhone);
}

function saveRating(workerPhone, employerPhone, rating) {
  getDb().prepare(`
    INSERT INTO ratings (worker_phone, employer_phone, rating) VALUES (?, ?, ?)
  `).run(workerPhone, employerPhone, rating);
}

function getWorkerAvgRating(phone) {
  const result = getDb().prepare(`
    SELECT AVG(rating) as avg, COUNT(*) as count FROM ratings WHERE worker_phone = ?
  `).get(phone);
  return result;
}

function getRecentJobs(limit = 20) {
  return getDb().prepare(`
    SELECT j.*, COUNT(jr.id) as requests
    FROM jobs j
    LEFT JOIN job_requests jr ON jr.job_id = j.id
    GROUP BY j.id
    ORDER BY j.created_at DESC
    LIMIT ?
  `).all(limit);
}

module.exports = {
  createWorker, getWorkerByPhone, setWorkerAvailability,
  getAllActiveWorkers, findNearbyWorkers, findWorkersByCity, getWorkerStats,
  upsertEmployer, createJob, createJobRequest, updateJobRequestStatus,
  getPendingRequestForWorker, saveRating, getWorkerAvgRating, getRecentJobs,
};
