// CagedTab.jsx — CAGED system fretboard visualizer

import { useRef, useEffect, useState } from 'react';
import { useCagedExplorer } from '../hooks/useCagedExplorer';
import Fretboard from './Fretboard';
import { CHROMATIC } from '../lib/theory';
import { CAGED_ORDER } from '../lib/caged';

const SHAPE_COLORS = {
  C: '#e0735c',
  A: '#4a90d9',
  G: '#5cb87a',
  E: '#c77fd9',
  D: '#d9b54a',
};

export default function CagedTab() {
  const {
    root, setRoot,
    activeShapes, toggleShape, showAll, showOnly,
    orderedShapes,
    dots,
    soundOn, setSoundOn,
    handleNoteClick,
  } = useCagedExplorer();

  const fretWrapRef = useRef(null);
  const [fretWidth, setFretWidth] = useState(760);
  useEffect(() => {
    const el = fretWrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setFretWidth(e.contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="caged-layout">

      {/* ── Controls ── */}
      <div className="card caged-controls-card">
        <div className="card-header">
          <span className="card-label">CAGED system</span>
          <label className="toggle-row" style={{ gap: 6 }}>
            <span style={{ fontSize: 12 }}>Sound</span>
            <span className={`toggle-knob ${soundOn ? 'on' : ''}`} onClick={() => setSoundOn(!soundOn)} />
          </label>
        </div>

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

        {/* Shape toggles */}
        <div className="ctrl-group" style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label className="ctrl-label">Shapes</label>
            <button className="btn btn-ghost btn-sm" onClick={showAll}>Show all</button>
          </div>
          <div className="shape-toggle-row">
            {CAGED_ORDER.map(key => (
              <button
                key={key}
                className={`shape-toggle-btn ${activeShapes.has(key) ? 'active' : ''}`}
                style={activeShapes.has(key) ? {
                  borderColor: SHAPE_COLORS[key],
                  background: SHAPE_COLORS[key] + '1a',
                  color: SHAPE_COLORS[key],
                } : undefined}
                onClick={() => toggleShape(key)}
              >
                {key} shape
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Fretboard ── */}
      <div className="card caged-fretboard-card">
        <div className="card-header">
          <span className="card-label">
            {root} major across the neck
          </span>
        </div>
        <div ref={fretWrapRef} style={{ width: '100%' }}>
          <Fretboard
            width={Math.max(320, fretWidth)}
            dots={dots}
            showNoteNames
            onFretClick={handleNoteClick}
          />
        </div>

        <div className="legend" style={{ paddingTop: 10 }}>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--accent)' }} />
            Root note
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--chordtone, #4a90d9)' }} />
            Chord tone (3rd/5th)
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--text-2)' }} />
            Scale passing note
          </div>
        </div>
      </div>

      {/* ── Shape chain strip ── */}
      <div className="card caged-chain-card">
        <div className="card-header">
          <span className="card-label">How the shapes chain up the neck</span>
        </div>
        <div className="caged-chain">
          {orderedShapes.map(({ key, minFret }, i) => (
            <div key={key} className="chain-item">
              <button
                className="chain-shape-btn"
                style={{
                  borderColor: SHAPE_COLORS[key],
                  background: activeShapes.has(key) ? SHAPE_COLORS[key] + '22' : 'transparent',
                  color: SHAPE_COLORS[key],
                }}
                onClick={() => showOnly(key)}
              >
                <span className="chain-shape-letter">{key}</span>
                <span className="chain-shape-fret">~fret {minFret}</span>
              </button>
              {i < orderedShapes.length - 1 && <div className="chain-arrow">→</div>}
            </div>
          ))}
        </div>
        <p className="caged-explainer">
          Each shape is named after the open chord it resembles. Together the five
          shapes form one continuous pattern that repeats every octave (12 frets).
          Click a shape above to isolate it, or toggle multiple shapes to see how
          they overlap.
        </p>
      </div>

    </div>
  );
}
