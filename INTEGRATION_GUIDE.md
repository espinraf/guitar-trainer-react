# Integration Guide: Note Reading Theory Components

This guide shows how to integrate and use the new note reading theory components in your guitar trainer app.

## Components Overview

### 1. NoteReferencePage Component
Standalone page for comprehensive note reading reference.

**Import:**
```typescript
import NoteReferencePage from './components/NoteReferencePage';
```

**Usage:**
```typescript
// As a new tab/page
<Route path="/theory" component={NoteReferencePage} />

// Or within existing navigation
{activeTab === 'theory' && <NoteReferencePage />}
```

**Features:**
- Guitar string tuning table
- Chromatic scale display
- Interactive fretboard chart (adjustable fret range)
- Key intervals explanation
- Accidentals reference
- Learning strategy breakdown
- Practice tips

### 2. FretboardDiagram Component
Reusable visual reference for fretboard.

**Import:**
```typescript
import FretboardDiagram from './components/FretboardDiagram';
```

**Basic Usage:**
```typescript
<FretboardDiagram />
```

**With Props:**
```typescript
<FretboardDiagram 
  maxFret={12}                    // Show up to fret 12
  highlightString={2}             // Highlight string 2
  highlightFret={5}               // Highlight fret 5
  showNoteNames={true}            // Show note labels
/>
```

**Props Documentation:**
```typescript
interface FretboardDiagramProps {
  maxFret?: number;              // Default: 12
  highlightString?: number;      // String index 0-5 (-1 for none)
  highlightFret?: number;        // Fret number (-1 for none)
  showNoteNames?: boolean;       // Default: true
}
```

### 3. Note Reading Theory Data
Structured data for building custom features.

**Import:**
```typescript
import {
  CLASSICAL_GUITAR_STRINGS,
  KEY_INTERVALS,
  ACCIDENTAL_INFO,
  ENHARMONIC_PAIRS,
  LEARNING_PHASES,
  PRACTICE_STRATEGIES,
  NOTE_READING_FAQ,
  COMMON_MISTAKES
} from './lib/noteReadingTheory';
```

**Usage Examples:**

**Display string tuning:**
```typescript
{CLASSICAL_GUITAR_STRINGS.map(str => (
  <div key={str.number}>
    String {str.number}: {str.label} ({str.openNote}{str.octave})
  </div>
))}
```

**Show practice strategies:**
```typescript
{PRACTICE_STRATEGIES.map(strategy => (
  <div key={strategy.name}>
    <h3>{strategy.name}</h3>
    <p>{strategy.description}</p>
    <p>Duration: {strategy.duration} min</p>
    <p>Level: {strategy.difficulty}</p>
  </div>
))}
```

**Reference learning phases:**
```typescript
const currentPhase = LEARNING_PHASES[0]; // Phase 1
console.log(`Target frets: ${currentPhase.targetFrets[0]}-${currentPhase.targetFrets[1]}`);
console.log(`Note types: ${currentPhase.noteTypes.join(', ')}`);
```

## Integration Scenarios

### Scenario 1: Add a Theory Tab to Main App

In your App.tsx:

```typescript
import NoteReferencePage from './components/NoteReferencePage';

export default function App() {
  const [activeTab, setActiveTab] = useState('reading');

  return (
    <div className="app">
      <nav className="tabs">
        <button 
          className={activeTab === 'reading' ? 'active' : ''}
          onClick={() => setActiveTab('reading')}
        >
          Reading
        </button>
        <button 
          className={activeTab === 'theory' ? 'active' : ''}
          onClick={() => setActiveTab('theory')}
        >
          Theory
        </button>
        {/* other tabs */}
      </nav>

      <main>
        {activeTab === 'reading' && <ReadingTab />}
        {activeTab === 'theory' && <NoteReferencePage />}
        {/* other tab content */}
      </main>
    </div>
  );
}
```

### Scenario 2: Add Fretboard Reference to Reading Tab

In ReadingTab.tsx:

```typescript
import FretboardDiagram from './FretboardDiagram';

export default function ReadingTab() {
  const [showReference, setShowReference] = useState(false);

  return (
    <div className="reading-tab">
      <div className="reading-exercise">
        {/* existing reading quiz */}
      </div>

      {showReference && (
        <div className="reference-panel">
          <FretboardDiagram maxFret={12} />
        </div>
      )}

      <button onClick={() => setShowReference(!showReference)}>
        {showReference ? 'Hide Reference' : 'Show Reference'}
      </button>
    </div>
  );
}
```

### Scenario 3: Show Fretboard with Current Note Highlighted

In a custom component:

```typescript
import FretboardDiagram from './FretboardDiagram';
import { findFretPositions } from '../lib/theory';

interface HighlightedFretboardProps {
  note: string;
  octave: number;
}

export default function HighlightedFretboard({ note, octave }: HighlightedFretboardProps) {
  const positions = findFretPositions(note, octave);
  const [highlightPos, setHighlightPos] = useState(positions[0] || null);

  return (
    <div>
      <FretboardDiagram 
        maxFret={12}
        highlightString={highlightPos?.[0]}
        highlightFret={highlightPos?.[1]}
      />
      
      <div>
        <p>Other positions for {note}{octave}:</p>
        {positions.map(([str, fret], idx) => (
          <button 
            key={idx}
            onClick={() => setHighlightPos([str, fret])}
          >
            String {str + 1}, Fret {fret}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Scenario 4: Create a Learning Progress Tracker

```typescript
import { LEARNING_PHASES } from '../lib/noteReadingTheory';

