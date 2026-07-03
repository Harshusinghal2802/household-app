import React, { useState, useEffect } from 'react';
import { RiCloseLine } from 'react-icons/ri';

const today = () => new Date().toISOString().split('T')[0];

export default function MilkModal({ entry, suppliers, onSave, onClose }) {
  const [form, setForm] = useState({
    date: today(), morningQty: '', eveningQty: '',
    fatPercent: '', ratePerLiter: '', supplier: '', notes: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (entry) {
      setForm({
        date: entry.date ? entry.date.split('T')[0] : today(),
        morningQty: entry.morningQty ?? '',
        eveningQty: entry.eveningQty ?? '',
        fatPercent: entry.fatPercent ?? '',
        ratePerLiter: entry.ratePerLiter ?? '',
        supplier: entry.supplier?._id || entry.supplier || '',
        notes: entry.notes || ''
      });
    }
  }, [entry]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const totalQty = (parseFloat(form.morningQty) || 0) + (parseFloat(form.eveningQty) || 0);
  const totalAmt = totalQty * (parseFloat(form.ratePerLiter) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await onSave({
        date: form.date,
        morningQty: parseFloat(form.morningQty) || 0,
        eveningQty: parseFloat(form.eveningQty) || 0,
        fatPercent: parseFloat(form.fatPercent) || 0,
        ratePerLiter: parseFloat(form.ratePerLiter) || 0,
        supplier: form.supplier || undefined,
        notes: form.notes
      });
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 520, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 style={{ fontWeight: 700, margin: 0 }}>{entry ? '✏️ Edit Milk Entry' : '🥛 Add Milk Entry'}</h4>
          <button onClick={onClose} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <RiCloseLine />
          </button>
        </div>

        {/* Live calc */}
        {totalQty > 0 && (
          <div style={{ background: 'rgba(79,156,249,0.08)', border: '1px solid rgba(79,156,249,0.2)', borderRadius: 14, padding: '14px 18px', marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL</div>
              <div style={{ fontWeight: 800, color: '#4f9cf9', fontSize: '1.1rem' }}>{totalQty.toFixed(1)} L</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>AMOUNT</div>
              <div style={{ fontWeight: 800, color: '#a855f7', fontSize: '1.1rem' }}>PKR {totalAmt.toFixed(0)}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <label style={labelStyle}>Date *</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="form-control-dark" style={{ width: '100%' }} required />
            </div>
            <div className="col-6">
              <label style={labelStyle}>Morning (L)</label>
              <input type="number" step="0.1" min="0" value={form.morningQty} onChange={e => set('morningQty', e.target.value)} className="form-control-dark" style={{ width: '100%' }} placeholder="0.0" />
            </div>
            <div className="col-6">
              <label style={labelStyle}>Evening (L)</label>
              <input type="number" step="0.1" min="0" value={form.eveningQty} onChange={e => set('eveningQty', e.target.value)} className="form-control-dark" style={{ width: '100%' }} placeholder="0.0" />
            </div>
            <div className="col-6">
              <label style={labelStyle}>Fat % </label>
              <input type="number" step="0.1" min="0" max="100" value={form.fatPercent} onChange={e => set('fatPercent', e.target.value)} className="form-control-dark" style={{ width: '100%' }} placeholder="e.g. 3.5" />
            </div>
            <div className="col-6">
              <label style={labelStyle}>Rate per Liter *</label>
              <input type="number" step="1" min="0" value={form.ratePerLiter} onChange={e => set('ratePerLiter', e.target.value)} className="form-control-dark" style={{ width: '100%' }} placeholder="e.g. 120" required />
            </div>
            <div className="col-12">
              <label style={labelStyle}>Supplier</label>
              <select value={form.supplier} onChange={e => set('supplier', e.target.value)} className="form-control-dark" style={{ width: '100%' }}>
                <option value="">— Select Supplier —</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-12">
              <label style={labelStyle}>Notes</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} className="form-control-dark" style={{ width: '100%', resize: 'vertical', minHeight: 72 }} placeholder="Optional notes..." />
            </div>
          </div>

          <div className="d-flex gap-3 mt-4">
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            <button type="submit" className="btn-primary-custom" style={{ flex: 2, padding: '12px', opacity: saving ? 0.7 : 1 }} disabled={saving}>
              {saving ? 'Saving...' : entry ? 'Update Entry' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: 7, color: 'var(--text-secondary)' };
