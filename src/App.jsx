// App.jsx — Shell: topbar, tab nav, panel routing

import { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import ReadingTab    from './components/ReadingTab';
import ExplorerTab   from './components/ExplorerTab';
import ScalesTab     from './components/ScalesTab';
import CagedTab      from './components/CagedTab';
import IntervalTab   from './components/IntervalTab';
import ChallengeTab  from './components/ChallengeTab';
import StatsTab      from './components/StatsTab';

const TABS = [
  { id: 'challenge', label: '⚡ Daily'      },
  { id: 'reading',   label: 'Note reading' },
  { id: 'fretboard', label: 'Fretboard'    },
  { id: 'scales',    label: 'Scales'       },
  { id: 'caged',     label: 'CAGED'        },
  { id: 'intervals', label: 'Intervals'    },
  { id: 'stats',     label: 'Statistics'   },
];

const PANELS = {
  challenge: <ChallengeTab />,
  reading:   <ReadingTab />,
  fretboard: <ExplorerTab />,
  scales:    <ScalesTab />,
  caged:     <CagedTab />,
  intervals: <IntervalTab />,
  stats:     <StatsTab />,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('reading');
  const { theme, toggle } = useTheme();

  return (
    <div id="app">
      {/* ── Top bar ── */}
      <header className="topbar">
        <div className="logo">
          <GuitarIcon />
          Guitar Trainer
        </div>

        <nav className="tab-nav" role="tablist" aria-label="Sections">
          {TABS.map(tab => (
            <button
              key={tab.id}
              role="tab"
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="topbar-actions">
          <button
            className="icon-btn"
            onClick={toggle}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title="Toggle dark mode"
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </header>

      {/* ── Panel host ── */}
      <main className="panel-host">
        {TABS.map(tab => (
          <section
            key={tab.id}
            role="tabpanel"
            hidden={activeTab !== tab.id}
            aria-label={tab.label}
          >
            {/* Mount lazily: only render when first visited */}
            {(activeTab === tab.id) && PANELS[tab.id]}
          </section>
        ))}
      </main>
    </div>
  );
}

// ── Inline icons ──────────────────────────────────────────────────

function GuitarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M13 2s2 2 2 5c0 1.8-.9 3.3-2.5 4.1L12 17a2 2 0 01-4 0l-.5-5.9C5.9 10.3 5 8.8 5 7c0-3 2-5 2-5"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="10" cy="7" r="1.8" fill="currentColor"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M12 10A6 6 0 015 3a6 6 0 100 9 6 6 0 007-2z"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M3 3l1 1M11 11l1 1M3 12l1-1M11 4l1-1"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}
