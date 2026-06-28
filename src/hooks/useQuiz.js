import { useState, useCallback, useRef } from 'react';
import { buildNotePool, findFretPositions, noteToMidi, CHROMATIC } from '../lib/theory';
import { playCorrect, playWrong } from '../lib/audio';
import { storage } from '../lib/storage';

const DAILY_GOAL = parseInt(storage.get('dailyGoal') || 20);

function pickFrom(pool, last) {
  if (pool.length === 1) return pool[0];
  let note;
  do { note = pool[Math.floor(Math.random() * pool.length)]; }
  while (note === last);
  return note;
}

export function useQuiz({ position = 'open', noteSet = 'natural', soundOn = true } = {}) {
  const pool = buildNotePool(noteSet, position);
  const lastNoteRef = useRef(null);

  const [state, setState] = useState(() => {
    const note = pickFrom(pool, null);
    return {
      note,
      correctPositions: findFretPositions(note.note, note.octave),
      score: 0,
      attempts: 0,
      correct: 0,
      streak: 0,
      answered: 0,
      dailyGoal: DAILY_GOAL,
      answeredOk: false,
      hintShown: false,
      lastClickedDot: null,   // { str, fret, type }
      feedback: { text: 'Click the correct fret on the fretboard', kind: 'idle' },
    };
  });

  const next = useCallback(() => {
    const note = pickFrom(pool, lastNoteRef.current);
    lastNoteRef.current = note;
    setState(s => ({
      ...s,
      note,
      correctPositions: findFretPositions(note.note, note.octave),
      answeredOk: false,
      hintShown: false,
      lastClickedDot: null,
      feedback: { text: 'Click the correct fret on the fretboard', kind: 'idle' },
    }));
  }, [pool]);

  const skip = useCallback(() => {
    setState(s => {
      storage.logNote(s.note.label, false);
      return { ...s, streak: 0 };
    });
    next();
  }, [next]);

  const hint = useCallback(() => {
    setState(s => {
      if (s.answeredOk || s.hintShown) return s;
      const [str, fret] = s.correctPositions[0] || [];
      return {
        ...s,
        hintShown: true,
        lastClickedDot: str !== undefined ? { str, fret, type: 'hint' } : null,
        feedback: { text: 'Hint: the highlighted fret is one correct answer', kind: 'idle' },
      };
    });
  }, []);

  const answer = useCallback((str, fret) => {
    setState(s => {
      if (s.answeredOk) return s; // ignore clicks after correct

      const isCorrect = s.correctPositions.some(([cs, cf]) => cs === str && cf === fret);
      const attempts = s.attempts + 1;

      if (isCorrect) {
        const streak = s.streak + 1;
        const bonus = s.hintShown ? 1 : Math.max(1, streak);
        if (soundOn) playCorrect();
        storage.logNote(s.note.label, true);
        return {
          ...s,
          attempts,
          correct: s.correct + 1,
          streak,
          answered: s.answered + 1,
          score: s.score + bonus,
          answeredOk: true,
          lastClickedDot: { str, fret, type: 'correct' },
          feedback: { text: `✓ Correct! That's ${s.note.label}.`, kind: 'correct' },
        };
      } else {
        if (soundOn) playWrong();
        storage.logNote(s.note.label, false);
        return {
          ...s,
          attempts,
          streak: 0,
          lastClickedDot: { str, fret, type: 'wrong' },
          feedback: { text: '✗ Not quite — try again or skip', kind: 'wrong' },
        };
      }
    });
  }, [soundOn]);

  const setDailyGoal = useCallback((n) => {
    storage.set('dailyGoal', n);
    setState(s => ({ ...s, dailyGoal: n }));
  }, []);

  /**
   * Answer via MIDI note number.
   * octaveStrict: if true, require exact octave match.
   *              if false, match on pitch class only (more forgiving for MIDI guitars).
   * Returns the best-matching [str, fret] for the dot highlight, or null.
   */
  const answerByMidi = useCallback((midiNumber, octaveStrict = false) => {
    setState(s => {
      if (s.answeredOk) return s;

      const incomingClass = midiNumber % 12;
      const targetMidi    = noteToMidi(s.note.note, s.note.octave);
      const targetClass   = targetMidi % 12;

      const isCorrect = octaveStrict
        ? midiNumber === targetMidi
        : incomingClass === targetClass;

      const attempts = s.attempts + 1;

      // Find best fret position to highlight (closest to open position)
      const bestPos = s.correctPositions[0] ?? null;
      const dot = bestPos
        ? { str: bestPos[0], fret: bestPos[1], type: isCorrect ? 'correct' : 'wrong' }
        : null;

      if (isCorrect) {
        const streak = s.streak + 1;
        const bonus  = s.hintShown ? 1 : Math.max(1, streak);
        if (soundOn) playCorrect();
        storage.logNote(s.note.label, true);
        return {
          ...s, attempts,
          correct: s.correct + 1, streak,
          answered: s.answered + 1,
          score: s.score + bonus,
          answeredOk: true,
          lastClickedDot: dot,
          feedback: { text: `✓ Correct! That's ${s.note.label}.`, kind: 'correct' },
        };
      } else {
        const incomingName = CHROMATIC[incomingClass];
        if (soundOn) playWrong();
        storage.logNote(s.note.label, false);
        return {
          ...s, attempts, streak: 0,
          lastClickedDot: dot,
          feedback: { text: `✗ You played ${incomingName} — try again`, kind: 'wrong' },
        };
      }
    });
  }, [soundOn]);

  return { state, answer, answerByMidi, next, skip, hint, setDailyGoal };
}
