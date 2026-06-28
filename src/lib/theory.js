// ── Chromatic / enharmonic ────────────────────────────────────────
export const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

export const ENHARMONIC = {
  'C#':'Db','D#':'Eb','F#':'Gb','G#':'Ab','A#':'Bb',
  'Db':'C#','Eb':'D#','Gb':'F#','Ab':'G#','Bb':'A#',
};

// Standard tuning: string 0 = low E, string 5 = high e
export const OPEN_STRINGS = [
  { note:'E', octave:2, midi:40 },
  { note:'A', octave:2, midi:45 },
  { note:'D', octave:3, midi:50 },
  { note:'G', octave:3, midi:55 },
  { note:'B', octave:3, midi:59 },
  { note:'E', octave:4, midi:64 },
];

export const STRING_LABELS = ['E','A','D','G','B','e'];

export function fretToNote(str, fret) {
  const base = OPEN_STRINGS[str];
  const midi = base.midi + fret;
  const note = CHROMATIC[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return { note, octave, midi };
}

export function noteToMidi(note, octave) {
  return CHROMATIC.indexOf(note) + (octave + 1) * 12;
}

export function findFretPositions(note, octave, maxFret = 15) {
  const targetMidi = noteToMidi(note, octave);
  const enh = ENHARMONIC[note];
  const targetMidi2 = enh ? noteToMidi(enh, octave) : null;
  const positions = [];
  for (let s = 0; s < 6; s++) {
    for (let f = 0; f <= maxFret; f++) {
      const { midi } = fretToNote(s, f);
      if (midi === targetMidi || midi === targetMidi2) positions.push([s, f]);
    }
  }
  return positions;
}

// ── Treble clef note pool ─────────────────────────────────────────
// staffPos: 0 = bottom line (E4). Each +1 = one diatonic step (line → space → line…)
// accidental: 'sharp' | 'flat' | undefined
// Sharps/flats share the staffPos of their diatonic neighbor:
//   C# sits on the C line/space, Db sits on the D line/space, etc.

export const TREBLE_NOTES_NATURAL = [
  { note:'C', octave:4, staffPos:-2, label:'C4' },
  { note:'D', octave:4, staffPos:-1, label:'D4' },
  { note:'E', octave:4, staffPos: 0, label:'E4' },
  { note:'F', octave:4, staffPos: 1, label:'F4' },
  { note:'G', octave:4, staffPos: 2, label:'G4' },
  { note:'A', octave:4, staffPos: 3, label:'A4' },
  { note:'B', octave:4, staffPos: 4, label:'B4' },
  { note:'C', octave:5, staffPos: 5, label:'C5' },
  { note:'D', octave:5, staffPos: 6, label:'D5' },
  { note:'E', octave:5, staffPos: 7, label:'E5' },
  { note:'F', octave:5, staffPos: 8, label:'F5' },
  { note:'G', octave:5, staffPos: 9, label:'G5' },
];

// Sharps — written on the same staff position as the natural below
// C# → C's staffPos, D# → D's staffPos, etc.
export const TREBLE_NOTES_SHARP = [
  { note:'C#', octave:4, staffPos:-2, label:'C#4', accidental:'sharp' },
  { note:'D#', octave:4, staffPos:-1, label:'D#4', accidental:'sharp' },
  { note:'F#', octave:4, staffPos: 1, label:'F#4', accidental:'sharp' },
  { note:'G#', octave:4, staffPos: 2, label:'G#4', accidental:'sharp' },
  { note:'A#', octave:4, staffPos: 3, label:'A#4', accidental:'sharp' },
  { note:'C#', octave:5, staffPos: 5, label:'C#5', accidental:'sharp' },
  { note:'D#', octave:5, staffPos: 6, label:'D#5', accidental:'sharp' },
  { note:'F#', octave:5, staffPos: 8, label:'F#5', accidental:'sharp' },
  { note:'G#', octave:5, staffPos: 9, label:'G#5', accidental:'sharp' },
];

// Flats — written on the same staff position as the natural above
// Db → D's staffPos, Eb → E's staffPos, etc.
export const TREBLE_NOTES_FLAT = [
  { note:'Db', octave:4, staffPos:-1, label:'Db4', accidental:'flat' },
  { note:'Eb', octave:4, staffPos: 0, label:'Eb4', accidental:'flat' },
  { note:'Gb', octave:4, staffPos: 2, label:'Gb4', accidental:'flat' },
  { note:'Ab', octave:4, staffPos: 3, label:'Ab4', accidental:'flat' },
  { note:'Bb', octave:4, staffPos: 4, label:'Bb4', accidental:'flat' },
  { note:'Db', octave:5, staffPos: 6, label:'Db5', accidental:'flat' },
  { note:'Eb', octave:5, staffPos: 7, label:'Eb5', accidental:'flat' },
  { note:'Gb', octave:5, staffPos: 9, label:'Gb5', accidental:'flat' },
  { note:'Ab', octave:5, staffPos:10, label:'Ab5', accidental:'flat' },
  { note:'Bb', octave:5, staffPos:11, label:'Bb5', accidental:'flat' },
];

// Legacy alias — all natural notes (used by fretboard explorer etc.)
export const TREBLE_NOTES = TREBLE_NOTES_NATURAL;

// Beginner pool: open position natural notes only (E4–F5)
export const BEGINNER_NOTES = TREBLE_NOTES_NATURAL.filter(
  n => n.staffPos >= 0 && n.staffPos <= 8
);

/**
 * Build a quiz note pool from a noteSet option.
 * noteSet: 'natural' | 'sharps' | 'flats' | 'all'
 * position: 'open' | 'all'
 */
export function buildNotePool(noteSet = 'natural', position = 'open') {
  const inRange = position === 'open'
    ? n => n.staffPos >= 0 && n.staffPos <= 8
    : () => true;

  switch (noteSet) {
    case 'sharps':
      return [
        ...TREBLE_NOTES_NATURAL.filter(inRange),
        ...TREBLE_NOTES_SHARP.filter(inRange),
      ];
    case 'flats':
      return [
        ...TREBLE_NOTES_NATURAL.filter(inRange),
        ...TREBLE_NOTES_FLAT.filter(inRange),
      ];
    case 'all':
      return [
        ...TREBLE_NOTES_NATURAL.filter(inRange),
        ...TREBLE_NOTES_SHARP.filter(inRange),
        ...TREBLE_NOTES_FLAT.filter(inRange),
      ];
    default: // 'natural'
      return position === 'open' ? BEGINNER_NOTES : TREBLE_NOTES_NATURAL;
  }
}

// ── Scales ────────────────────────────────────────────────────────
export const SCALES = {
  major:      [0,2,4,5,7,9,11],
  minor:      [0,2,3,5,7,8,10],
  pentatonic: [0,3,5,7,10],
  blues:      [0,3,5,6,7,10],
};

export function buildScaleSet(rootNote, scaleName) {
  const rootIdx = CHROMATIC.indexOf(rootNote);
  return new Set((SCALES[scaleName] || []).map(i => (rootIdx + i) % 12));
}

export function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