export default function LearningProgress() {
  const [currentPhase, setCurrentPhase] = useState(0);

  return (
    <div className="learning-progress">
      <h2>Your Learning Journey</h2>
      
      {LEARNING_PHASES.map((phase, idx) => (
        <div 
          key={phase.phase}
          className={idx === currentPhase ? 'active' : 'inactive'}
        >
          <h3>{phase.name}</h3>
          <p>{phase.description}</p>
          <p>Duration: {phase.duration}</p>
          <p>Target frets: {phase.targetFrets[0]}-{phase.targetFrets[1]}</p>
          
          {phase.tips.length > 0 && (
            <div>
              <h4>Tips:</h4>
              <ul>
                {phase.tips.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            </div>
          )}
          
          {idx < LEARNING_PHASES.length - 1 && (
            <button onClick={() => setCurrentPhase(idx + 1)}>
              Next Phase →
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Scenario 5: Practice Strategy Selector

```typescript
import { PRACTICE_STRATEGIES } from '../lib/noteReadingTheory';

export default function PracticeMenu() {
  const [selectedStrategy, setSelectedStrategy] = useState(0);

  const strategy = PRACTICE_STRATEGIES[selectedStrategy];

  return (
    <div className="practice-menu">
      <h2>Select Practice Method</h2>
      
      <div className="strategies">
        {PRACTICE_STRATEGIES.map((s, idx) => (
          <button
            key={s.name}
            className={idx === selectedStrategy ? 'selected' : ''}
            onClick={() => setSelectedStrategy(idx)}
          >
            {s.name}
            <span className="difficulty">{s.difficulty}</span>
          </button>
        ))}
      </div>

      <div className="strategy-details">
        <h3>{strategy.name}</h3>
        <p>{strategy.description}</p>
        <p>⏱️ {strategy.duration} minutes</p>
        <p>Difficulty: {strategy.difficulty}</p>
        
        <h4>Steps:</h4>
        <ol>
          {strategy.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>

        <button className="start-practice">Start Practice →</button>
      </div>
    </div>
  );
}
```

## Styling Considerations

The new components use CSS custom properties for theming. Ensure your app defines:

```css
:root {
  --bg-1: #ffffff;
  --bg-2: #f5f5f5;
  --border: #ddd;
  --text: #333;
  --text-2: #666;
  --accent: #ff6b6b;
}
```

## File Structure

After integration, your project structure will be:

```
src/
├── components/
│   ├── NoteReferencePage.tsx       (NEW)
│   ├── FretboardDiagram.tsx        (NEW)
│   ├── ReadingTab.tsx              (existing)
│   ├── Staff.tsx                   (existing)
│   ├── Fretboard.tsx               (existing)
│   └── ...
├── lib/
│   ├── theory.ts                   (existing)
│   ├── noteReadingTheory.ts        (NEW)
│   ├── audio.ts                    (existing)
│   └── ...
├── App.tsx                         (update to include new routes)
└── main.tsx

/
├── NOTE_READING_GUIDE.md           (NEW)
├── IMPLEMENTATION_SUMMARY.md       (NEW)
├── README.md                       (existing)
└── ...
```

## Testing the Integration

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Test components:**
   - Check NoteReferencePage renders correctly
   - Verify FretboardDiagram displays all strings and frets
   - Test interactive features (fret range selector, etc.)
   - Verify note labels match the fretboard mapping

4. **Check data access:**
   ```typescript
   // In browser console
   import { CLASSICAL_GUITAR_STRINGS } from './lib/noteReadingTheory'
   console.log(CLASSICAL_GUITAR_STRINGS);
   ```

## API Reference

### NoteReferencePage
- No props (standalone component)
- Returns: Full theory reference page

### FretboardDiagram
- `maxFret`: number (default: 12)
- `highlightString`: number (default: -1, none)
- `highlightFret`: number (default: -1, none)
- `showNoteNames`: boolean (default: true)

### Data Exports
All exported from `noteReadingTheory.ts`:
- `CLASSICAL_GUITAR_STRINGS`: StringInfo[]
- `KEY_INTERVALS`: IntervalReference[]
- `ACCIDENTAL_INFO`: AccidentalInfo[]
- `ENHARMONIC_PAIRS`: Record<string, string>
- `LEARNING_PHASES`: LearningPhase[]
- `PRACTICE_STRATEGIES`: PracticeStrategy[]
- `NOTE_READING_FAQ`: FAQ[]
- `COMMON_MISTAKES`: CommonMistake[]

## Troubleshooting

**Problem:** Components not rendering
- Solution: Ensure CSS custom properties are defined in your root CSS

**Problem:** Missing note names on fretboard
- Solution: Check `showNoteNames` prop is true (default)

**Problem:** Data import errors
- Solution: Verify import paths match your project structure

**Problem:** Styling looks off
- Solution: Check that parent components aren't overriding SVG styles

## Performance Notes

- FretboardDiagram with maxFret > 20 may need optimization
- NoteReferencePage renders large table - consider virtualizing if needed
- Theory data is static and can be cached/memoized

## Accessibility

Recommendations:
- Add ARIA labels to interactive elements
- Ensure keyboard navigation works for fretboard diagram
- Provide text alternatives for all visual diagrams
- Test with screen readers

## Future Enhancements

Consider these additions:
1. MIDI playback of notes
2. Printable fretboard charts
3. Custom tuning support (non-standard tunings)
4. Scale degree visualization
5. Interval highlighting
6. Chord diagram generator
