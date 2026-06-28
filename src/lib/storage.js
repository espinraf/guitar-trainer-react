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
};
