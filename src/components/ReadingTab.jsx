// ReadingTab.jsx — Quiz panel: staff + fretboard + MIDI + action bar

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuiz }     from '../hooks/useQuiz';
import { useMidi }     from '../hooks/useMidi';
import Staff           from './Staff';
import Fretboard       from './Fretboard';
import Sidebar         from './Sidebar';
import MidiPanel       from './MidiPanel';
import { resumeAudio } from '../lib/audio';

export default function ReadingTab() {
  const [position,     setPosition]     = useState('open');
  const [showNames,    setShowNames]    = useState(false);
  const [soundOn,      setSoundOn]      = useState(true);
  const [noteSet,      setNoteSet]      = useState('natural');
  const [midiEnabled,  setMidiEnabled]  = useState(false);
  const [octaveStrict, setOctaveStrict] = useState(false);

  const { state, answer, answerByMidi, next, skip, hint } = useQuiz({ position, noteSet, soundOn });
  const { note, answeredOk, feedback, lastClickedDot,
          score, attempts, correct, streak, answered, dailyGoal } = state;

  const midi = useMidi();

  // Wire MIDI noteOn → quiz answer
  useEffect(() => {
    if (!midiEnabled) return;
    midi.onNote((parsed) => {
      answerByMidi(parsed.midi, octaveStrict);
    });
    return () => midi.onNote(null);
  }, [midiEnabled, octaveStrict, answerByMidi, midi]);

  // Fretboard width measurement
  const fretWrapRef = useRef(null);
  const [fretWidth, setFretWidth] = useState(620);
  useEffect(() => {
    const el = fretWrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setFretWidth(e.contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.key === 'h' || e.key === 'H') hint();
      if (e.key === 's' || e.key === 'S') skip();
      if ((e.key === 'Enter' || e.key === 'ArrowRight') && answeredOk) next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answeredOk, hint, skip, next]);

  // Resume Web Audio on first interaction
  useEffect(() => {
    const once = () => { resumeAudio(); window.removeEventListener('pointerdown', once); };
    window.addEventListener('pointerdown', once);
    return () => window.removeEventListener('pointerdown', once);
  }, []);

  // Auto-advance after MIDI correct answer (slight delay so the user sees the highlight)
  useEffect(() => {
    if (answeredOk && midiEnabled) {
      const t = setTimeout(next, 1200);
      return () => clearTimeout(t);
    }
  }, [answeredOk, midiEnabled, next]);

  const handleMidiEnable = useCallback(() => {
    setMidiEnabled(true);
    midi.enable();
  }, [midi]);

  const dots = lastClickedDot ? [lastClickedDot] : [];
  const staffState = lastClickedDot?.type === 'correct' ? 'correct'
                   : lastClickedDot?.type === 'wrong'   ? 'wrong'
                   : 'default';

  return (
    <div className="reading-layout">
      <div className="reading-left">

        {/* ── Staff ── */}
        <div className="card staff-card">
          <div className="card-header">
            <span className="card-label">Find this note</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {midiEnabled && midi.status === 'ready' && (
                <span className="midi-live-badge">
                  <span className="midi-live-dot" />
                  MIDI
                </span>
              )}
              <span className={`note-badge ${answeredOk ? 'visible' : ''}`}>
                {note?.label}
              </span>
            </div>
          </div>
          <div className="staff-wrap">
            <Staff noteInfo={note} state={staffState} showName={showNames} />
          </div>
        </div>

        {/* ── Fretboard ── */}
        <div className="card fretboard-card">
          <div className="card-header">
            <span className="card-label">
              {midiEnabled && midi.status === 'ready'
                ? 'Play the note on your guitar'
                : 'Click the correct fret'}
            </span>
            <select
              value={position}
              onChange={e => setPosition(e.target.value)}
              aria-label="Position"
            >
              <option value="open">Open position</option>
              <option value="all">All positions</option>
            </select>
          </div>
          <div ref={fretWrapRef} style={{ width: '100%' }}>
            <Fretboard
              width={Math.max(320, fretWidth)}
              onFretClick={midiEnabled && midi.status === 'ready' ? null : answer}
              dots={dots}
              showNoteNames={showNames}
            />
          </div>
        </div>

        {/* ── MIDI panel ── */}
        <MidiPanel
          status={midiEnabled ? midi.status : 'idle'}
          enabled={midiEnabled}
          devices={midi.devices}
          activeNote={midi.activeNote}
          lastNote={midi.lastNote}
          octaveStrict={octaveStrict}
          onOctaveStrict={setOctaveStrict}
          onEnable={handleMidiEnable}
        />

        {/* ── Action bar ── */}
        <div className="action-bar">
          <div className={`feedback feedback--${feedback.kind}`} aria-live="polite" aria-atomic="true">
            {feedback.text}
          </div>
          <div className="action-btns">
            <button className="btn btn-ghost" onClick={hint} disabled={answeredOk}>
              Hint <kbd>H</kbd>
            </button>
            <button className="btn btn-ghost" onClick={skip}>
              Skip <kbd>S</kbd>
            </button>
            <button className="btn btn-primary" onClick={next} disabled={!answeredOk}>
              Next <kbd>↵</kbd>
            </button>
          </div>
        </div>

      </div>

      <Sidebar
        score={score}
        attempts={attempts}
        correct={correct}
        streak={streak}
        answered={answered}
        dailyGoal={dailyGoal}
        showNames={showNames}
        onShowNames={setShowNames}
        soundOn={soundOn}
        onSoundOn={setSoundOn}
        noteSet={noteSet}
        onNoteSet={setNoteSet}
      />
    </div>
  );
}
