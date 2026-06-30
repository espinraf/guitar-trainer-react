/**
 * useIntervalTrainer.ts — Ear training: identify the interval between two notes.
 */

import { useState, useCallback, useRef } from 'react';
import { INTERVALS, getInterval, OPEN_STRINGS, fretToNote, findFretPositionsForMidi } from '../lib/theory';
import { playNote, playCorrect, playWrong, resumeAudio } from '../lib/audio';
import { storage } from '../lib/storage';

const MIN_MIDI = OPEN_STRINGS[0].midi;        // 40 (low E)
const MAX_MIDI = OPEN_STRINGS[5].midi + 12;   // 76 (high e, 12th fret)

const DEFAULT_INTERVAL_POOL = INTERVALS.filter(iv => iv.semitones > 0 && iv.semitones <= 12);

function randomMidi() {
  return MIN_MIDI + Math.floor(Math.random() * (MAX_MIDI - MIN_MIDI - 12));
}

function pickInterval(pool, last) {
  if (pool.length === 1) return pool[0];
  let iv;
  do { iv = pool[Math.floor(Math.random() * pool.length)]; }
  while (iv === last);
  return iv;
}

export function useIntervalTrainer({ mode = 'listen', intervalPool = DEFAULT_INTERVAL_POOL }: { mode?: string; intervalPool?: any } = {}): any {
  const lastIvRef = useRef(null);

  const [state, setState] = useState(() => makeQuestion(intervalPool, null, mode));

  const [score, setScore]       = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect]   = useState(0);
  const [streak, setStreak]     = useState(0);

  function makeQuestion(pool, last, mode) {
    const interval = pickInterval(pool, last);
    const rootMidi = randomMidi();
    const targetMidi = rootMidi + interval.semitones;

    return {
      interval,
      rootMidi,
      targetMidi,
      answered: false,
      lastResult: null,
      correctPositions: mode === 'find' ? findFretPositionsForMidi(targetMidi) : [],
      lastClickedDot: null,
    };
  }

  const next = useCallback(() => {
    const q = makeQuestion(intervalPool, lastIvRef.current, mode);
    lastIvRef.current = q.interval;
    setState(q);
  }, [intervalPool, mode]);

  const playQuestion = useCallback(() => {
    resumeAudio();
    const { rootMidi, targetMidi } = state;
    playNote(rootMidi);
    setTimeout(() => playNote(targetMidi), 650);
  }, [state]);

  const playRoot = useCallback(() => {
    resumeAudio();
    playNote(state.rootMidi);
  }, [state.rootMidi]);

  const answerListen = useCallback((guessedSemitones) => {
    setState(s => {
      if (s.answered) return s;
      const isCorrect = guessedSemitones === s.interval.semitones;
      setAttempts(a => a + 1);

      if (isCorrect) {
        setCorrect(c => c + 1);
        setStreak(st => st + 1);
        setScore(sc => sc + Math.max(1, streak + 1));
        playCorrect();
        storage.logNote(`interval:${s.interval.short}`, true);
      } else {
        setStreak(0);
        playWrong();
        storage.logNote(`interval:${s.interval.short}`, false);
      }

      return { ...s, answered: true, lastResult: isCorrect ? 'correct' : 'wrong' };
    });
  }, [streak]);

  const answerFind = useCallback((str, fret) => {
    setState(s => {
      if (s.answered) return s;
      const isCorrect = s.correctPositions.some(([cs, cf]) => cs === str && cf === fret);
      setAttempts(a => a + 1);

      const dot = { str, fret, type: isCorrect ? 'correct' : 'wrong' };

      if (isCorrect) {
        setCorrect(c => c + 1);
        setStreak(st => st + 1);
        setScore(sc => sc + Math.max(1, streak + 1));
        playCorrect();
        storage.logNote(`interval:${s.interval.short}`, true);
        return { ...s, answered: true, lastResult: 'correct', lastClickedDot: dot };
      } else {
        setStreak(0);
        playWrong();
        storage.logNote(`interval:${s.interval.short}`, false);
        return { ...s, lastResult: 'wrong', lastClickedDot: dot };
      }
    });
  }, [streak]);

  return {
    state,
    score, attempts, correct, streak,
    next,
    playQuestion,
    playRoot,
    answerListen,
    answerFind,
  };
}

export { DEFAULT_INTERVAL_POOL };
