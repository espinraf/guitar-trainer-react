// Staff.jsx — Treble clef staff rendered as inline SVG, with accidental support

const LINE_SPACING = 12;
const NOTE_X    = 230;   // moved right to leave room for accidentals
const NOTE_RX   = 9;
const NOTE_RY   = 7;
const STEM_LEN  = 38;
const STAFF_LEFT = 60;
const W = 420;
const H = 130;
const BASE_Y = H - 30;   // y of bottom staff line (E4)

// Accidental glyph x offset from note head centre
const ACC_OFFSET_X = 18;

export default function Staff({ noteInfo, state = 'default', showName = false }) {
  if (!noteInfo) return null;
  const { staffPos, label, accidental } = noteInfo;

  const noteY  = BASE_Y - (staffPos * LINE_SPACING / 2);
  const stemUp = staffPos < 4;
  const stemX  = stemUp ? NOTE_X + NOTE_RX - 1 : NOTE_X - NOTE_RX + 1;
  const stemY1 = noteY + (stemUp ?  NOTE_RY * 0.4 : -NOTE_RY * 0.4);
  const stemY2 = stemUp ? noteY - STEM_LEN : noteY + STEM_LEN;

  const headColor = state === 'correct' ? 'var(--accent)'
                  : state === 'wrong'   ? 'var(--danger)'
                  : 'var(--text)';

  // Ledger lines below staff
  const ledgersBelow = [];
  if (staffPos < 0) {
    for (let lp = -2; lp >= staffPos; lp -= 2)
      ledgersBelow.push(BASE_Y - lp * LINE_SPACING / 2);
  }
  // Ledger lines above staff (F5 = staffPos 8 is top line)
  const ledgersAbove = [];
  if (staffPos > 8) {
    for (let lp = 10; lp <= staffPos; lp += 2)
      ledgersAbove.push(BASE_Y - lp * LINE_SPACING / 2);
  }

  // Accidental glyph — rendered as SVG text to the left of the note head
  const accGlyph = accidental === 'sharp' ? '♯'
                 : accidental === 'flat'  ? '♭'
                 : null;

  // Colour the accidental glyph to match the note head state
  const accColor = state === 'correct' ? 'var(--accent)'
                 : state === 'wrong'   ? 'var(--danger)'
                 : 'var(--text-2)';

  return (
    <svg
      width={W} height={H}
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* ── Staff lines ── */}
      {[0,1,2,3,4].map(i => (
        <line key={i}
          x1={STAFF_LEFT} x2={STAFF_LEFT + 310}
          y1={BASE_Y - i * LINE_SPACING}
          y2={BASE_Y - i * LINE_SPACING}
          className="staff-line"
        />
      ))}

      {/* ── Treble clef ── */}
      <text x={STAFF_LEFT + 4} y={BASE_Y + 14} className="clef-symbol">𝄞</text>

      {/* ── Ledger lines ── */}
      {ledgersBelow.map(y => (
        <line key={y} x1={NOTE_X - 14} x2={NOTE_X + 14} y1={y} y2={y} className="staff-ledger" />
      ))}
      {ledgersAbove.map(y => (
        <line key={y} x1={NOTE_X - 14} x2={NOTE_X + 14} y1={y} y2={y} className="staff-ledger" />
      ))}

      {/* ── Accidental glyph ── */}
      {accGlyph && (
        <text
          x={NOTE_X - ACC_OFFSET_X}
          y={noteY + 6}
          className="accidental-glyph"
          fill={accColor}
          style={{ transition: 'fill 150ms ease' }}
        >
          {accGlyph}
        </text>
      )}

      {/* ── Note head ── */}
      <ellipse
        cx={NOTE_X} cy={noteY}
        rx={NOTE_RX} ry={NOTE_RY}
        fill={headColor}
        transform={`rotate(-15 ${NOTE_X} ${noteY})`}
        style={{ transition: 'fill 150ms ease' }}
      />

      {/* ── Stem ── */}
      <line
        x1={stemX} y1={stemY1}
        x2={stemX} y2={stemY2}
        className="staff-stem"
      />

      {/* ── Optional note name label ── */}
      {showName && (
        <text x={NOTE_X} y={H - 6} className="note-name-label">{label}</text>
      )}
    </svg>
  );
}
