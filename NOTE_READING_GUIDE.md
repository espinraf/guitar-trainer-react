# Classical Guitar Note Reading Guide

Based on the classical guitar fretboard chart from "Part 1: Getting to know the classical guitar"

## Guitar String Tuning

The classical guitar uses standard tuning with 6 strings:

| String | Note | Octave | MIDI |
|--------|------|--------|------|
| 6th (lowest) | E | 2 | 40 |
| 5th | A | 2 | 45 |
| 4th | D | 3 | 50 |
| 3rd | G | 3 | 55 |
| 2nd | B | 3 | 59 |
| 1st (highest) | E | 4 | 64 |

## Fretboard Reference Chart

The fretboard contains all chromatic notes arranged in frets:

### Chromatic Scale (12 semitones)
C → C# → D → D# → E → F → F# → G → G# → A → A# → B → (repeats)

### Note Progression by Fret

Each fret increases the pitch by one semitone (half step).

**Key positions to memorize:**
- **Fret 0 (Open)**: 6 open strings
- **Fret 5**: Perfect 4th interval from open string
- **Fret 7**: Perfect 5th interval from open string
- **Fret 12**: Octave of the open string

### String-by-String Fretboard Map

```
String 1 (E4):  E F F# G G# A A# B C C# D D# E F F# G G# A A# B (C C# D)
String 2 (B3):  B C C# D D# E F F# G G# A A# B C C# D D# E F F# G G#
String 3 (G3):  G G# A A# B C C# D D# E F F# G G# A A# B C C# D D# E
String 4 (D3):  D D# E F F# G G# A A# B C C# D D# E F F# G G# A A# B
String 5 (A2):  A A# B C C# D D# E F F# G G# A A# B C C# D D# E F F#
String 6 (E2):  E F F# G G# A A# B C C# D D# E F F# G G# A A# B C C#
Fret:           0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20
```

## Staff Notation & Fretboard Correspondence

The treble clef staff shows how notes appear in sheet music:

- **Lines** (from bottom to top): E, G, B, D, F
- **Spaces** (from bottom to top): F, A, C, E

Each note has a unique position on the staff corresponding to its pitch.

### Beginner Range (Most Common)
- **Staffpos 0-8**: The most commonly used range for beginners
- Corresponds to notes from E4 to B4 in the treble clef
- Easily playable on open positions (0-4 frets)

## Accidentals (Sharps & Flats)

- **Sharp (#)**: Raises a note by 1 semitone
  - C# (C sharp) is between C and D
  - Sharps: C#, D#, F#, G#, A#
  
- **Flat (b)**: Lowers a note by 1 semitone
  - Db (D flat) is the same pitch as C#
  - Flats: Db, Eb, Gb, Ab, Bb

- **Enharmonic equivalents**: Same pitch, different names
  - C# = Db, D# = Eb, F# = Gb, G# = Ab, A# = Bb

## Learning Strategy

### Phase 1: Natural Notes Only
Learn the 7 natural notes: C, D, E, F, G, A, B
- Start with open string notes
- Progress through beginner frets (0-4)

### Phase 2: Extend Range
- Expand to frets 5-12
- Build muscle memory across all positions

### Phase 3: Add Sharps & Flats
- Learn chromatic notes
- Understand enharmonic equivalents

### Phase 4: Full Neck Mastery
- Master all frets up to fret 24
- Identify notes instantly regardless of position

## Implementation Notes for Guitar Trainer

The guitar trainer implements:
- **fretToNote()**: Converts (string, fret) → (note, octave, midi)
- **findFretPositions()**: Finds all fretboard locations for a given note
- **Staff notation**: Visual representation of notes on treble clef
- **Quiz modes**:
  - Open position (0-4 frets)
  - Full neck (0-24 frets)
  - Natural notes only
  - With sharps and flats

## Practice Tips

1. **Read the staff first**: Identify the note on sheet music
2. **Find it on fretboard**: Locate all possible positions
3. **Play it**: Use MIDI input or click the fretboard
4. **Verify**: Audio feedback confirms correctness
5. **Build consistency**: Regular practice improves recognition speed

## Reference: Fret-to-Note Calculation

For any string (0-5) and fret (0+):
```
midi = OPEN_STRINGS[string].midi + fret
note = CHROMATIC[midi % 12]
octave = floor(midi / 12) - 1
```

Example: String 0 (E4), Fret 5:
- midi = 64 + 5 = 69 (A4)
- note = CHROMATIC[69 % 12] = CHROMATIC[9] = A
- octave = floor(69/12) - 1 = 4

## Staff Position Reference

The staff has 5 lines and 4 spaces. Position numbering:
- Position 0 (on middle line): E4
- Position -1, -2, ... (below): D4, C4, ...
- Position +1, +2, ... (above): F4, G4, ...

Ledger lines extend the staff range both above and below.
