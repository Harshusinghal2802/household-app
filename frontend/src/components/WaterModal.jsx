import React, { useState, useEffect } from 'react';
import { RiCloseLine } from 'react-icons/ri';

const today = () => new Date().toISOString().split('T')[0];
const labelStyle = { display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: 7, color: 'var(--text-secondary)' };

export default function WaterModal({ entry, suppliers, onSave, onClose }) {
  const [form, setForm] = useState({ date: today(), numberOfCans: '', ratePerCan: '', supplier: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (entry) setForm({
      date: entry.date ? entry.date.split('T')[0] : today(),
      numberOfCans: entry.numberOfCans ?? '',
      ratePerCan: entry.ratePerCan ?? '',
      supplier: entry.supplier?._id || entry.supplier || '',
      notes: entry.notes || ''
    });
  }, [entry]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const total = (parseInt(form.numberOfCans) || 0) * (parseFloat(form.ratePerCan) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await onSave({
        date: form.date,
        numberOfCans: parseInt(form.numberOfCans),
        ratePerCan: parseFloat(form.ratePerCan),
        supplier: form.supplier || undefined,
        notes: form.notes
      });
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 460, padding: 32 }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 style={{ fontWeight: 700, margin: 0 }}>{entry ? '✏️ Edit Water Entry' : '💧 Add Water Delivery'}</h4>
          <button onClick={onClose} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><RiCloseLine /></button>
        </div>

        {total > 0 && (
          <div style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 14, padding: '14px 18px', marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>CANS</div>
              <div style={{ fontWeight: 800, color: '#38bdf8', fontSize: '1.1rem' }}>{form.numberOfCans}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL</div>
              <div style={{ fontWeight: 800, color: '#a855f7', fontSize: '1.1rem' }}>PKR {total.toFixed(0)}</div>
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
              <label style={labelStyle}>Number of Cans *</label>
              <input type="number" min="1" value={form.numberOfCans} onChange={e => set('numberOfCans', e.target.value)} className="form-control-dark" style={{ width: '100%' }} placeholder="e.g. 2" required />
            </div>
            <div className="col-6">
              <label style={labelStyle}>Rate per Can *</label>
              <input type="number" step="1" min="0" value={form.ratePerCan} onChange={e => set('ratePerCan', e.target.value)} className="form-control-dark" style={{ width: '100%' }} placeholder="e.g. 150" required />
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
