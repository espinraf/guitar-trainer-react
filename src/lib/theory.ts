// Typed theory utilities for fretboard, notes, scales, intervals

export const CHROMATIC: string[] = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
export const ENHARMONIC: Record<string,string> = {
  'C#':'Db','D#':'Eb','F#':'Gb','G#':'Ab','A#':'Bb',
  'Db':'C#','Eb':'D#','Gb':'F#','Ab':'G#','Bb':'A#',
};

export type OpenString = { note: string; octave: number; midi: number };
export const OPEN_STRINGS: OpenString[] = [
  { note:'E', octave:2, midi:40 },
  { note:'A', octave:2, midi:45 },
  { note:'D', octave:3, midi:50 },
  { note:'G', octave:3, midi:55 },
  { note:'B', octave:3, midi:59 },
  { note:'E', octave:4, midi:64 },
];

export const STRING_LABELS: string[] = ['E','A','D','G','B','e'];

export function fretToNote(str: number, fret: number): { note: string; octave: number; midi: number } {
  const base = OPEN_STRINGS[str];
  const midi = base.midi + fret;
  const note = CHROMATIC[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return { note, octave, midi };
}

export function noteToMidi(note: string, octave: number): number {
  return CHROMATIC.indexOf(note) + (octave + 1) * 12;
}

export function findFretPositions(note: string, octave: number, maxFret = 15): Array<[number, number]> {
  const targetMidi = noteToMidi(note, octave);
  const enh = ENHARMONIC[note];
  const targetMidi2 = enh ? noteToMidi(enh, octave) : null;
  const positions: Array<[number, number]> = [];
  for (let s = 0; s < 6; s++) {
    for (let f = 0; f <= maxFret; f++) {
      const { midi } = fretToNote(s, f);
      if (midi === targetMidi || midi === targetMidi2) positions.push([s, f]);
    }
  }
  return positions;
}

export type TrebleNote = { note: string; octave: number; staffPos: number; label: string; accidental?: 'sharp' | 'flat' };

export const TREBLE_NOTES_NATURAL: TrebleNote[] = [
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

export const TREBLE_NOTES_SHARP: TrebleNote[] = [
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

export const TREBLE_NOTES_FLAT: TrebleNote[] = [
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

export const TREBLE_NOTES = TREBLE_NOTES_NATURAL;
export const BEGINNER_NOTES = TREBLE_NOTES_NATURAL.filter(n => n.staffPos >= 0 && n.staffPos <= 8);

export function buildNotePool(noteSet: 'natural' | 'sharps' | 'flats' | 'all' = 'natural', position: 'open' | 'all' = 'open'): TrebleNote[] {
  const inRange = position === 'open' ? (n: TrebleNote) => n.staffPos >= 0 && n.staffPos <= 8 : () => true;
  switch (noteSet) {
    case 'sharps':
      return [...TREBLE_NOTES_NATURAL.filter(inRange), ...TREBLE_NOTES_SHARP.filter(inRange)];
    case 'flats':
      return [...TREBLE_NOTES_NATURAL.filter(inRange), ...TREBLE_NOTES_FLAT.filter(inRange)];
    case 'all':
      return [...TREBLE_NOTES_NATURAL.filter(inRange), ...TREBLE_NOTES_SHARP.filter(inRange), ...TREBLE_NOTES_FLAT.filter(inRange)];
    default:
      return position === 'open' ? BEGINNER_NOTES : TREBLE_NOTES_NATURAL;
  }
}

export const SCALES: Record<string, number[]> = {
  major:      [0,2,4,5,7,9,11],
  minor:      [0,2,3,5,7,8,10],
  pentatonic: [0,3,5,7,10],
  blues:      [0,3,5,6,7,10],
};

export function buildScaleSet(rootNote: string, scaleName: string): Set<number> {
  const rootIdx = CHROMATIC.indexOf(rootNote);
  return new Set((SCALES[scaleName] || []).map(i => (rootIdx + i) % 12));
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function buildScaleSequence(
  rootNote: string,
  scaleName: string,
  position: { minFret: number; maxFret: number },
  direction: 'asc' | 'desc' | 'both' = 'asc'
): Array<{ str: number; fret: number; midi: number; note: string }> {
  const scaleSet = buildScaleSet(rootNote, scaleName);
  const { minFret, maxFret } = position;
  const notes: Array<{ str: number; fret: number; midi: number; note: string }> = [];
  for (let s = 5; s >= 0; s--) {
    for (let f = minFret; f <= maxFret; f++) {
      const { note, midi } = fretToNote(s, f);
      if (scaleSet.has(midi % 12)) {
        if (!notes.find(n => n.midi === midi)) notes.push({ str: s, fret: f, midi, note });
      }
    }
  }
  notes.sort((a, b) => a.midi - b.midi);
  if (direction === 'desc') return [...notes].reverse();
  if (direction === 'both') return [...notes, ...[...notes].reverse()];
  return notes;
}

export const SCALE_POSITIONS = [
  { label: 'Open (0–4)',  minFret: 0,  maxFret: 4  },
  { label: 'Pos 2 (2–6)', minFret: 2,  maxFret: 6  },
  { label: 'Pos 4 (4–8)', minFret: 4,  maxFret: 8  },
  { label: 'Pos 5 (5–9)', minFret: 5,  maxFret: 9  },
  { label: 'Pos 7 (7–11)',minFret: 7,  maxFret: 11 },
  { label: 'Pos 9 (9–13)',minFret: 9,  maxFret: 13 },
  { label: 'Full neck',   minFret: 0,  maxFret: 15 },
];

export const INTERVALS: Array<{ semitones: number; name: string; short: string }> = [
  { semitones: 0,  name: 'Unison',         short: 'P1'  },
  { semitones: 1,  name: 'Minor 2nd',      short: 'm2'  },
  { semitones: 2,  name: 'Major 2nd',      short: 'M2'  },
  { semitones: 3,  name: 'Minor 3rd',      short: 'm3'  },
  { semitones: 4,  name: 'Major 3rd',      short: 'M3'  },
  { semitones: 5,  name: 'Perfect 4th',    short: 'P4'  },
  { semitones: 6,  name: 'Tritone',        short: 'TT'  },
  { semitones: 7,  name: 'Perfect 5th',    short: 'P5'  },
  { semitones: 8,  name: 'Minor 6th',      short: 'm6'  },
  { semitones: 9,  name: 'Major 6th',      short: 'M6'  },
  { semitones: 10, name: 'Minor 7th',      short: 'm7'  },
  { semitones: 11, name: 'Major 7th',      short: 'M7'  },
  { semitones: 12, name: 'Octave',         short: 'P8'  },
];

export function getInterval(semitones: number) {
  const norm = ((semitones % 12) + 12) % 12;
  return INTERVALS.find(iv => iv.semitones === norm) || INTERVALS[0];
}

export function findFretPositionsForMidi(midi: number, maxFret = 15): Array<[number, number]> {
  const positions: Array<[number, number]> = [];
  for (let s = 0; s < 6; s++) {
    for (let f = 0; f <= maxFret; f++) {
      const pos = fretToNote(s, f);
      if (pos.midi === midi) positions.push([s, f]);
    }
  }
  return positions;
}
