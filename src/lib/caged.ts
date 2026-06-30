// @ts-nocheck
/**
 * caged.js — CAGED system shape definitions for major scale + chord shapes.
 *
 * The CAGED system describes 5 overlapping fretboard patterns named after
 * the open chord shapes C, A, G, E, D. Each shape is a moveable pattern;
 * sliding it to different frets puts the chord/scale in a different key.
 *
 * Data model:
 * Each shape stores, per string (0=low E ... 5=high e), the fret OFFSETS
 * (relative to a reference fret) where scale degrees fall, using degree
 * numbers 1–7 (1=root, 3=third, 5=fifth are chord tones; others are
 * scale passing tones).
 *
 * IMPORTANT: these offset tables were generated programmatically by
 * scanning the real fretboard for major-scale notes around each shape's
 * anchor position (not hand-typed), then verified against 6 different
 * root notes to confirm every degree-1 cell lands on the correct root
 * note. See the project's dev notes for the generation script.
 *
 * To use a shape for a given root: compute
 *   refFret = (rootNoteIndex - anchorOpenNoteIndex + 12) % 12
 * then absoluteFret = refFret + offset, for every cell in the shape.
 */

import { CHROMATIC } from './theory';

export const CAGED_ORDER = ['C', 'A', 'G', 'E', 'D'];

const SHAPE_DEFS = {
  C: {
    anchorOpenNote: 'A',
    frets: {
      0: [{ o: -3, d: 3 }, { o: -2, d: 4 }, { o: 0, d: 5 }, { o: 2, d: 6 }],
      1: [{ o: -3, d: 6 }, { o: -1, d: 7 }, { o: 0, d: 1 }, { o: 2, d: 2 }],
      2: [{ o: -3, d: 2 }, { o: -1, d: 3 }, { o: 0, d: 4 }, { o: 2, d: 5 }],
      3: [{ o: -3, d: 5 }, { o: -1, d: 6 }, { o: 1, d: 7 }, { o: 2, d: 1 }],
      4: [{ o: -3, d: 7 }, { o: -2, d: 1 }, { o: 0, d: 2 }, { o: 2, d: 3 }, { o: 3, d: 4 }],
      5: [{ o: -3, d: 3 }, { o: -2, d: 4 }, { o: 0, d: 5 }, { o: 2, d: 6 }],
    },
  },
  A: {
    anchorOpenNote: 'A',
    frets: {
      0: [{ o: 0, d: 5 }, { o: 2, d: 6 }, { o: 4, d: 7 }, { o: 5, d: 1 }],
      1: [{ o: -1, d: 7 }, { o: 0, d: 1 }, { o: 2, d: 2 }, { o: 4, d: 3 }, { o: 5, d: 4 }],
      2: [{ o: -1, d: 3 }, { o: 0, d: 4 }, { o: 2, d: 5 }, { o: 4, d: 6 }],
      3: [{ o: -1, d: 6 }, { o: 1, d: 7 }, { o: 2, d: 1 }, { o: 4, d: 2 }],
      4: [{ o: 0, d: 2 }, { o: 2, d: 3 }, { o: 3, d: 4 }, { o: 5, d: 5 }],
      5: [{ o: 0, d: 5 }, { o: 2, d: 6 }, { o: 4, d: 7 }, { o: 5, d: 1 }],
    },
  },
  G: {
    anchorOpenNote: 'E',
    frets: {
      0: [{ o: -3, d: 6 }, { o: -1, d: 7 }, { o: 0, d: 1 }, { o: 2, d: 2 }, { o: 4, d: 3 }],
      1: [{ o: -3, d: 2 }, { o: -1, d: 3 }, { o: 0, d: 4 }, { o: 2, d: 5 }, { o: 4, d: 6 }],
      2: [{ o: -3, d: 5 }, { o: -1, d: 6 }, { o: 1, d: 7 }, { o: 2, d: 1 }, { o: 4, d: 2 }],
      3: [{ o: -4, d: 7 }, { o: -3, d: 1 }, { o: -1, d: 2 }, { o: 1, d: 3 }, { o: 2, d: 4 }, { o: 4, d: 5 }],
      4: [{ o: -3, d: 3 }, { o: -2, d: 4 }, { o: 0, d: 5 }, { o: 2, d: 6 }, { o: 4, d: 7 }],
      5: [{ o: -3, d: 6 }, { o: -1, d: 7 }, { o: 0, d: 1 }, { o: 2, d: 2 }, { o: 4, d: 3 }],
    },
  },
  E: {
    anchorOpenNote: 'E',
    frets: {
      0: [{ o: -1, d: 7 }, { o: 0, d: 1 }, { o: 2, d: 2 }, { o: 4, d: 3 }, { o: 5, d: 4 }],
      1: [{ o: -1, d: 3 }, { o: 0, d: 4 }, { o: 2, d: 5 }, { o: 4, d: 6 }],
      2: [{ o: -1, d: 6 }, { o: 1, d: 7 }, { o: 2, d: 1 }, { o: 4, d: 2 }],
      3: [{ o: -1, d: 2 }, { o: 1, d: 3 }, { o: 2, d: 4 }, { o: 4, d: 5 }],
      4: [{ o: 0, d: 5 }, { o: 2, d: 6 }, { o: 4, d: 7 }, { o: 5, d: 1 }],
      5: [{ o: -1, d: 7 }, { o: 0, d: 1 }, { o: 2, d: 2 }, { o: 4, d: 3 }, { o: 5, d: 4 }],
    },
  },
  D: {
    anchorOpenNote: 'D',
    frets: {
      0: [{ o: 0, d: 2 }, { o: 2, d: 3 }, { o: 3, d: 4 }, { o: 5, d: 5 }],
      1: [{ o: 0, d: 5 }, { o: 2, d: 6 }, { o: 4, d: 7 }, { o: 5, d: 1 }],
      2: [{ o: -1, d: 7 }, { o: 0, d: 1 }, { o: 2, d: 2 }, { o: 4, d: 3 }, { o: 5, d: 4 }],
      3: [{ o: -1, d: 3 }, { o: 0, d: 4 }, { o: 2, d: 5 }, { o: 4, d: 6 }],
      4: [{ o: 0, d: 6 }, { o: 2, d: 7 }, { o: 3, d: 1 }, { o: 5, d: 2 }],
      5: [{ o: 0, d: 2 }, { o: 2, d: 3 }, { o: 3, d: 4 }, { o: 5, d: 5 }],
    },
  },
};

