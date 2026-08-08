/**
 * Note Reading Theory Data
 * Based on "Part 1: Getting to know the classical guitar" - Fretboard reference chart
 * 
 * This file provides comprehensive data about:
 * - Classical guitar tuning
 * - Note positions on the fretboard
 * - Music theory fundamentals for note reading
 * - Practice strategies
 */

export interface StringInfo {
  number: number;
  label: string;
  openNote: string;
  octave: number;
  midi: number;
  position: 'lowest' | 'middle' | 'highest';
}

export interface IntervalReference {
  fret: number;
  name: string;
  semitones: number;
  description: string;
}

export interface AccidentalInfo {
  symbol: string;
  name: string;
  direction: 'up' | 'down';
  semitones: number;
  description: string;
}

/**
 * Classical Guitar Standard Tuning
 * From lowest string (6) to highest string (1)
 */
export const CLASSICAL_GUITAR_STRINGS: StringInfo[] = [
  {
    number: 6,
    label: 'E',
    openNote: 'E',
    octave: 2,
    midi: 40,
    position: 'lowest'
  },
  {
    number: 5,
    label: 'A',
    openNote: 'A',
    octave: 2,
    midi: 45,
    position: 'middle'
  },
  {
    number: 4,
    label: 'D',
    openNote: 'D',
    octave: 3,
    midi: 50,
    position: 'middle'
  },
  {
    number: 3,
    label: 'G',
    openNote: 'G',
    octave: 3,
    midi: 55,
    position: 'middle'
  },
  {
    number: 2,
    label: 'B',
    openNote: 'B',
    octave: 3,
    midi: 59,
    position: 'middle'
  },
  {
    number: 1,
    label: 'e',
    openNote: 'E',
    octave: 4,
    midi: 64,
    position: 'highest'
  }
];

/**
 * Key intervals on the fretboard
 * These are important reference points for learning the neck
 */
export const KEY_INTERVALS: IntervalReference[] = [
  {
    fret: 0,
    name: 'Open String',
    semitones: 0,
    description: 'The natural note of the open string'
  },
  {
    fret: 2,
    name: 'Major 2nd',
    semitones: 2,
    description: 'Two semitones above the open string'
  },
  {
    fret: 3,
    name: 'Minor 3rd',
    semitones: 3,
    description: 'Three semitones above the open string'
  },
  {
    fret: 4,
    name: 'Major 3rd',
    semitones: 4,
    description: 'Four semitones above the open string'
  },
  {
    fret: 5,
    name: 'Perfect 4th',
    semitones: 5,
    description: 'Five semitones above the open string - commonly used reference point'
  },
  {
    fret: 7,
    name: 'Perfect 5th',
    semitones: 7,
    description: 'Seven semitones above the open string - another key reference point'
  },
  {
    fret: 12,
    name: 'Octave',
    semitones: 12,
    description: 'One octave above the open string - same note name, higher pitch'
  }
];

/**
 * Accidental information
 */
export const ACCIDENTAL_INFO: AccidentalInfo[] = [
  {
    symbol: '#',
    name: 'Sharp',
    direction: 'up',
    semitones: 1,
    description: 'Raises a note by one semitone (half step)'
  },
  {
    symbol: 'b',
    name: 'Flat',
    direction: 'down',
    semitones: -1,
    description: 'Lowers a note by one semitone (half step)'
  }
];

/**
 * Enharmonic equivalents
 * Notes that sound the same but have different names
 */
export const ENHARMONIC_PAIRS: Record<string, string> = {
  'C#': 'Db',
  'Db': 'C#',
  'D#': 'Eb',
  'Eb': 'D#',
  'F#': 'Gb',
  'Gb': 'F#',
  'G#': 'Ab',
  'Ab': 'G#',
  'A#': 'Bb',
  'Bb': 'A#'
};

/**
 * Learning phases for progressive skill development
 */
export interface LearningPhase {
  phase: number;
  name: string;
  duration: string;
  focus: string[];
  targetFrets: [number, number];
  noteTypes: ('natural' | 'sharp' | 'flat')[];
  description: string;
  tips: string[];
}

