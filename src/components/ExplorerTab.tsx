import { useState, useRef, useEffect } from 'react';
import Fretboard from './Fretboard';
import { CHROMATIC, buildScaleSet, fretToNote } from '../lib/theory';

const STRING_COUNT = 6; const FRET_COUNT = 15;
const SCALE_OPTIONS = [
  { value: 'all',       label: 'All notes'       },
  { value: 'major',     label: 'Major scale'      },
  { value: 'minor',     label: 'Minor scale'      },
  { value: 'pentatonic',label: 'Pentatonic minor' },
  { value: 'blues',     label: 'Blues scale'      },
];

function buildExplorerDots(rootNote: string, scaleName: string) {
  const noteSet = scaleName === 'all' ? null : buildScaleSet(rootNote, scaleName);
  const rootMidi = CHROMATIC.indexOf(rootNote);
  const dots: any[] = [];
  for (let s = 0; s < STRING_COUNT; s++) {
    for (let f = 0; f <= FRET_COUNT; f++) {
      const { note, midi } = fretToNote(s, f);
      const noteClass = midi % 12;
      if (noteSet && !noteSet.has(noteClass)) continue;
      dots.push({ str: s, fret: f, type: noteClass === rootMidi ? 'root' : 'scale', label: note });
    }
  }
  return dots;
}

export default function ExplorerTab() {
  const [root, setRoot] = useState<string>('C');
  const [scale, setScale] = useState<string>('major');

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number>(720);
  useEffect(() => {
    const el = wrapRef.current; if (!el) return; const obs = new ResizeObserver(([e]) => setWidth(e.contentRect.width)); obs.observe(el); return () => obs.disconnect();
  }, []);

  const dots = buildExplorerDots(root, scale);

  return (
    <div className="explorer-layout">
      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="card-header">
          <span className="card-label">Fretboard explorer</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={root} onChange={e => setRoot(e.target.value)} aria-label="Root note">{CHROMATIC.map(n => <option key={n}>{n}</option>)}</select>
            <select value={scale} onChange={e => setScale(e.target.value)} aria-label="Scale type">{SCALE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
          </div>
        </div>

        <div ref={wrapRef} style={{ width: '100%' }}>
          <Fretboard width={Math.max(320, width)} dots={dots} showNoteNames />
        </div>
      </div>

      {scale !== 'all' && (
        <div className="legend"><div className="legend-item"><div className="legend-dot" style={{ background: 'var(--accent)' }} />Root — {root}</div><div className="legend-item"><div className="legend-dot" style={{ background: 'var(--text-2)' }} />Scale notes</div></div>
      )}
    </div>
  );
}
