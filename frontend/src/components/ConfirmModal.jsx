import React from 'react';
import { RiAlertLine } from 'react-icons/ri';

export default function ConfirmModal({ message, onConfirm, onClose, confirmLabel = 'Delete', confirmColor = '#f87171' }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 380, padding: 32, textAlign: 'center' }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%', margin: '0 auto 20px',
          background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <RiAlertLine style={{ color: '#f87171', fontSize: '1.6rem' }} />
        </div>
        <h5 style={{ fontWeight: 700, marginBottom: 10 }}>Are you sure?</h5>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 28 }}>{message}</p>
        <div className="d-flex gap-3">
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '12px', borderRadius: 12, background: `${confirmColor}18`, border: `1px solid ${confirmColor}40`, color: confirmColor, cursor: 'pointer', fontWeight: 700 }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