const CHORD_TONE_DEGREES = new Set([1, 3, 5]);

function computeReferenceFret(shapeKey, rootNote) {
  const shape = SHAPE_DEFS[shapeKey];
  const openIdx = CHROMATIC.indexOf(shape.anchorOpenNote);
  const rootIdx = CHROMATIC.indexOf(rootNote);
  return (rootIdx - openIdx + 12) % 12;
}

/**
 * Build absolute fretboard positions for a CAGED shape in a given root key.
 * Returns array of { str, fret, degree, isRoot, isChordTone }
 */
export function buildCagedShape(shapeKey, rootNote, maxFret = 15) {
  const shape = SHAPE_DEFS[shapeKey];
  const refFret = computeReferenceFret(shapeKey, rootNote);

  const positions = [];
  for (let s = 0; s < 6; s++) {
    const cells = shape.frets[s] || [];
    for (const { o, d } of cells) {
      const fret = refFret + o;
      if (fret < 0 || fret > maxFret) continue;
      positions.push({
        str: s,
        fret,
        degree: d,
        isRoot: d === 1,
        isChordTone: CHORD_TONE_DEGREES.has(d),
      });
    }
  }
  return positions;
}

export function getShapeMinFret(shapeKey, rootNote) {
  const positions = buildCagedShape(shapeKey, rootNote, 24);
  if (positions.length === 0) return 0;
  return Math.min(...positions.map(p => p.fret));
}

export function getOrderedShapes(rootNote) {
  return CAGED_ORDER
    .map(key => ({ key, minFret: getShapeMinFret(key, rootNote) }))
    .sort((a, b) => a.minFret - b.minFret);
}
