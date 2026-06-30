import { useState, useEffect, useCallback, useRef } from 'react';
import { CHROMATIC } from '../lib/theory';

function midiNumberToNote(midi) {
  const note   = CHROMATIC[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return { midi, note, octave };
}

export function useMidi(): { status: string; enabled: boolean; devices: Array<{id:string,name?:string}>; activeNote: { midi:number; note:string; octave:number } | null; lastNote: { midi:number; note:string; octave:number } | null; enable: () => Promise<void>; onNote: (cb: (note: any) => void) => void } {
  const [status,     setStatus]     = useState('pending');   // start pending — check on mount
  const [enabled,    setEnabled]    = useState(false);
  const [devices,    setDevices]    = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [lastNote,   setLastNote]   = useState(null);

  const accessRef = useRef(null);
  const onNoteRef = useRef(null);

  const onNote = useCallback((cb) => { onNoteRef.current = cb; }, []);

  function syncDevices(access) {
    const list = [];
    access.inputs.forEach(input => list.push({ id: input.id, name: input.name }));
    setDevices(list);
    setStatus(list.length > 0 ? 'ready' : 'no-device');
  }

  function attachListeners(access) {
    access.inputs.forEach(input => {
      input.onmidimessage = (e) => {
        const [status, midiNote, velocity] = e.data;
        const cmd = status & 0xf0;

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
    if (!navigator.requestMIDIAccess) {
      setStatus('unsupported');
      return;
    }
    try {
      const access = await navigator.requestMIDIAccess({ sysex: false });
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
    if (!navigator.requestMIDIAccess) {
      setStatus('unsupported');
    } else {
      setStatus('idle');
    }

    return () => {
      if (accessRef.current) {
        accessRef.current.inputs.forEach(input => { input.onmidimessage = null; });
      }
    };
  }, []);

  return { status, enabled, devices, activeNote, lastNote, enable, onNote };
}
