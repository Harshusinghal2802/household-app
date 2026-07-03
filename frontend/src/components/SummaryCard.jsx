import React from 'react';

export default function SummaryCard({ label, value, sub, color = 'var(--primary)', icon }) {
  return (
    <div style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--glass-border)',
      borderRadius: 18,
      padding: '20px 22px',
      transition: 'var(--transition)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: color + '18', filter: 'blur(20px)'
      }} />
      {icon && <div style={{ fontSize: '1.3rem', marginBottom: 10 }}>{icon}</div>}
      <div style={{ fontSize: '1.45rem', fontWeight: 800, color, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>{sub}</div>}
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
    </div>
  );
}
