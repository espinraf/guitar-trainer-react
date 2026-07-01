/**
 * useIntervalTrainer.ts — Ear training: identify the interval between two notes.
 */

import { useState, useCallback, useRef } from 'react';
import { INTERVALS, getInterval, OPEN_STRINGS, fretToNote, findFretPositionsForMidi } from '../lib/theory';
import { playNote, playCorrect, playWrong, resumeAudio } from '../lib/audio';
import { storage } from '../lib/storage';

type Interval = { semitones: number; name: string; short: string };
type Dot = { str: number; fret: number; type: 'correct' | 'wrong' };

type IntervalQuestion = {
  interval: Interval;
  rootMidi: number;
  targetMidi: number;
  answered: boolean;
  lastResult: 'correct' | 'wrong' | null;
  correctPositions: Array<[number, number]>;
  lastClickedDot: Dot | null;
};

const MIN_MIDI = OPEN_STRINGS[0].midi;        // 40 (low E)
const MAX_MIDI = OPEN_STRINGS[5].midi + 12;   // 76 (high e, 12th fret)

const DEFAULT_INTERVAL_POOL: Interval[] = INTERVALS.filter(iv => iv.semitones > 0 && iv.semitones <= 12) as Interval[];

function randomMidi(): number {
  return MIN_MIDI + Math.floor(Math.random() * (MAX_MIDI - MIN_MIDI - 12));
}

function pickInterval(pool: Interval[], last: Interval | null): Interval {
  if (pool.length === 1) return pool[0];
  let iv: Interval | null = null;
  do { iv = pool[Math.floor(Math.random() * pool.length)]; }
  while (iv === last);
  return iv;
}

function makeQuestion(pool: Interval[], last: Interval | null, mode: 'listen' | 'find'): IntervalQuestion {
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

export function useIntervalTrainer({ mode = 'listen', intervalPool = DEFAULT_INTERVAL_POOL }: { mode?: 'listen' | 'find'; intervalPool?: Interval[] } = {}): {
  state: IntervalQuestion;
  score: number;
  attempts: number;
  correct: number;
  streak: number;
  next: () => void;
  playQuestion: () => void;
  playRoot: () => void;
  answerListen: (guessedSemitones: number) => void;
  answerFind: (str: number, fret: number) => void;
} {
  const lastIvRef = useRef<Interval | null>(null);

  const [state, setState] = useState<IntervalQuestion>(() => makeQuestion(intervalPool, null, mode));

  const [score, setScore]       = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [correct, setCorrect]   = useState<number>(0);
  const [streak, setStreak]     = useState<number>(0);

  const next = useCallback((): void => {
    const q = makeQuestion(intervalPool, lastIvRef.current, mode);
    lastIvRef.current = q.interval;
    setState(q);
  }, [intervalPool, mode]);

  const playQuestion = useCallback((): void => {
    resumeAudio();
    const { rootMidi, targetMidi } = state;
    playNote(rootMidi);
    window.setTimeout(() => playNote(targetMidi), 650);
  }, [state]);

  const playRoot = useCallback((): void => {
    resumeAudio();
    playNote(state.rootMidi);
  }, [state.rootMidi]);

  const answerListen = useCallback((guessedSemitones: number): void => {
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

  const answerFind = useCallback((str: number, fret: number): void => {
    setState(s => {
      if (s.answered) return s;
      const isCorrect = s.correctPositions.some(([cs, cf]) => cs === str && cf === fret);
      setAttempts(a => a + 1);

      const dot: Dot = { str, fret, type: isCorrect ? 'correct' : 'wrong' };

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
