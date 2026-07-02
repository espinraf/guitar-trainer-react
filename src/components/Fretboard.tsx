import { fretToNote, STRING_LABELS } from '../lib/theory';

const STRING_COUNT  = 6;
const FRET_COUNT    = 24;
const FRET_MARKERS  = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
const PAD_L = 38; const PAD_R = 16; const PAD_T = 26; const PAD_B = 28;
const HEIGHT = 166;

const DOT_COLORS: Record<string,string> = {
  correct:   'var(--accent)', wrong: 'var(--danger)', hint: 'var(--warning)', root: 'var(--accent)', scale: 'var(--text-2)', active: 'var(--scale-active, #f59e0b)', chordtone: 'var(--chordtone, #4a90d9)',
};

type Dot = { str: number; fret: number; type?: string; label?: string };

type HighlightPos = { minFret: number; maxFret: number } | null;

type FretboardProps = {
  width?: number;
  onFretClick?: ((str: number, fret: number) => void) | null;
  dots?: Dot[];
  showNoteNames?: boolean;
  highlightPos?: HighlightPos;
};

export default function Fretboard({ width = 620, onFretClick, dots = [], showNoteNames = false, highlightPos = null }: FretboardProps) {
  const fw = width - PAD_L - PAD_R;
  const fh = HEIGHT - PAD_T - PAD_B;
  const strSpacing  = fh / (STRING_COUNT - 1);
  const fretSpacing = fw / FRET_COUNT;

  return (
    <svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} className="fretboard-svg" aria-label="Guitar fretboard" role="img" style={{ display: 'block' }}>
      {highlightPos && (() => {
        const { minFret, maxFret } = highlightPos;
        const bx = PAD_L + (minFret - 0.5) * fretSpacing;
        const bw = (maxFret - minFret + 1) * fretSpacing;
        return <rect x={bx} y={PAD_T - 10} width={bw} height={fh + 20} rx={6} className="position-bracket" />;
      })()}

      <rect x={PAD_L - 4} y={PAD_T - 2} width={6} height={fh + 4} rx={3} className="fret-nut" />
      <rect x={PAD_L} y={PAD_T} width={fw} height={fh} fill="var(--neck-bg, transparent)" rx={2} />

      {FRET_MARKERS.filter(f => f <= FRET_COUNT).map(f => {
        const x = PAD_L + (f - 0.5) * fretSpacing;
        if (f === 12) return [<circle key={`${f}a`} cx={x} cy={HEIGHT / 2 - strSpacing * 1.1} r={4} className="fret-marker" />, <circle key={`${f}b`} cx={x} cy={HEIGHT / 2 + strSpacing * 1.1} r={4} className="fret-marker" />];
        return <circle key={f} cx={x} cy={HEIGHT / 2} r={4} className="fret-marker" />;
      })}

      {Array.from({ length: FRET_COUNT }, (_, i) => i + 1).map(f => (
        <line key={f} x1={PAD_L + f * fretSpacing} x2={PAD_L + f * fretSpacing} y1={PAD_T} y2={PAD_T + fh} className="fret-line" />
      ))}

      {Array.from({ length: STRING_COUNT }, (_, s) => {
        const y = PAD_T + s * strSpacing;
        const thick = 0.7 + (STRING_COUNT - 1 - s) * 0.32;
        return (
          <g key={s}>
            <line x1={PAD_L} x2={PAD_L + fw} y1={y} y2={y} className="string-line" strokeWidth={thick} />
            <text x={PAD_L - 14} y={y + 4} className="string-label">{STRING_LABELS[s]}</text>
          </g>
        );
      })}

      {Array.from({ length: FRET_COUNT }, (_, i) => i + 1).filter(f => f % 2 === 1).map(f => (
        <text key={f} x={PAD_L + (f - 0.5) * fretSpacing} y={HEIGHT - 6} className="fret-number">{f}</text>
      ))}

      {onFretClick && Array.from({ length: STRING_COUNT }, (_, s) => {
        const y = PAD_T + s * strSpacing;
        const zones = [] as any[];
        zones.push(<rect key={`open-${s}`} x={0} y={y - strSpacing / 2} width={PAD_L - 5} height={strSpacing} className="fret-zone" role="button" tabIndex={0} aria-label={`Open ${STRING_LABELS[s]} string`} onClick={() => onFretClick(s, 0)} onKeyDown={(e: any) => (e.key === 'Enter' || e.key === ' ') && onFretClick(s, 0)} />);
        for (let f = 1; f <= FRET_COUNT; f++) {
          zones.push(<rect key={`${s}-${f}`} x={PAD_L + (f - 1) * fretSpacing + 2} y={y - strSpacing / 2} width={fretSpacing - 4} height={strSpacing} className="fret-zone" role="button" tabIndex={0} aria-label={`String ${STRING_LABELS[s]}, fret ${f}`} onClick={() => onFretClick(s, f)} onKeyDown={(e: any) => (e.key === 'Enter' || e.key === ' ') && onFretClick(s, f)} />);
        }
        return zones;
      })}

      {dots.map(({ str, fret, type, label }, i) => {
        const x = fret === 0 ? PAD_L - 18 : PAD_L + (fret - 0.5) * fretSpacing;
        const y = PAD_T + str * strSpacing;
        const fill = DOT_COLORS[type || ''] || 'var(--text-2)';
        const displayLabel = label || (showNoteNames ? fretToNote(str, fret).note : null);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={9} fill={fill} opacity={type === 'hint' ? 0.7 : 0.92} style={{ transition: 'fill 150ms ease' }} />
            {displayLabel && <text x={x} y={y} className="fret-dot-label" dominantBaseline="central">{displayLabel}</text>}
          </g>
        );
      })}
    </svg>
  );
}
