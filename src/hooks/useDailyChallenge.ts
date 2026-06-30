/**
 * useDailyChallenge.ts — Runtime state for the daily challenge.
 */

import { useState, useCallback, useMemo } from 'react';
import { generateDailyChallenge, todayKey } from '../lib/dailyChallenge';
import { fretToNote } from '../lib/theory';
import { playCorrect, playWrong, playNote, resumeAudio } from '../lib/audio';
import { storage } from '../lib/storage';

export function useDailyChallenge(): any {
  const dateStr = todayKey();
  const challenge = useMemo(() => generateDailyChallenge(dateStr), [dateStr]);

  const existingResult = storage.getDailyChallengeResult(dateStr);
  const { streak, bestStreak } = storage.getChallengeStreak();

  const [phase, setPhase] = useState(existingResult ? 'results' : 'intro');
  const [taskIndex, setTaskIndex] = useState(0);
  const [answers, setAnswers] = useState([]);     // [{ taskId, correct }]
  const [lastResult, setLastResult] = useState(null); // 'correct' | 'wrong' | null
  const [lastDot, setLastDot] = useState(null);
  const [answered, setAnswered] = useState(false);

  const currentTask = challenge.tasks[taskIndex];
  const totalTasks   = challenge.tasks.length;

  const start = useCallback(() => {
    resumeAudio();
    setPhase('running');
    setTaskIndex(0);
    setAnswers([]);
    setAnswered(false);
    setLastResult(null);
    setLastDot(null);
  }, []);

  const recordAnswer = useCallback((isCorrect, dot = null) => {
    if (answered) return;
    setAnswered(true);
    setLastResult(isCorrect ? 'correct' : 'wrong');
    setLastDot(dot);
    if (isCorrect) playCorrect(); else playWrong();
    setAnswers(prev => [...prev, { taskId: currentTask.id, correct: isCorrect }]);
  }, [answered, currentTask]);

  const answerNoteRead = useCallback((str, fret) => {
    if (answered || currentTask.type !== 'note-read') return;
    const isCorrect = currentTask.correctPositions.some(([s, f]) => s === str && f === fret);
    recordAnswer(isCorrect, { str, fret, type: isCorrect ? 'correct' : 'wrong' });
  }, [answered, currentTask, recordAnswer]);

  const answerInterval = useCallback((semitones) => {
    if (answered || currentTask.type !== 'interval') return;
    recordAnswer(semitones === currentTask.interval.semitones);
  }, [answered, currentTask, recordAnswer]);

  const answerScaleDegree = useCallback((guessYes) => {
    if (answered || currentTask.type !== 'scale-degree') return;
    recordAnswer(guessYes === currentTask.inScale);
  }, [answered, currentTask, recordAnswer]);

  const playIntervalQuestion = useCallback(() => {
    if (currentTask?.type !== 'interval') return;
    resumeAudio();
    playNote(currentTask.rootMidi);
    setTimeout(() => playNote(currentTask.targetMidi), 650);
  }, [currentTask]);

  const playScaleNote = useCallback(() => {
    if (currentTask?.type !== 'scale-degree') return;
    resumeAudio();
    const { midi } = fretToNote(currentTask.str, currentTask.fret);
    playNote(midi);
  }, [currentTask]);

  const nextTask = useCallback(() => {
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
