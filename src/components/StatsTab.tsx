import { useState, useCallback } from 'react';
import { storage } from '../lib/storage';

function computeStats() {
  const data  = storage.getAll();
  const notes = data.notes || {};
  const total = Object.values(notes).reduce((s: number, n: any) => s + Number(n.attempts || 0), 0);
  const corr  = Object.values(notes).reduce((s: number, n: any) => s + Number(n.correct  || 0), 0);

  const noteRows = Object.entries(notes).map(([label, n]: any) => ({ label, attempts: n.attempts || 0, correct: n.correct || 0, acc: n.attempts ? Math.round((n.correct / n.attempts) * 100) : 0 })).sort((a: any, b: any) => a.acc - b.acc);

  return { total, corr, sessions: data.sessions || 0, overallAcc: total ? Math.round(Number(corr) / Number(total) * 100) : null, noteRows };
}

export default function StatsTab() {
  const [stats, setStats] = useState<any>(computeStats);

  const handleClear = useCallback(() => {
    if (window.confirm('Clear all progress data? This cannot be undone.')) {
      storage.clear();
      setStats(computeStats());
    }
  }, []);

  const { total, corr, sessions, overallAcc, noteRows } = stats;

  const summaryCards = [
    { label: 'Total attempts', value: total },
    { label: 'Total correct',  value: corr  },
    { label: 'Overall accuracy', value: overallAcc !== null ? `${overallAcc}%` : '—' },
    { label: 'Sessions',       value: sessions },
  ];

  return (
    <div className="stats-layout">
      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="card-header"><span className="card-label">Your progress</span><button className="btn btn-ghost btn-sm" onClick={handleClear}>Clear data</button></div>
        <div className="stats-grid">{summaryCards.map(({ label, value }) => (<div key={label} className="stat-card"><div className="stat-label">{label}</div><div className="stat-value">{value}</div></div>))}</div>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
        <div className="card-header"><span className="card-label">Notes by accuracy</span><span style={{ fontSize: 11, color: 'var(--text-3)' }}>worst → best</span></div>
        {noteRows.length === 0 ? (<p className="empty-state">No data yet — start practicing!</p>) : (<div className="accuracy-chart">{noteRows.map(({ label, acc, attempts }: any) => (<div key={label} className="accuracy-row"><span className="accuracy-note">{label}</span><div className="accuracy-bar-wrap"><div className="accuracy-bar-fill" style={{ width: `${acc}%` }} /></div><span className="accuracy-pct">{acc}%</span><span className="accuracy-count">{attempts} tries</span></div>))}</div>) }
      </div>
    </div>
  );
}
