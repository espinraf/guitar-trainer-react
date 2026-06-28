/**
 * MidiPanel.jsx — MIDI connection status, device list, live note display.
 * Sits inside ReadingTab above the action bar.
 */

const STATUS_LABELS = {
  idle:        { text: 'MIDI available — click Connect',  color: 'var(--text-3)'   },
  pending:     { text: 'Checking MIDI support…',          color: 'var(--text-3)'   },
  unsupported: { text: 'Web MIDI not supported in this browser (try Chrome)', color: 'var(--danger)' },
  denied:      { text: 'MIDI access denied — check browser permissions',      color: 'var(--danger)' },
  'no-device': { text: 'No MIDI device detected — plug in your interface',   color: 'var(--warning)'},
  ready:       { text: 'Connected',                       color: 'var(--accent)'   },
};

export default function MidiPanel({
  status,
  enabled,
  devices,
  activeNote,
  lastNote,
  octaveStrict,
  onOctaveStrict,
  onEnable,
}) {
  const info = STATUS_LABELS[status] || STATUS_LABELS.idle;
  const canConnect = status === 'idle' && !enabled;
  const isReady    = status === 'ready';

  return (
    <div className="card midi-panel">
      <div className="card-header">
        <span className="card-label">MIDI input</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Octave-strict toggle */}
          {isReady && (
            <label className="toggle-row" style={{ gap: 6, fontSize: 11 }}>
              <span>Strict octave</span>
              <span
                className={`toggle-knob ${octaveStrict ? 'on' : ''}`}
                onClick={() => onOctaveStrict(!octaveStrict)}
              />
            </label>
          )}
          {canConnect && (
            <button className="btn btn-primary btn-sm" onClick={onEnable}>
              Connect
            </button>
          )}
        </div>
      </div>

      <div className="midi-body">
        {/* Status row */}
        <div className="midi-status-row">
          <span
            className="midi-dot"
            style={{ background: info.color }}
            aria-hidden="true"
          />
          <span style={{ fontSize: 12, color: info.color }}>{info.text}</span>
        </div>

        {/* Device list */}
        {isReady && devices.length > 0 && (
          <div className="midi-devices">
            {devices.map(d => (
              <div key={d.id} className="midi-device-chip">
                <MidiIcon />
                {d.name}
              </div>
            ))}
          </div>
        )}

        {/* Live note monitor */}
        {isReady && (
          <div className="midi-monitor">
            <div className="midi-monitor-label">Last note received</div>
            <div className={`midi-note-display ${activeNote ? 'active' : ''}`}>
              {lastNote ? (
                <>
                  <span className="midi-note-name">{lastNote.note}</span>
                  <span className="midi-note-octave">{lastNote.octave}</span>
                  <span className="midi-note-midi">MIDI {lastNote.midi}</span>
                </>
              ) : (
                <span className="midi-note-empty">Play a note…</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MidiIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="1" y="3" width="10" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="3.5" cy="6" r="0.8" fill="currentColor"/>
      <circle cx="6"   cy="6" r="0.8" fill="currentColor"/>
      <circle cx="8.5" cy="6" r="0.8" fill="currentColor"/>
    </svg>
  );
}
