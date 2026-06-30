// @ts-nocheck
/**
 * dailyChallenge.js — Deterministic daily challenge generation.
 *
 * The same calendar date always produces the same sequence of tasks,
 * using a seeded PRNG (mulberry32) seeded from the date string.
 * This means every player who opens the app on a given day gets the
 * identical challenge — important for "daily challenge" semantics.
 */

import { BEGINNER_NOTES, TREBLE_NOTES_NATURAL, findFretPositions } from './theory';
import { INTERVALS } from './theory';
import { CHROMATIC, buildScaleSet, fretToNote, OPEN_STRINGS } from './theory';

// ── Seeded PRNG (mulberry32) ───────────────────────────────────────
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Convert a date string (YYYY-MM-DD) into a 32-bit integer seed */
function seedFromDate(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/** Today's date as YYYY-MM-DD (local time) */
export function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

const SCALE_NAMES = ['major', 'minor', 'pentatonic', 'blues'];

/**
 * Generate the 10-task daily challenge for a given date string.
 * Task types:
 *   'note-read'    — staff note shown, answer is fret position(s)
 *   'interval'     — hear/see root + target, identify interval name
 *   'scale-degree' — given root + scale, identify if a note is in the scale
 */
export function generateDailyChallenge(dateStr = todayKey()) {
  const seed = seedFromDate(dateStr);
  const rng = mulberry32(seed);

  const tasks = [];
  const TASK_COUNT = 10;

  for (let i = 0; i < TASK_COUNT; i++) {
    // Weighted task type distribution: 5 note-read, 3 interval, 2 scale-degree
    const roll = rng();
    let type;
    if (roll < 0.5) type = 'note-read';
    else if (roll < 0.8) type = 'interval';
    else type = 'scale-degree';

    if (type === 'note-read') {
      const note = pick(rng, TREBLE_NOTES_NATURAL);
      tasks.push({
        id: `${dateStr}-${i}`,
        type,
        note,
        correctPositions: findFretPositions(note.note, note.octave),
      });
    } else if (type === 'interval') {
      const intervalChoices = INTERVALS.filter(iv => iv.semitones > 0 && iv.semitones <= 12);
      const interval = pick(rng, intervalChoices);
      const rootMidi = OPEN_STRINGS[0].midi + Math.floor(rng() * 24); // within 2 octaves of low E
      tasks.push({
        id: `${dateStr}-${i}`,
        type,
        interval,
        rootMidi,
        targetMidi: rootMidi + interval.semitones,
        // Build 4 answer choices: correct + 3 distractors
        choices: buildIntervalChoices(rng, interval, intervalChoices),
      });
    } else {
      // scale-degree: show a note, ask "is this note in the C major scale?" style
      const root = pick(rng, CHROMATIC);
      const scaleName = pick(rng, SCALE_NAMES);
      const scaleSet = buildScaleSet(root, scaleName);
      const str = Math.floor(rng() * 6);
      const fret = Math.floor(rng() * 12);
      const { note, midi } = fretToNote(str, fret);
      const inScale = scaleSet.has(midi % 12);
      tasks.push({
        id: `${dateStr}-${i}`,
        type,
        root, scaleName,
        str, fret, note,
        inScale,
      });
    }
  }

  return { dateStr, seed, tasks };
}

function buildIntervalChoices(rng, correct, pool) {
  const choices = [correct];
  const remaining = pool.filter(iv => iv !== correct);
  while (choices.length < 4 && remaining.length > 0) {
    const idx = Math.floor(rng() * remaining.length);
    choices.push(remaining.splice(idx, 1)[0]);
  }
  // Shuffle
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices;
}
