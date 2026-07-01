/**
 * useDailyChallenge.ts — Runtime state for the daily challenge.
 */

import { useState, useCallback, useMemo } from 'react';
import { generateDailyChallenge, todayKey } from '../lib/dailyChallenge';
import { fretToNote } from '../lib/theory';
import { playCorrect, playWrong, playNote, resumeAudio } from '../lib/audio';
import { storage } from '../lib/storage';

type DailyAnswer = { taskId: string; correct: boolean };
type Dot = { str: number; fret: number; type: 'correct' | 'wrong' } | null;

type Phase = 'intro' | 'running' | 'results';

type DailyChallengeHook = {
  dateStr: string;
  phase: Phase;
  challenge: any;
  currentTask: any;
  taskIndex: number;
  totalTasks: number;
  answers: DailyAnswer[];
  answered: boolean;
  lastResult: 'correct' | 'wrong' | null;
  lastDot: Dot;
  streak: number;
  bestStreak: number;
  finalResult: any;
  start: () => void;
  nextTask: () => any;
  answerNoteRead: (str: number, fret: number) => void;
  answerInterval: (semitones: number) => void;
  answerScaleDegree: (guessYes: boolean) => void;
  playIntervalQuestion: () => void;
  playScaleNote: () => void;
};

export function useDailyChallenge(): DailyChallengeHook {
  const dateStr = todayKey();
  const challenge = useMemo(() => generateDailyChallenge(dateStr), [dateStr]);

  const existingResult = storage.getDailyChallengeResult(dateStr);
  const { streak, bestStreak } = storage.getChallengeStreak();

  const [phase, setPhase] = useState<Phase>(existingResult ? 'results' : 'intro');
  const [taskIndex, setTaskIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<DailyAnswer[]>([]);     // [{ taskId, correct }]
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | null>(null); // 'correct' | 'wrong' | null
  const [lastDot, setLastDot] = useState<Dot>(null);
  const [answered, setAnswered] = useState<boolean>(false);

  const currentTask = challenge.tasks[taskIndex];
  const totalTasks   = challenge.tasks.length;

  const start = useCallback((): void => {
    resumeAudio();
    setPhase('running');
    setTaskIndex(0);
    setAnswers([]);
    setAnswered(false);
    setLastResult(null);
    setLastDot(null);
  }, []);

  const recordAnswer = useCallback((isCorrect: boolean, dot: Dot = null): void => {
    if (answered) return;
    setAnswered(true);
    setLastResult(isCorrect ? 'correct' : 'wrong');
    setLastDot(dot);
    if (isCorrect) playCorrect(); else playWrong();
    setAnswers(prev => [...prev, { taskId: currentTask.id, correct: isCorrect }]);
  }, [answered, currentTask]);

  const answerNoteRead = useCallback((str: number, fret: number): void => {
    if (answered || currentTask.type !== 'note-read') return;
    const isCorrect = currentTask.correctPositions.some(([s, f]) => s === str && f === fret);
    recordAnswer(isCorrect, { str, fret, type: isCorrect ? 'correct' : 'wrong' });
  }, [answered, currentTask, recordAnswer]);

  const answerInterval = useCallback((semitones: number): void => {
    if (answered || currentTask.type !== 'interval') return;
    recordAnswer(semitones === currentTask.interval.semitones);
  }, [answered, currentTask, recordAnswer]);

  const answerScaleDegree = useCallback((guessYes: boolean): void => {
    if (answered || currentTask.type !== 'scale-degree') return;
    recordAnswer(guessYes === currentTask.inScale);
  }, [answered, currentTask, recordAnswer]);

  const playIntervalQuestion = useCallback((): void => {
    if (currentTask?.type !== 'interval') return;
    resumeAudio();
    playNote(currentTask.rootMidi);
    setTimeout(() => playNote(currentTask.targetMidi), 650);
  }, [currentTask]);

  const playScaleNote = useCallback((): void => {
    if (currentTask?.type !== 'scale-degree') return;
    resumeAudio();
    const { midi } = fretToNote(currentTask.str, currentTask.fret);
    playNote(midi);
  }, [currentTask]);

  const nextTask = useCallback((): any => {
    if (taskIndex + 1 >= totalTasks) {
      const finalCorrect = answers.filter(a => a.correct).length;
      const result = {
        completed: true,
        completedAt: new Date().toISOString(),
        correct: finalCorrect,
        total: totalTasks,
      };
      const streakInfo = storage.saveDailyChallengeResult(dateStr, result);
      setPhase('results');
      return streakInfo;
    } else {
      setTaskIndex(i => i + 1);
      setAnswered(false);
      setLastResult(null);
      setLastDot(null);
    }
  }, [taskIndex, totalTasks, answers, dateStr]);

  const finalResult = phase === 'results' ? (existingResult || null) : null;

  return {
    dateStr,
    phase,
    challenge,
    currentTask,
    taskIndex,
    totalTasks,
    answers,
    answered,
    lastResult,
    lastDot,
    streak,
    bestStreak,
    finalResult,
    start,
    nextTask,
    answerNoteRead,
    answerInterval,
    answerScaleDegree,
    playIntervalQuestion,
    playScaleNote,
  };
}