export const LEARNING_PHASES: LearningPhase[] = [
  {
    phase: 1,
    name: 'Foundation: Natural Notes on Open Position',
    duration: '1-2 weeks',
    focus: [
      'Recognize the 7 natural notes (C, D, E, F, G, A, B)',
      'Master open string notes',
      'Understand note on the staff'
    ],
    targetFrets: [0, 4],
    noteTypes: ['natural'],
    description:
      'Start with the open strings and progress through the first few frets. ' +
      'Focus on reading notes on the treble clef staff and finding them on the fretboard. ' +
      'This builds the foundation for faster recognition.',
    tips: [
      'Practice every day, even for just 10 minutes',
      'Say the note name out loud when you play it',
      'Use the staff diagram alongside the fretboard',
      'Start with one string at a time if needed'
    ]
  },
  {
    phase: 2,
    name: 'Expansion: All Natural Notes on Full Neck',
    duration: '2-3 weeks',
    focus: [
      'Extend range to frets 5-12',
      'Build muscle memory across all strings',
      'Recognize note patterns'
    ],
    targetFrets: [0, 12],
    noteTypes: ['natural'],
    description:
      'Expand your knowledge of the fretboard by learning all positions of natural notes. ' +
      'Notice that most notes appear multiple times across different strings. ' +
      'This phase develops spatial understanding of the neck.',
    tips: [
      'Notice how the same note repeats on different strings',
      'Use fret 5, 7, and 12 as reference points',
      'Practice moving between strings for the same note',
      'Increase your speed gradually'
    ]
  },
  {
    phase: 3,
    name: 'Accidentals: Adding Sharps and Flats',
    duration: '2-3 weeks',
    focus: [
      'Understand sharps (#) and flats (b)',
      'Learn enharmonic equivalents',
      'Recognize chromatic notes'
    ],
    targetFrets: [0, 12],
    noteTypes: ['natural', 'sharp', 'flat'],
    description:
      'Add chromatic notes to your vocabulary. Understand how sharps raise notes ' +
      'and flats lower them. Learn which notes can be played with sharps or flats. ' +
      'This completes your 12-note chromatic knowledge.',
    tips: [
      'Remember: 5 natural notes have sharps (C#, D#, F#, G#, A#)',
      'Learn enharmonic pairs (C# = Db, D# = Eb, etc.)',
      'Practice both sharp and flat versions',
      'Understand musical context determines which to use'
    ]
  },
  {
    phase: 4,
    name: 'Mastery: Full Neck Command',
    duration: '4+ weeks',
    focus: [
      'Extended range (frets 12-24)',
      'Instant note recognition',
      'Fast finger placement',
      'Multiple positions per note'
    ],
    targetFrets: [0, 24],
    noteTypes: ['natural', 'sharp', 'flat'],
    description:
      'Achieve fretboard mastery by knowing all notes across the entire playable neck. ' +
      'At this level, note recognition becomes automatic, allowing you to focus on ' +
      'music interpretation and technique.',
    tips: [
      'Vary between music reading and ear training',
      'Practice different positions for the same note',
      'Use metronome to increase recognition speed',
      'Combine with scales and musical applications'
    ]
  }
];

/**
 * Practice strategies for effective learning
 */
export interface PracticeStrategy {
  name: string;
  description: string;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: string[];
}

export const PRACTICE_STRATEGIES: PracticeStrategy[] = [
  {
    name: 'Staff to Fretboard',
    description: 'Read notes from sheet music and find them on the fretboard',
    duration: 15,
    difficulty: 'beginner',
    steps: [
      'Look at a note on the treble staff',
      'Identify the note name',
      'Find all positions on the fretboard',
      'Click or play the note',
      'Verify with audio feedback'
    ]
  },
  {
    name: 'Fretboard Explorer',
    description: 'Click random frets and identify the notes',
    duration: 10,
    difficulty: 'beginner',
    steps: [
      'The system highlights a random fret',
      'Say the note name out loud',
      'Click to reveal the answer',
      'Practice all strings systematically'
    ]
  },
  {
    name: 'Speed Challenge',
    description: 'Improve recognition speed with timed challenges',
    duration: 20,
    difficulty: 'intermediate',
    steps: [
      'Select a time limit (e.g., 5 seconds per note)',
      'Read the staff note quickly',
      'Click the correct fret',
      'Track your accuracy and speed'
    ]
  },
  {
    name: 'String Study',
    description: 'Master one string at a time',
    duration: 10,
    difficulty: 'beginner',
    steps: [
      'Select a single string',
      'Learn all notes on that string (0-12 frets)',
      'Practice until instant recognition',
      'Move to next string'
    ]
  },
  {
    name: 'Octave Finder',
    description: 'Find the same note on different strings',
    duration: 15,
    difficulty: 'intermediate',
    steps: [
      'A note is shown on the staff',
      'Find the first position on the fretboard',
      'Find all other positions (octaves)',
      'Understand note relationships'
    ]
  }
];

