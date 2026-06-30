// @ts-nocheck
const KEY = 'gt_data';
let _sessionLogged = false;

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

export const storage = {
  get: (k) => load()[k],
  set: (k, v) => { const d = load(); d[k] = v; save(d); },
  getAll: () => load(),
  clear: () => { try { localStorage.removeItem(KEY); } catch {} },

  logNote(label, correct) {
    const d = load();
    d.notes = d.notes || {};
    d.notes[label] = d.notes[label] || { attempts: 0, correct: 0 };
    d.notes[label].attempts++;
    if (correct) d.notes[label].correct++;
    if (!_sessionLogged) { d.sessions = (d.sessions || 0) + 1; _sessionLogged = true; }
    save(d);
  },

  // ── Daily challenge ────────────────────────────────────────────
  /** Get the stored result for a given date (YYYY-MM-DD), or null */
  getDailyChallengeResult(dateStr) {
    const d = load();
    return (d.dailyChallenges && d.dailyChallenges[dateStr]) || null;
  },

  /** Save a completed challenge result and update streak counters */
  saveDailyChallengeResult(dateStr, result) {
    const d = load();
    d.dailyChallenges = d.dailyChallenges || {};
    d.dailyChallenges[dateStr] = result;

    // Recompute streak: walk backwards from today through consecutive
    // completed days.
    let streak = 0;
    let cursor = new Date(dateStr + 'T00:00:00');
    while (true) {
      const key = formatDate(cursor);
      const entry = d.dailyChallenges[key];
      if (entry && entry.completed) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    d.challengeStreak = streak;
    d.bestChallengeStreak = Math.max(d.bestChallengeStreak || 0, streak);

    save(d);
    return { streak, bestStreak: d.bestChallengeStreak };
  },

  getChallengeStreak() {
    const d = load();
    return { streak: d.challengeStreak || 0, bestStreak: d.bestChallengeStreak || 0 };
  },
};

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
