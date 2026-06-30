/**
 * useScaleTrainer.js
 *
 * Manages the scale trainer state:
 * - which scale / root / position / direction is selected
 * - the ordered note sequence for the current settings
 * - which step we're on (highlighted note)
 * - advancing one step per metronome beat
 * - playing the note sound on each step
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { buildScaleSequence, SCALE_POSITIONS, CHROMATIC } from '../lib/theory';
import { playNote } from '../lib/audio';

export function useScaleTrainer() {
  const [root,      setRoot]      = useState('C');
  const [scaleName, setScaleName] = useState('major');
  const [posIndex,  setPosIndex]  = useState(0);
  const [direction, setDirection] = useState('asc');   // 'asc' | 'desc' | 'both'
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [soundOn,   setSoundOn]   = useState(true);

  const soundOnRef = useRef(soundOn);
  useEffect(() => { soundOnRef.current = soundOn; }, [soundOn]);

  const position = SCALE_POSITIONS[posIndex];

  // Rebuild the sequence whenever root/scale/position/direction changes
  const sequence = useMemo(
    () => buildScaleSequence(root, scaleName, position, direction),
    [root, scaleName, position, direction]
  );

  // Reset step when sequence changes
  useEffect(() => { setStepIndex(0); }, [sequence]);

  const currentNote = sequence[stepIndex] ?? null;

  /** Called by the metronome on each beat */
  const onBeat = useCallback(() => {
    if (!isRunning) return;

    setStepIndex(prev => {
      const next = (prev + 1) % sequence.length;
      const note = sequence[next];
      if (note && soundOnRef.current) playNote(note.midi);
      return next;
    });
  }, [isRunning, sequence]);

  const start = useCallback(() => {
    setStepIndex(0);
    setIsRunning(true);
    // Play the first note immediately
    if (sequence[0] && soundOnRef.current) playNote(sequence[0].midi);
  }, [sequence]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setStepIndex(0);
  }, []);

  /** Step forward manually (when not running) */
  const stepForward = useCallback(() => {
    setStepIndex(prev => {
      const next = (prev + 1) % sequence.length;
      if (sequence[next] && soundOnRef.current) playNote(sequence[next].midi);
      return next;
    });
  }, [sequence]);

  /** Step backward manually */
  const stepBack = useCallback(() => {
    setStepIndex(prev => {
      const next = (prev - 1 + sequence.length) % sequence.length;
      if (sequence[next] && soundOnRef.current) playNote(sequence[next].midi);
      return next;
    });
  }, [sequence]);

  // Build dot data for the fretboard:
  //   'scale' = grey dot (all scale notes)
  //   'active' = bright green (current step)
  //   'root' = accent (root notes)
  const rootMidiClass = CHROMATIC.indexOf(root);

  const dots = useMemo(() => sequence.map((n, i) => {
    const isActive = i === stepIndex;
    const isRoot   = n.midi % 12 === rootMidiClass;
    return {
      str:   n.str,
      fret:  n.fret,
      type:  isActive ? 'active' : isRoot ? 'root' : 'scale',
      label: n.note,
    };
  }), [sequence, stepIndex, rootMidiClass]);

  return {
    // settings
    root, setRoot,
    scaleName, setScaleName,
    posIndex, setPosIndex,
    direction, setDirection,
    soundOn, setSoundOn,
    // derived
    position,
    sequence,
    stepIndex,
    currentNote,
    dots,
    // playback
    isRunning,
    onBeat,
    start,
    stop,
    stepForward,
    stepBack,
  };
}
