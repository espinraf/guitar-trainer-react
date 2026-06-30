// ScalesTab.jsx — Scale trainer with metronome

import { useRef, useEffect, useState } from 'react';
import { useScaleTrainer }  from '../hooks/useScaleTrainer';
import { useMetronome }     from '../hooks/useMetronome';
import Fretboard            from './Fretboard';
import { CHROMATIC, SCALE_POSITIONS } from '../lib/theory';
import { resumeAudio }      from '../lib/audio';

const SCALE_OPTIONS = [
  { value: 'major',      label: 'Major'            },
  { value: 'minor',      label: 'Natural minor'    },
  { value: 'pentatonic', label: 'Pentatonic minor' },
  { value: 'blues',      label: 'Blues'            },
];

const DIRECTION_OPTIONS = [
  { value: 'asc',  label: '↑ Ascending'  },
  { value: 'desc', label: '↓ Descending' },
  { value: 'both', label: '↕ Both'       },
];

const BPM_MIN = 40;
const BPM_MAX = 200;

export default function ScalesTab() {
  const trainer = useScaleTrainer();
  const {
    root, setRoot,
    scaleName, setScaleName,
    posIndex, setPosIndex,
    direction, setDirection,
    soundOn, setSoundOn,
    position, sequence, stepIndex, currentNote, dots,
    isRunning, onBeat, start, stop, stepForward, stepBack,
  } = trainer;

  const metro = useMetronome({ onBeat, beatsPerBar: 4 });
  const { isPlaying, bpm, beat, setBpm } = metro;

  const handleStart = () => { resumeAudio(); start(); metro.start(); };
  const handleStop  = () => { stop(); metro.stop(); };
  const handleToggle = () => isPlaying ? handleStop() : handleStart();

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.key === ' ') { e.preventDefault(); handleToggle(); }
      if (!isPlaying) {
        if (e.key === 'ArrowRight') stepForward();
        if (e.key === 'ArrowLeft')  stepBack();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPlaying, handleToggle, stepForward, stepBack]);

  // Fretboard width
  const fretWrapRef = useRef(null);
  const [fretWidth, setFretWidth] = useState(680);
  useEffect(() => {
    const el = fretWrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setFretWidth(e.contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const totalSteps   = sequence.length;
  const currentLabel = currentNote?.note ?? '—';
  const rootMidiClass = CHROMATIC.indexOf(root);

  return (
    <div className="scales-layout">

      {/* Controls */}
      <div className="card scales-controls-card">
        <div className="card-header">
          <span className="card-label">Scale trainer</span>
          <label className="toggle-row" style={{ gap: 6 }}>
            <span style={{ fontSize: 12 }}>Sound</span>
            <span className={`toggle-knob ${soundOn ? 'on' : ''}`} onClick={() => setSoundOn(!soundOn)} />
          </label>
        </div>

        <div className="scales-controls">
          {/* Root picker */}
          <div className="ctrl-group">
            <label className="ctrl-label">Root</label>
            <div className="root-picker">
              {CHROMATIC.map(n => (
                <button
                  key={n}
                  className={`root-btn ${root === n ? 'active' : ''}`}
                  onClick={() => setRoot(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="scales-controls-row">
            <div className="ctrl-group">
              <label className="ctrl-label">Scale</label>
              <select value={scaleName} onChange={e => setScaleName(e.target.value)}>
                {SCALE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="ctrl-group">
              <label className="ctrl-label">Direction</label>
              <select value={direction} onChange={e => setDirection(e.target.value)}>
                {DIRECTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="ctrl-group">
              <label className="ctrl-label">Position</label>
              <select value={posIndex} onChange={e => setPosIndex(Number(e.target.value))}>
                {SCALE_POSITIONS.map((p, i) => <option key={i} value={i}>{p.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Fretboard */}
      <div className="card scales-fretboard-card">
        <div className="card-header">
          <span className="card-label">
            {root} {SCALE_OPTIONS.find(o => o.value === scaleName)?.label} — {position.label}
          </span>
          <div className="current-note-badge">
            <span className="current-note-name">{currentLabel}</span>
          </div>
        </div>

        <div ref={fretWrapRef} style={{ width: '100%' }}>
          <Fretboard
            width={Math.max(320, fretWidth)}
            dots={dots}
            showNoteNames
            highlightPos={{ minFret: position.minFret, maxFret: Math.min(position.maxFret, 15) }}
          />
        </div>

        {/* Step dots */}
        <div className="step-indicator" aria-label="Scale steps">
          {sequence.map((n, i) => (
            <div
              key={i}
              className={`step-dot ${i === stepIndex ? 'active' : ''} ${n.midi % 12 === rootMidiClass ? 'root' : ''}`}
              title={n.note}
            />
          ))}
        </div>
      </div>

      {/* Transport */}
      <div className="card transport-card">
        {/* Beat lamps */}
        <div className="beat-indicators">
          {[1,2,3,4].map(b => (
            <div
              key={b}
              className={`beat-lamp ${isPlaying && beat === b ? 'on' : ''} ${b === 1 ? 'downbeat' : ''}`}
            />
          ))}
        </div>

        {/* BPM */}
        <div className="bpm-control">
          <button className="bpm-adj-btn" onClick={() => setBpm(Math.max(BPM_MIN, bpm - 5))} aria-label="Decrease BPM">−</button>
          <div className="bpm-display">
            <span className="bpm-value">{bpm}</span>
            <span className="bpm-label">BPM</span>
          </div>
          <button className="bpm-adj-btn" onClick={() => setBpm(Math.min(BPM_MAX, bpm + 5))} aria-label="Increase BPM">+</button>
          <input
            type="range" min={BPM_MIN} max={BPM_MAX} value={bpm}
            onChange={e => setBpm(Number(e.target.value))}
            className="bpm-slider" aria-label="BPM"
          />
        </div>

        {/* Playback */}
        <div className="transport-btns">
          {!isPlaying && (
            <>
              <button className="btn btn-ghost transport-step-btn" onClick={stepBack}  title="Step back (←)">⏮</button>
              <button className="btn btn-ghost transport-step-btn" onClick={stepForward} title="Step forward (→)">⏭</button>
            </>
          )}
          <button
            className={`btn transport-play-btn ${isPlaying ? 'btn-stop' : 'btn-primary'}`}
            onClick={handleToggle}
            title="Space to play/stop"
          >
            {isPlaying ? '⏹ Stop' : '▶ Play'}
          </button>
        </div>

        <div className="transport-hint">
          {isPlaying
            ? `Step ${stepIndex + 1} of ${totalSteps}`
            : 'Space to play · ← → to step manually'}
        </div>
      </div>

      {/* Legend */}
      <div className="legend" style={{ paddingTop: 0 }}>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'var(--accent)' }} />Root — {root}
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'var(--scale-active)' }} />Current note
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'var(--text-2)' }} />Scale notes
        </div>
      </div>

    </div>
  );
}
