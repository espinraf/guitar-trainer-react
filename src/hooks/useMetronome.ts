/**
 * useMetronome.ts
 * Precise metronome using Web Audio API lookahead scheduling.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { getAudioContext, playClick } from '../lib/audio';

const LOOKAHEAD_MS   = 25.0;   // how often to call scheduler (ms)
const SCHEDULE_AHEAD = 0.1;    // how far ahead to schedule audio (sec)

export function useMetronome({ onBeat, beatsPerBar = 4 }: { onBeat?: (beatNumber:number, isDownbeat:boolean)=>void; beatsPerBar?: number } = {}): { isPlaying: boolean; bpm: number; beat: number; start: () => void; stop: () => void; setBpm: (n: number) => void } {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm,       setBpmState]  = useState(80);
  const [beat,      setBeat]      = useState(0);   // current beat (1-indexed display)

  const bpmRef       = useRef(80);
  const onBeatRef    = useRef(onBeat);
  const nextBeatTime = useRef(0);
  const beatCount    = useRef(0);   // total beats fired since start
  const timerRef     = useRef(null);

  useEffect(() => { onBeatRef.current = onBeat; }, [onBeat]);

  const scheduler = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    while (nextBeatTime.current < ctx.currentTime + SCHEDULE_AHEAD) {
      const beatNum    = beatCount.current;
      const isDownbeat = beatNum % beatsPerBar === 0;
      const schedTime  = nextBeatTime.current;

      const delay = Math.max(0, schedTime - ctx.currentTime);
      setTimeout(() => {
        playClick(isDownbeat);
        setBeat(b => (beatNum % beatsPerBar) + 1);
        if (onBeatRef.current) onBeatRef.current(beatNum, isDownbeat);
      }, delay * 1000);

      nextBeatTime.current += 60.0 / bpmRef.current;
      beatCount.current++;
    }

    timerRef.current = setTimeout(scheduler, LOOKAHEAD_MS);
  }, [beatsPerBar]);

  const start = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    beatCount.current    = 0;
    nextBeatTime.current = ctx.currentTime + 0.05; // tiny offset to start clean
    setIsPlaying(true);
    setBeat(1);
    scheduler();
  }, [scheduler]);

  const stop = useCallback(() => {
    clearTimeout(timerRef.current);
    setIsPlaying(false);
    setBeat(0);
    beatCount.current = 0;
  }, []);

  const setBpm = useCallback((newBpm) => {
    bpmRef.current = newBpm;
    setBpmState(newBpm);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { isPlaying, bpm, beat, start, stop, setBpm };
}
