import { useState } from 'react';
import { OPEN_STRINGS, fretToNote, STRING_LABELS, CHROMATIC } from '../lib/theory';

/**
 * Interactive reference guide for note reading on classical guitar
 * Based on the classical guitar fretboard chart (Part 1: Getting to know the classical guitar)
 */
export default function NoteReferencePage() {
  const [maxFret, setMaxFret] = useState<number>(12);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Classical Guitar Note Reading Reference</h1>
      
      <section style={{ marginBottom: '30px' }}>
        <h2>Guitar String Tuning (Standard Tuning)</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-2)' }}>
              <th style={{ padding: '10px', border: '1px solid var(--border)' }}>String</th>
              <th style={{ padding: '10px', border: '1px solid var(--border)' }}>Label</th>
              <th style={{ padding: '10px', border: '1px solid var(--border)' }}>Note</th>
              <th style={{ padding: '10px', border: '1px solid var(--border)' }}>Octave</th>
              <th style={{ padding: '10px', border: '1px solid var(--border)' }}>MIDI</th>
            </tr>
          </thead>
          <tbody>
            {OPEN_STRINGS.map((str, idx) => (
              <tr key={idx}>
                <td style={{ padding: '10px', border: '1px solid var(--border)' }}>{6 - idx}</td>
                <td style={{ padding: '10px', border: '1px solid var(--border)' }}>{STRING_LABELS[5 - idx]}</td>
                <td style={{ padding: '10px', border: '1px solid var(--border)' }}>{str.note}</td>
                <td style={{ padding: '10px', border: '1px solid var(--border)' }}>{str.octave}</td>
                <td style={{ padding: '10px', border: '1px solid var(--border)' }}>{str.midi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>Chromatic Scale (12 Semitones)</h2>
        <div style={{ padding: '15px', backgroundColor: 'var(--bg-2)', borderRadius: '8px', marginBottom: '20px' }}>
          <code style={{ fontSize: '14px', lineHeight: '1.6' }}>
            {CHROMATIC.map((note, idx) => (
              <span key={note}>
                {note}
                {idx < CHROMATIC.length - 1 ? ' → ' : ''}
                {(idx + 1) % 4 === 0 ? <br /> : ''}
              </span>
            ))}
          </code>
        </div>
        <p style={{ color: 'var(--text-2)' }}>
          <strong>Key Points:</strong>
          <ul>
            <li>There are 12 unique notes in the chromatic scale</li>
            <li>Each fret increases the pitch by one semitone (half step)</li>
            <li>After B comes C (in the next octave)</li>
            <li>Sharps (#) go up, flats (b) go down</li>
          </ul>
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>Fretboard Chart</h2>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="maxFretInput" style={{ marginRight: '10px' }}>
            Show frets up to:
          </label>
          <select
            id="maxFretInput"
            value={maxFret}
            onChange={(e) => setMaxFret(parseInt(e.target.value))}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-1)',
              color: 'var(--text)',
              cursor: 'pointer'
            }}
          >
            {[4, 6, 8, 12, 15, 24].map(n => (
              <option key={n} value={n}>Fret {n}</option>
            ))}
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-2)' }}>
                <th style={{ padding: '8px', border: '1px solid var(--border)', minWidth: '60px' }}>String</th>
                {Array.from({ length: maxFret + 1 }).map((_, fret) => (
                  <th key={fret} style={{
                    padding: '8px',
                    border: '1px solid var(--border)',
                    minWidth: '50px',
                    backgroundColor: fret % 2 === 0 ? 'var(--bg-2)' : 'var(--bg-1)',
                    fontWeight: fret === 0 ? 'bold' : 'normal'
                  }}>
                    {fret}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {OPEN_STRINGS.map((openStr, strIdx) => (
                <tr key={strIdx}>
                  <td style={{
                    padding: '8px',
                    border: '1px solid var(--border)',
                    fontWeight: 'bold',
                    backgroundColor: 'var(--bg-2)',
                    minWidth: '60px'
                  }}>
                    {STRING_LABELS[5 - strIdx]} ({openStr.note}{openStr.octave})
                  </td>
                  {Array.from({ length: maxFret + 1 }).map((_, fret) => {
                    const { label } = fretToNote(strIdx, fret);
                    return (
                      <td key={fret} style={{
                        padding: '8px',
                        border: '1px solid var(--border)',
                        textAlign: 'center',
                        backgroundColor: fret % 2 === 0 ? 'var(--bg-2)' : 'var(--bg-1)',
                        fontSize: '11px',
                        fontWeight: label.includes('#') || label.includes('b') ? 'bold' : 'normal',
                        color: fret === 0 ? 'var(--accent)' : 'var(--text)'
                      }}>
                        {label}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>Key Intervals on Fretboard</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '15px', backgroundColor: 'var(--bg-2)', borderRadius: '8px' }}>
            <h3>Fret 5: Perfect 4th</h3>
            <p>5 semitones above the open string</p>
            <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>
              Example: E (open) → A (fret 5)
            </p>
          </div>
          <div style={{ padding: '15px', backgroundColor: 'var(--bg-2)', borderRadius: '8px' }}>
            <h3>Fret 7: Perfect 5th</h3>
            <p>7 semitones above the open string</p>
            <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>
              Example: E (open) → B (fret 7)
            </p>
          </div>
          <div style={{ padding: '15px', backgroundColor: 'var(--bg-2)', borderRadius: '8px' }}>
            <h3>Fret 12: Octave</h3>
            <p>12 semitones above the open string</p>
            <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>
              Example: E (open) → E (fret 12, one octave higher)
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>Accidentals: Sharps & Flats</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ padding: '15px', backgroundColor: 'var(--bg-2)', borderRadius: '8px' }}>
            <h3>Sharps (#)</h3>
            <p>Raise a note by 1 semitone</p>
            <ul>
              <li>C# (between C and D)</li>
              <li>D# (between D and E)</li>
              <li>F# (between F and G)</li>
              <li>G# (between G and A)</li>
              <li>A# (between A and B)</li>
            </ul>
          </div>
          <div style={{ padding: '15px', backgroundColor: 'var(--bg-2)', borderRadius: '8px' }}>
            <h3>Flats (b)</h3>
            <p>Lower a note by 1 semitone</p>
            <ul>
              <li>Db (between C and D, = C#)</li>
              <li>Eb (between D and E, = D#)</li>
              <li>Gb (between F and G, = F#)</li>
              <li>Ab (between G and A, = G#)</li>
              <li>Bb (between A and B, = A#)</li>
            </ul>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>Learning Strategy</h2>
        <ol>
          <li>
            <strong>Phase 1: Natural Notes Only</strong>
            <p style={{ color: 'var(--text-2)' }}>
              Learn C, D, E, F, G, A, B on open positions (frets 0-4)
            </p>
          </li>
          <li>
            <strong>Phase 2: Extend Range</strong>
            <p style={{ color: 'var(--text-2)' }}>
              Progress through frets 5-12, building muscle memory across all strings
            </p>
          </li>
          <li>
            <strong>Phase 3: Add Sharps & Flats</strong>
            <p style={{ color: 'var(--text-2)' }}>
              Learn chromatic notes and enharmonic equivalents
            </p>
          </li>
          <li>
            <strong>Phase 4: Full Neck Mastery</strong>
            <p style={{ color: 'var(--text-2)' }}>
              Master all frets up to fret 24 for complete fretboard knowledge
            </p>
          </li>
        </ol>
      </section>

      <section>
        <h2>Practice Tips</h2>
        <ul>
          <li><strong>Read the staff first:</strong> Identify the note on sheet music</li>
          <li><strong>Find all positions:</strong> Most notes appear multiple times on the fretboard</li>
          <li><strong>Play it:</strong> Use MIDI input or click the fretboard to play</li>
          <li><strong>Verify:</strong> Audio feedback confirms if you're correct</li>
          <li><strong>Build consistency:</strong> Regular practice improves recognition speed</li>
        </ul>
      </section>
    </div>
  );
}
