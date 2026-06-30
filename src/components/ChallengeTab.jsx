// ChallengeTab.jsx — Daily challenge: one fixed 10-task sequence per day

import { useRef, useEffect, useState } from 'react';
import { useDailyChallenge } from '../hooks/useDailyChallenge';
import Staff from './Staff';
import Fretboard from './Fretboard';

export default function ChallengeTab() {
  const dc = useDailyChallenge();
  const {
    dateStr, phase, currentTask, taskIndex, totalTasks,
    answered, lastResult, lastDot, streak, bestStreak, finalResult, answers,
    start, nextTask, answerNoteRead, answerInterval, answerScaleDegree,
    playIntervalQuestion, playScaleNote,
  } = dc;

  const fretWrapRef = useRef(null);
  const [fretWidth, setFretWidth] = useState(620);
  useEffect(() => {
    const el = fretWrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setFretWidth(e.contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const prettyDate = new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  // ── INTRO ──
  if (phase === 'intro') {
    return (
      <div className="challenge-layout">
        <div className="card challenge-intro-card">
          <div className="challenge-intro-icon">🎯</div>
          <h2 className="challenge-title">Today's Challenge</h2>
          <p className="challenge-date">{prettyDate}</p>
          <p className="challenge-desc">
            10 mixed tasks — note reading, intervals, and scale knowledge.
            Same challenge for everyone today. One attempt only.
          </p>

          <div className="challenge-streak-row">
            <div className="streak-pill">
              <span className="streak-pill-value">{streak}</span>
              <span className="streak-pill-label">day streak</span>
            </div>
            <div className="streak-pill">
              <span className="streak-pill-value">{bestStreak}</span>
              <span className="streak-pill-label">best streak</span>
            </div>
          </div>

          <button className="btn btn-primary challenge-start-btn" onClick={start}>
            Start today's challenge
          </button>
        </div>
      </div>
    );
  }

  // ── RESULTS ──
  if (phase === 'results') {
    const result = finalResult || { correct: answers.filter(a => a.correct).length, total: totalTasks };
    const pct = Math.round((result.correct / result.total) * 100);
    const grade = pct === 100 ? 'Perfect!' : pct >= 80 ? 'Great job!' : pct >= 50 ? 'Good effort!' : 'Keep practicing!';

    return (
      <div className="challenge-layout">
        <div className="card challenge-results-card">
          <div className="challenge-intro-icon">{pct === 100 ? '🏆' : '✓'}</div>
          <h2 className="challenge-title">{grade}</h2>
          <p className="challenge-date">{prettyDate}</p>

          <div className="challenge-score-display">
            <span className="challenge-score-num">{result.correct}</span>
            <span className="challenge-score-sep">/</span>
            <span className="challenge-score-total">{result.total}</span>
          </div>
          <div className="challenge-score-pct">{pct}% correct</div>

          <div className="challenge-streak-row">
            <div className="streak-pill">
              <span className="streak-pill-value">{streak}</span>
              <span className="streak-pill-label">day streak</span>
            </div>
            <div className="streak-pill">
              <span className="streak-pill-value">{bestStreak}</span>
              <span className="streak-pill-label">best streak</span>
            </div>
          </div>

          <p className="challenge-comeback">Come back tomorrow for a new challenge.</p>
        </div>
      </div>
    );
  }

  // ── RUNNING ──
  return (
    <div className="challenge-layout">
      <div className="challenge-progress-row">
        <div className="challenge-progress-text">Task {taskIndex + 1} of {totalTasks}</div>
        <div className="progress-bar" style={{ flex: 1, marginLeft: 12 }}>
          <div className="progress-fill" style={{ width: `${(taskIndex / totalTasks) * 100}%` }} />
        </div>
      </div>

      {currentTask.type === 'note-read' && (
        <NoteReadTask
          task={currentTask}
          answered={answered}
          lastResult={lastResult}
          lastDot={lastDot}
          onAnswer={answerNoteRead}
          fretWrapRef={fretWrapRef}
          fretWidth={fretWidth}
        />
      )}

      {currentTask.type === 'interval' && (
        <IntervalTask
          task={currentTask}
          answered={answered}
          lastResult={lastResult}
          onAnswer={answerInterval}
          onPlay={playIntervalQuestion}
        />
      )}

      {currentTask.type === 'scale-degree' && (
        <ScaleDegreeTask
          task={currentTask}
          answered={answered}
          lastResult={lastResult}
          onAnswer={answerScaleDegree}
          onPlay={playScaleNote}
        />
      )}

      <div className="action-bar">
        <div className={`feedback feedback--${lastResult || 'idle'}`}>
          {!answered && 'Answer the task above'}
          {lastResult === 'correct' && '✓ Correct!'}
          {lastResult === 'wrong' && '✗ Not quite'}
        </div>
        <button className="btn btn-primary" onClick={nextTask} disabled={!answered}>
          {taskIndex + 1 >= totalTasks ? 'Finish' : 'Next'} <kbd>↵</kbd>
        </button>
      </div>
    </div>
  );
}

// ── Task renderers ──────────────────────────────────────────────────

function NoteReadTask({ task, answered, lastResult, lastDot, onAnswer, fretWrapRef, fretWidth }) {
  const staffState = lastResult === 'correct' ? 'correct' : lastResult === 'wrong' ? 'wrong' : 'default';
  return (
    <div className="card staff-card">
      <div className="card-header"><span className="card-label">Find this note</span></div>
      <div className="staff-wrap">
        <Staff noteInfo={task.note} state={staffState} />
      </div>
      <div ref={fretWrapRef} style={{ width: '100%', marginTop: 12 }}>
        <Fretboard
          width={Math.max(320, fretWidth)}
          onFretClick={answered ? null : onAnswer}
          dots={lastDot ? [lastDot] : []}
        />
      </div>
    </div>
  );
}

function IntervalTask({ task, answered, lastResult, onAnswer, onPlay }) {
  useEffect(() => { const t = setTimeout(onPlay, 300); return () => clearTimeout(t); }, [task.id]); // eslint-disable-line
  return (
    <div className="card interval-question-card">
      <div className="card-header">
        <span className="card-label">What interval do you hear?</span>
        <button className="btn btn-ghost btn-sm" onClick={onPlay}>▶ Replay</button>
      </div>
      <div className="interval-answer-grid" style={{ marginTop: 12 }}>
        {task.choices.map(iv => (
          <button
            key={iv.short}
            className={`interval-answer-btn ${answered && iv.semitones === task.interval.semitones ? 'reveal-correct' : ''}`}
            disabled={answered}
            onClick={() => onAnswer(iv.semitones)}
          >
            <span className="interval-answer-short">{iv.short}</span>
            <span className="interval-answer-name">{iv.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ScaleDegreeTask({ task, answered, lastResult, onAnswer, onPlay }) {
  return (
    <div className="card interval-question-card">
      <div className="card-header">
        <span className="card-label">
          Is {task.note} in the {task.root} {task.scaleName} scale?
        </span>
        <button className="btn btn-ghost btn-sm" onClick={onPlay}>▶ Play note</button>
      </div>
      <div className="challenge-yesno-row">
        <button
          className={`btn challenge-yesno-btn ${answered && task.inScale ? 'reveal-correct' : ''}`}
          disabled={answered}
          onClick={() => onAnswer(true)}
        >
          Yes
        </button>
        <button
          className={`btn challenge-yesno-btn ${answered && !task.inScale ? 'reveal-correct' : ''}`}
          disabled={answered}
          onClick={() => onAnswer(false)}
        >
          No
        </button>
      </div>
    </div>
  );
}
