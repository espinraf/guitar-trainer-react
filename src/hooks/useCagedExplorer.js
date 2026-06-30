/**
 * useCagedExplorer.js — State for the CAGED visualizer tab.
 */

import { useState, useMemo, useCallback } from 'react';
import { buildCagedShape, getOrderedShapes, CAGED_ORDER } from '../lib/caged';
import { playNote, resumeAudio } from '../lib/audio';
import { fretToNote } from '../lib/theory';

export function useCagedExplorer() {
  const [root, setRoot] = useState('C');
  const [activeShapes, setActiveShapes] = useState(new Set(['C']));  // which shapes are shown
  const [soundOn, setSoundOn] = useState(true);

  const orderedShapes = useMemo(() => getOrderedShapes(root), [root]);

  const toggleShape = useCallback((key) => {
    setActiveShapes(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const showAll = useCallback(() => setActiveShapes(new Set(CAGED_ORDER)), []);
  const showOnly = useCallback((key) => setActiveShapes(new Set([key])), []);

  // Build dots for all active shapes, merged.
  // If a fret position appears in multiple active shapes, prefer chord-tone/root status.
  const dots = useMemo(() => {
    const merged = new Map(); // key: `${str}-${fret}` -> dot data

    for (const shapeKey of activeShapes) {
      const positions = buildCagedShape(shapeKey, root);
      for (const pos of positions) {
        const key = `${pos.str}-${pos.fret}`;
        const existing = merged.get(key);
        const { note } = fretToNote(pos.str, pos.fret);

        const type = pos.isRoot ? 'root' : pos.isChordTone ? 'chordtone' : 'scale';

        if (!existing || rank(type) > rank(existing.type)) {
          merged.set(key, {
            str: pos.str,
            fret: pos.fret,
            type,
            label: note,
            shapes: existing ? [...existing.shapes, shapeKey] : [shapeKey],
          });
        } else {
          existing.shapes.push(shapeKey);
        }
      }
    }

    return Array.from(merged.values());
  }, [activeShapes, root]);

  const handleNoteClick = useCallback((str, fret) => {
    resumeAudio();
    if (soundOn) {
      const { midi } = fretToNote(str, fret);
      playNote(midi);
    }
  }, [soundOn]);

  return {
    root, setRoot,
    activeShapes, toggleShape, showAll, showOnly,
    orderedShapes,
    dots,
    soundOn, setSoundOn,
    handleNoteClick,
  };
}

function rank(type) {
  if (type === 'root') return 2;
  if (type === 'chordtone') return 1;
  return 0;
}
