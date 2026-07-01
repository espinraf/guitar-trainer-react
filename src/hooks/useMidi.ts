import { useState, useEffect, useCallback, useRef } from 'react';
import { CHROMATIC } from '../lib/theory';

type MidiNote = { midi: number; note: string; octave: number };
type Device = { id: string; name?: string };

type MidiStatus = 'pending' | 'idle' | 'ready' | 'no-device' | 'unsupported' | 'denied';

function midiNumberToNote(midi: number): MidiNote {
  const note   = CHROMATIC[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return { midi, note, octave };
}

export function useMidi(): {
  status: MidiStatus;
  enabled: boolean;
  devices: Device[];
  activeNote: MidiNote | null;
  lastNote: MidiNote | null;
  enable: () => Promise<void>;
  onNote: (cb: ((note: MidiNote | null) => void) | null) => void;
} {
  const [status,     setStatus]     = useState<MidiStatus>('pending');   // start pending — check on mount
  const [enabled,    setEnabled]    = useState<boolean>(false);
  const [devices,    setDevices]    = useState<Device[]>([]);
  const [activeNote, setActiveNote] = useState<MidiNote | null>(null);
  const [lastNote,   setLastNote]   = useState<MidiNote | null>(null);

  const accessRef = useRef<MIDIAccess | null>(null);
  const onNoteRef = useRef<((note: MidiNote | null) => void) | null>(null);

  const onNote = useCallback((cb: ((note: MidiNote | null) => void) | null) => { onNoteRef.current = cb; }, []);

  function syncDevices(access: MIDIAccess) {
    const list: Device[] = [];
    access.inputs.forEach((input: MIDIInput) => list.push({ id: input.id, name: input.name }));
    setDevices(list);
    setStatus(list.length > 0 ? 'ready' : 'no-device');
  }

  function attachListeners(access: MIDIAccess) {
    access.inputs.forEach((input: MIDIInput) => {
      input.onmidimessage = (e: MIDIMessageEvent) => {
        const [statusByte, midiNote, velocity] = e.data;
        const cmd = statusByte & 0xf0;

        if (cmd === 0x90 && velocity > 0) {
          const parsed = midiNumberToNote(midiNote);
          setActiveNote(parsed);
          setLastNote(parsed);
          if (onNoteRef.current) onNoteRef.current(parsed);
        }

        if (cmd === 0x80 || (cmd === 0x90 && velocity === 0)) {
          setActiveNote(prev => (prev?.midi === midiNote ? null : prev));
        }
      };
    });
  }

  const enable = useCallback(async () => {
    if (!(navigator as any).requestMIDIAccess) {
      setStatus('unsupported');
      return;
    }
    try {
      const access = await (navigator as any).requestMIDIAccess({ sysex: false }) as MIDIAccess;
      accessRef.current = access;
      setEnabled(true);
      syncDevices(access);
      attachListeners(access);

      access.onstatechange = () => {
        syncDevices(access);
        attachListeners(access);
      };
    } catch {
      setStatus('denied');
    }
  }, []);

  useEffect(() => {
    if (!(navigator as any).requestMIDIAccess) {
      setStatus('unsupported');
    } else {
      setStatus('idle');
    }

    return () => {
      if (accessRef.current) {
        accessRef.current.inputs.forEach((input: MIDIInput) => { input.onmidimessage = null; });
      }
    };
  }, []);

  return { status, enabled, devices, activeNote, lastNote, enable, onNote };
}
