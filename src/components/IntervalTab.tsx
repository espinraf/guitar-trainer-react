import { useState, useRef, useEffect } from 'react';
import { useIntervalTrainer, DEFAULT_INTERVAL_POOL } from '../hooks/useIntervalTrainer';
import Fretboard from './Fretboard';
import { INTERVALS, CHROMATIC } from '../lib/theory';

const MODE_OPTIONS = [
  { value: 'listen', label: 'Listen & identify' },
  { value: 'find',   label: 'Find on fretboard' },
];

export default function IntervalTab() {
  const [mode, setMode] = useState<'listen' | 'find'>('listen');
  const [intervalPool, setIntervalPool] = useState<any[]>(DEFAULT_INTERVAL_POOL);

  const trainer = useIntervalTrainer({ mode, intervalPool });
  const { state, score, attempts, correct, streak, next, playQuestion, playRoot, answerListen, answerFind } = trainer as any;
  const { interval, rootMidi, answered, lastResult, lastClickedDot } = state as any;

  useEffect(() => {
    if (mode === 'listen') {
      const t = setTimeout(playQuestion, 300);
      return () => clearTimeout(t);
    }
  }, [state, mode]);

  const fretWrapRef = useRef<HTMLDivElement | null>(null);
  const [fretWidth, setFretWidth] = useState<number>(620);
  useEffect(() => {
    const el = fretWrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setFretWidth(e.contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const acc = attempts === 0 ? '—' : Math.round((correct / attempts) * 100) + '%';
  const rootNoteName = CHROMATIC[rootMidi % 12];

  const toggleIntervalInPool = (iv: any) => {
    setIntervalPool(prev => {
      const has = prev.includes(iv);
      if (has && prev.length === 1) return prev;
      return has ? prev.filter((p: any) => p !== iv) : [...prev, iv];
    });
  };

  const dots = mode === 'find' && lastClickedDot ? [lastClickedDot] : [];

  return (
    <div className="interval-layout">
      <div className="card interval-controls-card">
        <div className="card-header">
          <span className="card-label">Interval trainer</span>
          <select value={mode} onChange={e => { setMode(e.target.value as 'listen' | 'find'); next(); }}>
            {MODE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="ctrl-group">
          <label className="ctrl-label">Practice intervals</label>
          <div className="interval-pill-row">
            {INTERVALS.filter(iv => iv.semitones > 0).map((iv: any) => (
              <button
                key={iv.short}
                className={`interval-pill ${intervalPool.includes(iv) ? 'active' : ''}`}
                onClick={() => toggleIntervalInPool(iv)}
              >
                {iv.short}
              </button>
            ))}
          </div>
        </div>
      </div>

      {mode === 'listen' ? (
        <div className="card interval-question-card">
          <div className="card-header">
            <span className="card-label">What interval do you hear?</span>
            <button className="btn btn-ghost btn-sm" onClick={playQuestion}>▶ Replay</button>
          </div>

          <div className="interval-listen-stage">
            <div className={`interval-result-badge ${lastResult || ''}`}>
              {answered ? interval.name : '🎧'}
            </div>
            <div className="interval-feedback-text">
              {!answered && 'Listen to the two notes, then pick the interval'}
              {answered && lastResult === 'correct' && `✓ Correct! That was a ${interval.name} (${interval.short})`}
              {answered && lastResult === 'wrong' && `Not quite. That was a ${interval.name} (${interval.short})`}
            </div>
          </div>

          <div className="interval-answer-grid">
            {intervalPool.map((iv: any) => (
              <button
                key={iv.short}
                className={`interval-answer-btn ${answered && iv.semitones === interval.semitones ? 'reveal-correct' : ''}`}
                disabled={answered}
                onClick={() => answerListen(iv.semitones)}
              >
                <span className="interval-answer-short">{iv.short}</span>
                <span className="interval-answer-name">{iv.name}</span>
              </button>
            ))}
          </div>

          <div className="action-bar" style={{ marginTop: 4 }}>
            <div className="feedback feedback--idle">{answered ? 'Press Next to continue' : 'Choose the interval you hear'}</div>
            <button className="btn btn-primary" onClick={next} disabled={!answered}>Next <kbd>↵</kbd></button>
          </div>
        </div>
      ) : (
        <>
          <div className="card interval-question-card">
            <div className="card-header">
              <span className="card-label">Find the {interval.name} above {rootNoteName}</span>
              <button className="btn btn-ghost btn-sm" onClick={playRoot}>▶ Play root</button>
            </div>
            <div className="interval-find-prompt">
              <span className="interval-find-root">{rootNoteName}</span>
              <span className="interval-find-arrow">→</span>
              <span className="interval-find-target">{interval.short}</span>
              <span className="interval-find-name">{interval.name}</span>
            </div>
          </div>

          <div className="card fretboard-card">
            <div ref={fretWrapRef} style={{ width: '100%' }}>
              <Fretboard
                width={Math.max(320, fretWidth)}
                onFretClick={answered ? null : answerFind}
                dots={dots}
                showNoteNames
              />
            </div>
          </div>

          <div className="action-bar">
            <div className={`feedback feedback--${lastResult || 'idle'}`}>
              {!lastResult && 'Click the fret that is this interval above the root'}
              {lastResult === 'correct' && '✓ Correct!'}
              {lastResult === 'wrong' && '✗ Not quite — try another fret'}
            </div>
            <button className="btn btn-primary" onClick={next} disabled={!answered}>Next <kbd>↵</kbd></button>
          </div>
        </>
      )}

      <div className="interval-stats-row">
        <div className="stat-card"><div className="stat-label">Score</div><div className="stat-value">{score}</div></div>
        <div className="stat-card"><div className="stat-label">Accuracy</div><div className="stat-value">{acc}</div><div className="stat-sub">{attempts === 0 ? 'no answers yet' : `${correct} of ${attempts}`}</div></div>
        <div className="stat-card streak-card"><div className="stat-label">Streak</div><div className="stat-value">{streak}</div></div>
      </div>
    </div>
  );
}
