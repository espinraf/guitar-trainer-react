/**
 * useMidi.js — Web MIDI API hook.
 *
 * Provides:
 *   status      — 'unsupported' | 'denied' | 'pending' | 'ready' | 'no-device'
 *   devices     — array of { id, name } of connected input devices
 *   activeNote  — { midi, note, octave } | null  (most recent noteOn, cleared on noteOff)
 *   lastNote    — { midi, note, octave } | null  (persists after noteOff, useful for quiz)
 *   enable()    — request MIDI access (call from a user gesture)
 *   enabled     — boolean, whether access has been granted
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { CHROMATIC } from '../lib/theory';

function midiNumberToNote(midi) {
  const note   = CHROMATIC[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return { midi, note, octave };
}

export function useMidi() {
  const [status,     setStatus]     = useState('pending');   // start pending — check on mount
  const [enabled,    setEnabled]    = useState(false);
  const [devices,    setDevices]    = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [lastNote,   setLastNote]   = useState(null);

  // Keep a ref to the MIDIAccess object so we can clean up listeners
  const accessRef = useRef(null);
  // Callbacks registered by the consumer (e.g. quiz answer)
  const onNoteRef = useRef(null);

  /** Register an external noteOn callback */
  const onNote = useCallback((cb) => { onNoteRef.current = cb; }, []);

  /** Parse connected inputs into a clean device list */
  function syncDevices(access) {
    const list = [];
    access.inputs.forEach(input => list.push({ id: input.id, name: input.name }));
    setDevices(list);
    setStatus(list.length > 0 ? 'ready' : 'no-device');
  }

  /** Attach message listeners to all current inputs */
  function attachListeners(access) {
    access.inputs.forEach(input => {
      input.onmidimessage = (e) => {
        const [status, midiNote, velocity] = e.data;
        const cmd = status & 0xf0;

        // noteOn (0x90) with velocity > 0
        if (cmd === 0x90 && velocity > 0) {
          const parsed = midiNumberToNote(midiNote);
          setActiveNote(parsed);
          setLastNote(parsed);
          if (onNoteRef.current) onNoteRef.current(parsed);
        }

        // noteOff (0x80) or noteOn with velocity 0
        if (cmd === 0x80 || (cmd === 0x90 && velocity === 0)) {
          setActiveNote(prev => (prev?.midi === midiNote ? null : prev));
        }
      };
    });
  }

  /** Request MIDI access — call from a button click */
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

      // Re-sync whenever devices connect or disconnect
      access.onstatechange = () => {
        syncDevices(access);
        attachListeners(access);
      };
    } catch {
      setStatus('denied');
    }
  }, []);

  // On mount, check if the API even exists (without requesting access yet)
  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      setStatus('unsupported');
    } else {
      setStatus('idle');   // supported but not yet enabled
    }

    return () => {
      // Detach all listeners on unmount
      if (accessRef.current) {
        accessRef.current.inputs.forEach(input => { input.onmidimessage = null; });
      }
    };
  }, []);

  return { status, enabled, devices, activeNote, lastNote, enable, onNote };
}
