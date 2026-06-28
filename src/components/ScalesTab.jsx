// ScalesTab.jsx — Phase 2 placeholder

export default function ScalesTab() {
  return (
    <div className="scales-layout">
      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="card-header">
          <span className="card-label">Scale trainer</span>
          <span className="badge badge-soon">Coming in phase 2</span>
        </div>
        <p style={{ color: 'var(--text-2)', marginTop: '1rem', fontSize: 14, lineHeight: 1.7 }}>
          The scale trainer will let you drill major, minor, pentatonic, and blues
          scales in every position — with audio feedback via the Web Audio API.
        </p>
        <ul className="upcoming-list">
          {[
            'Position-by-position scale patterns',
            'Ascending and descending drill mode',
            'Tempo control with click track',
            'CAGED system overview',
            'Interval trainer',
          ].map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
