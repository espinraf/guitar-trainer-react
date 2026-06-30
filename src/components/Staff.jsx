// Staff.jsx — Treble clef staff rendered as inline SVG.
//
// The treble clef is rendered as an SVG <text> using the Bravura music font
// (loaded in index.html). Bravura is a proper SMuFL font — the glyph is
// perfectly sized and positioned. Falls back to Times New Roman / serif,
// which also renders U+1D11E correctly on all major platforms.
//
// Key insight for correct sizing:
//   In Bravura, 1 staff space = 250 font units (at 1000 UPM).
//   We want 1 staff space = LINE_SPACING px.
//   So font-size = (LINE_SPACING / 250) * 1000 = LINE_SPACING * 4 px.
//   At LINE_SPACING=12: font-size = 48px.
//
//   The glyph's baseline (y=0 in font coords) sits on the first ledger line
//   below the staff (middle C line). The G-curl wraps the second staff line.
//   So we anchor y = BASE_Y + LINE_SPACING * 2  (two spaces below bottom line).

const LINE_SPACING  = 12;
const NOTE_X        = 230;
const NOTE_RX       = 9;
const NOTE_RY       = 7;
const STEM_LEN      = 38;
const STAFF_LEFT    = 68;
const W             = 420;
const H             = 140;
const BASE_Y        = H - 32;    // y of bottom staff line (E4)
const ACC_OFFSET_X  = 20;

// Bravura/SMuFL clef sizing
const CLEF_FONT_SIZE = LINE_SPACING * 4;            // 48px — 1 staff space in font units
const CLEF_X         = STAFF_LEFT + 1;
const CLEF_Y         = BASE_Y + LINE_SPACING * 2;   // baseline anchor (middle-C ledger line)

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

  const ledgersBelow = [];
  if (staffPos < 0) {
    for (let lp = -2; lp >= staffPos; lp -= 2)
      ledgersBelow.push(BASE_Y - lp * LINE_SPACING / 2);
  }
  const ledgersAbove = [];
  if (staffPos > 8) {
    for (let lp = 10; lp <= staffPos; lp += 2)
      ledgersAbove.push(BASE_Y - lp * LINE_SPACING / 2);
  }

  const accGlyph = accidental === 'sharp' ? '♯'
                 : accidental === 'flat'  ? '♭'
                 : null;
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
          x1={STAFF_LEFT} x2={STAFF_LEFT + 308}
          y1={BASE_Y - i * LINE_SPACING}
          y2={BASE_Y - i * LINE_SPACING}
          className="staff-line"
        />
      ))}

      {/* ── Treble clef ──
            font-family tries Bravura first (loaded in index.html),
            then falls back to serif (Times New Roman renders 𝄞 fine).
            font-size is calibrated so 1 staff space = LINE_SPACING px.
      ── */}
      <text
        x={CLEF_X}
        y={CLEF_Y}
        fontSize={CLEF_FONT_SIZE}
        fontFamily="Bravura, 'Times New Roman', serif"
        fill="var(--text-2)"
        style={{ userSelect: 'none' }}
      >
        {'\u{1D11E}'}
      </text>

      {/* ── Ledger lines ── */}
      {ledgersBelow.map(y => (
        <line key={y} x1={NOTE_X - 14} x2={NOTE_X + 14} y1={y} y2={y} className="staff-ledger" />
      ))}
      {ledgersAbove.map(y => (
        <line key={y} x1={NOTE_X - 14} x2={NOTE_X + 14} y1={y} y2={y} className="staff-ledger" />
      ))}

      {/* ── Accidental ── */}
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

      {/* ── Note name ── */}
      {showName && (
        <text x={NOTE_X} y={H - 4} className="note-name-label">{label}</text>
      )}
    </svg>
  );
}
