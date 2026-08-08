/**
 * Fretboard Diagram Component
 * Visual representation of the classical guitar fretboard with all notes
 * Based on "Part 1: Getting to know the classical guitar" fretboard chart
 */

import { OPEN_STRINGS, fretToNote, STRING_LABELS, CHROMATIC } from '../lib/theory';

interface FretboardDiagramProps {
  maxFret?: number;
  highlightString?: number;
  highlightFret?: number;
  showNoteNames?: boolean;
}

export default function FretboardDiagram({
  maxFret = 12,
  highlightString = -1,
  highlightFret = -1,
  showNoteNames = true
}: FretboardDiagramProps) {
  const FRET_WIDTH = 60;
  const FRET_HEIGHT = 60;
  const STRING_SPACING = 35;
  const MARGIN_LEFT = 80;
  const MARGIN_TOP = 40;
  const DOT_RADIUS = 12;

  const width = MARGIN_LEFT + maxFret * FRET_WIDTH + 60;
  const height = MARGIN_TOP + 6 * STRING_SPACING + 40;

  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'var(--bg-2)',
      borderRadius: '8px',
      overflow: 'auto'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
        Classical Guitar Fretboard (Frets 0-{maxFret})
      </h3>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          backgroundColor: '#f5e6d3',
          borderRadius: '4px',
          border: '1px solid var(--border)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {/* String labels */}
        {OPEN_STRINGS.map((str, idx) => (
          <text
            key={`label-${idx}`}
            x={MARGIN_LEFT - 20}
            y={MARGIN_TOP + idx * STRING_SPACING + 8}
            fontSize="12"
            fontWeight="bold"
            textAnchor="end"
            fill="#333"
          >
            {STRING_LABELS[5 - idx]}
          </text>
        ))}

        {/* Fret lines and strings */}
        {OPEN_STRINGS.map((_, strIdx) => (
          <line
            key={`string-${strIdx}`}
            x1={MARGIN_LEFT}
            y1={MARGIN_TOP + strIdx * STRING_SPACING}
            x2={MARGIN_LEFT + maxFret * FRET_WIDTH}
            y2={MARGIN_TOP + strIdx * STRING_SPACING}
            stroke="#333"
            strokeWidth="2"
          />
        ))}

        {/* Fret markers */}
        {Array.from({ length: maxFret + 1 }).map((_, fret) => (
          <g key={`fret-${fret}`}>
            {/* Fret number */}
            <text
              x={MARGIN_LEFT + fret * FRET_WIDTH + FRET_WIDTH / 2}
              y={MARGIN_TOP - 15}
              fontSize="11"
              fontWeight={fret === 0 ? 'bold' : 'normal'}
              textAnchor="middle"
              fill="#333"
            >
              {fret}
            </text>

            {/* Fret line (except open) */}
            {fret > 0 && (
              <line
                x1={MARGIN_LEFT + fret * FRET_WIDTH}
                y1={MARGIN_TOP}
                x2={MARGIN_LEFT + fret * FRET_WIDTH}
                y2={MARGIN_TOP + 6 * STRING_SPACING - STRING_SPACING}
                stroke="#999"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            )}
          </g>
        ))}

        {/* Note markers and labels */}
        {OPEN_STRINGS.map((_, strIdx) =>
          Array.from({ length: maxFret + 1 }).map((_, fret) => {
            const { label, note } = fretToNote(strIdx, fret);
            const isHighlighted = highlightString === strIdx && highlightFret === fret;
            const isNatural = !note.includes('#') && !note.includes('b');

            return (
              <g key={`dot-${strIdx}-${fret}`}>
                {/* Dot */}
                <circle
                  cx={MARGIN_LEFT + fret * FRET_WIDTH + FRET_WIDTH / 2}
                  cy={MARGIN_TOP + strIdx * STRING_SPACING}
                  r={DOT_RADIUS}
                  fill={isHighlighted ? '#ff6b6b' : isNatural ? '#fff9c4' : '#f0f0f0'}
                  stroke={isHighlighted ? '#cc0000' : '#333'}
                  strokeWidth={isHighlighted ? '2' : '1'}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 200ms ease'
                  }}
                />

                {/* Note label */}
                {showNoteNames && (
                  <text
                    x={MARGIN_LEFT + fret * FRET_WIDTH + FRET_WIDTH / 2}
                    y={MARGIN_TOP + strIdx * STRING_SPACING + 5}
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isHighlighted ? '#fff' : '#333'}
                    pointerEvents="none"
                  >
                    {label}
                  </text>
                )}
              </g>
            );
          })
        )}

        {/* Fret markers (dots on frets 5, 7, 12) */}
        {[5, 7, 12].filter(f => f <= maxFret).map(fret => (
          <circle
            key={`marker-${fret}`}
            cx={MARGIN_LEFT + fret * FRET_WIDTH + FRET_WIDTH / 2}
            cy={MARGIN_TOP + 3 * STRING_SPACING}
            r="3"
            fill="#999"
            opacity="0.5"
          />
        ))}
      </svg>

      {/* Legend */}
      <div style={{
        marginTop: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        fontSize: '14px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#fff9c4',
              border: '1px solid #333',
              borderRadius: '50%'
            }} />
            <span>Natural Notes (C, D, E, F, G, A, B)</span>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#f0f0f0',
              border: '1px solid #333',
              borderRadius: '50%'
            }} />
            <span>Accidentals (# and b)</span>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: 'transparent'
            }} />
            <span>Frets 5, 7, 12: Key intervals</span>
          </div>
        </div>
      </div>
    </div>
  );
}
