import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { buildScaleSequence, SCALE_POSITIONS, CHROMATIC } from '../lib/theory';
import { playNote } from '../lib/audio';

type Direction = 'asc' | 'desc' | 'both';

type SequenceNote = { str: number; fret: number; midi: number; note: string };

type Dot = { str: number; fret: number; type: 'active' | 'root' | 'scale'; label: string };

export function useScaleTrainer(): {
  root: string; setRoot: (s: string) => void;
  scaleName: string; setScaleName: (s: string) => void;
  posIndex: number; setPosIndex: (n: number) => void;
  direction: Direction; setDirection: (d: Direction) => void;
  soundOn: boolean; setSoundOn: (b: boolean) => void;
  position: { label: string; minFret: number; maxFret: number };
  sequence: SequenceNote[];
  stepIndex: number;
  currentNote: SequenceNote | null;
  dots: Dot[];
  isRunning: boolean;
  onBeat: () => void;
  start: () => void;
  stop: () => void;
  stepForward: () => void;
  stepBack: () => void;
} {
  const [root,      setRoot]      = useState<string>('C');
  const [scaleName, setScaleName] = useState<string>('major');
  const [posIndex,  setPosIndex]  = useState<number>(0);
  const [direction, setDirection] = useState<Direction>('asc');
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundOn,   setSoundOn]   = useState<boolean>(true);

  const soundOnRef = useRef(soundOn);
  useEffect(() => { soundOnRef.current = soundOn; }, [soundOn]);

  const position = SCALE_POSITIONS[posIndex];

  const sequence = useMemo<SequenceNote[]>(
    () => buildScaleSequence(root, scaleName, position, direction),
    [root, scaleName, position, direction]
  );

  useEffect(() => { setStepIndex(0); }, [sequence]);

  const currentNote = sequence[stepIndex] ?? null;

  const onBeat = useCallback((): void => {
    if (!isRunning) return;

    setStepIndex(prev => {
      const next = (prev + 1) % sequence.length;
      const note = sequence[next];
      if (note && soundOnRef.current) playNote(note.midi);
      return next;
    });
  }, [isRunning, sequence]);

  const start = useCallback((): void => {
    setStepIndex(0);
    setIsRunning(true);
    if (sequence[0] && soundOnRef.current) playNote(sequence[0].midi);
  }, [sequence]);

  const stop = useCallback((): void => {
    setIsRunning(false);
    setStepIndex(0);
  }, []);

  const stepForward = useCallback((): void => {
    setStepIndex(prev => {
      const next = (prev + 1) % sequence.length;
      if (sequence[next] && soundOnRef.current) playNote(sequence[next].midi);
      return next;
    });
  }, [sequence]);

  const stepBack = useCallback((): void => {
    setStepIndex(prev => {
      const next = (prev - 1 + sequence.length) % sequence.length;
      if (sequence[next] && soundOnRef.current) playNote(sequence[next].midi);
      return next;
    });
  }, [sequence]);

  const rootMidiClass = CHROMATIC.indexOf(root);

  const dots = useMemo<Dot[]>(() => sequence.map((n, i) => {
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
    root, setRoot,
    scaleName, setScaleName,
    posIndex, setPosIndex,
    direction, setDirection,
    soundOn, setSoundOn,
    position,
    sequence,
    stepIndex,
    currentNote,
    dots,
    isRunning,
    onBeat,
    start,
    stop,
    stepForward,
    stepBack,
  };
}