/**
 * FAQ for note reading learners
 */
export interface FAQ {
  question: string;
  answer: string;
  relatedTopics: string[];
}

export const NOTE_READING_FAQ: FAQ[] = [
  {
    question: 'Why are there multiple positions for the same note?',
    answer:
      'The guitar fretboard overlaps notes across strings. Most notes appear multiple times ' +
      'in different positions, which gives flexibility in playing and helps create smooth finger movement.',
    relatedTopics: ['Fretboard mapping', 'String positions', 'Guitar voicings']
  },
  {
    question: 'What\'s the difference between C# and Db?',
    answer:
      'They sound exactly the same (enharmonic equivalents) but have different names. ' +
      'C# is used in sharp keys, Db in flat keys. The musical context determines which name to use.',
    relatedTopics: ['Accidentals', 'Key signatures', 'Enharmonic equivalents']
  },
  {
    question: 'How do I remember the open strings?',
    answer:
      'The easiest way: E-A-D-G-B-E from lowest to highest string. ' +
      'Some use mnemonics like "Eddie Ate Dynamite, Good Bye Eddie" for the 6 strings.',
    relatedTopics: ['Guitar tuning', 'Open strings', 'Beginner basics']
  },
  {
    question: 'Why do I need to know multiple positions for the same note?',
    answer:
      'Different positions offer different tonal qualities and allow smoother fingering patterns. ' +
      'Experienced guitarists automatically choose positions based on the musical context and what comes next.',
    relatedTopics: ['Technique', 'Finger positioning', 'Tone quality']
  },
  {
    question: 'What are ledger lines on the staff?',
    answer:
      'Ledger lines extend the staff above and below to show very high and very low notes. ' +
      'Each line or space represents a different note following the same pattern as the main staff.',
    relatedTopics: ['Staff notation', 'Extended range', 'Music reading']
  },
  {
    question: 'How long does it take to master note reading?',
    answer:
      'Most players reach basic competence (open position) in 1-2 weeks of daily practice. ' +
      'Full fretboard mastery typically takes 1-2 months of consistent practice.',
    relatedTopics: ['Practice tips', 'Learning phases', 'Goal setting']
  }
];

/**
 * Common mistakes to avoid
 */
export const COMMON_MISTAKES = [
  {
    mistake: 'Confusing natural notes with accidentals',
    solution: 'Remember: only 5 of the 12 chromatic notes use sharps (no E# or B#)',
    prevention: 'Practice natural notes thoroughly before adding sharps and flats'
  },
  {
    mistake: 'Memorizing positions instead of understanding patterns',
    solution: 'Always understand WHY a note is where it is',
    prevention: 'Use interval references (fret 5 = 4th, fret 7 = 5th, etc.)'
  },
  {
    mistake: 'Only learning on one string',
    solution: 'Practice all strings to build complete fretboard knowledge',
    prevention: 'Rotate through different strings during practice sessions'
  },
  {
    mistake: 'Ignoring the staff notation',
    solution: 'Staff reading is as important as fretboard positions',
    prevention: 'Always read from the staff first, then find on fretboard'
  },
  {
    mistake: 'Practicing too fast too soon',
    solution: 'Accuracy before speed - speed comes naturally with practice',
    prevention: 'Focus on correct identification, gradually increase tempo'
  }
];
