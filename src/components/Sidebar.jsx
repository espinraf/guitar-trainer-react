// Sidebar.jsx — Score, accuracy, streak, daily goal, options

const NOTE_SET_OPTIONS = [
  { value: 'natural', label: 'Natural notes only' },
  { value: 'sharps',  label: 'Naturals + sharps'  },
  { value: 'flats',   label: 'Naturals + flats'   },
  { value: 'all',     label: 'All notes'           },
];

export default function Sidebar({
  score, attempts, correct, streak,
  answered, dailyGoal,
  showNames, onShowNames,
  soundOn, onSoundOn,
  noteSet, onNoteSet,
}) {
  const acc = attempts === 0
    ? '—'
    : Math.round((correct / attempts) * 100) + '%';
  const accSub = attempts === 0
    ? 'no answers yet'
    : `${correct} of ${attempts}`;
  const progress = Math.min(100, Math.round((answered / dailyGoal) * 100));

  return (
    <aside className="sidebar">
      {/* Score */}
      <div className="stat-card">
        <div className="stat-label">Score</div>
        <div className="stat-value">{score}</div>
      </div>

      {/* Accuracy */}
      <div className="stat-card">
        <div className="stat-label">Accuracy</div>
        <div className="stat-value">{acc}</div>
        <div className="stat-sub">{accSub}</div>
      </div>

      {/* Streak */}
      <div className="stat-card streak-card">
        <div className="stat-label">Streak</div>
        <div className="stat-value">{streak}</div>
        <FlameIcon className="streak-flame" />
      </div>

      {/* Daily goal */}
      <div className="goal-card">
        <div className="stat-label">Daily goal</div>
        <div className="goal-text">{answered} / {dailyGoal} notes</div>
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Daily progress"
        >
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Options */}
      <div className="options-card">
        <div className="stat-label">Options</div>

        {/* Note set selector */}
        <div className="option-row">
          <label htmlFor="noteSetSelect" className="option-label">Note set</label>
          <select
            id="noteSetSelect"
            value={noteSet}
            onChange={e => onNoteSet(e.target.value)}
            style={{ fontSize: 11 }}
          >
            {NOTE_SET_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <Toggle label="Show note names" checked={showNames} onChange={onShowNames} />
        <Toggle label="Sound on answer"  checked={soundOn}   onChange={onSoundOn}  />
      </div>
    </aside>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <span className={`toggle-knob ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)} />
    </label>
  );
}

function FlameIcon({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 16c-3.3 0-6-2.5-6-6 0-2 .8-3.5 2-4.5.5 1 1.5 1.5 2 1.5C7 4 8 2 9 1c0 2 1 3 2.5 3.5C13.5 5.5 15 7.5 15 10c0 3.5-2.7 6-6 6z"
        fill="currentColor" opacity="0.6"/>
      <path d="M9 13c-1.7 0-3-1.2-3-3 0-1 .5-2 1.5-2.5.2.5.8 1 1.5 1C9 7 9.5 6 10 5c.5 1 1.5 2 2 3-.5.5-1 1-1 1.5 0 .8.7 1.5 1.5 1.5-.5 1.2-1.7 2-3.5 2z"
        fill="currentColor"/>
    </svg>
  );
}
