import React, { useState, useEffect } from 'react';
import { RiCloseLine } from 'react-icons/ri';
import { cylinderTypeLabels } from '../utils/helpers';

const today = () => new Date().toISOString().split('T')[0];
const labelStyle = { display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: 7, color: 'var(--text-secondary)' };

export default function GasModal({ entry, suppliers, onSave, onClose }) {
  const [form, setForm] = useState({ deliveryDate: today(), cylinderCost: '', cylinderType: 'medium', supplier: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (entry) setForm({
      deliveryDate: entry.deliveryDate ? entry.deliveryDate.split('T')[0] : today(),
      cylinderCost: entry.cylinderCost ?? '',
      cylinderType: entry.cylinderType || 'medium',
      supplier: entry.supplier?._id || entry.supplier || '',
      notes: entry.notes || ''
    });
  }, [entry]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await onSave({
        deliveryDate: form.deliveryDate,
        cylinderCost: parseFloat(form.cylinderCost),
        cylinderType: form.cylinderType,
        supplier: form.supplier || undefined,
        notes: form.notes
      });
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 460, padding: 32 }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 style={{ fontWeight: 700, margin: 0 }}>{entry ? '✏️ Edit Gas Entry' : '🔥 Log Cylinder'}</h4>
          <button onClick={onClose} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><RiCloseLine /></button>
        </div>

        {form.cylinderCost && (
          <div style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: 14, padding: '14px 18px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>CYLINDER</div>
              <div style={{ fontWeight: 700, color: '#fb923c' }}>{cylinderTypeLabels[form.cylinderType]}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>COST</div>
              <div style={{ fontWeight: 800, color: '#a855f7', fontSize: '1.15rem' }}>PKR {parseFloat(form.cylinderCost || 0).toFixed(0)}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <label style={labelStyle}>Delivery Date *</label>
              <input type="date" value={form.deliveryDate} onChange={e => set('deliveryDate', e.target.value)} className="form-control-dark" style={{ width: '100%' }} required />
            </div>
            <div className="col-6">
              <label style={labelStyle}>Cylinder Type</label>
              <select value={form.cylinderType} onChange={e => set('cylinderType', e.target.value)} className="form-control-dark" style={{ width: '100%' }}>
                {Object.entries(cylinderTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="col-6">
              <label style={labelStyle}>Cost (PKR) *</label>
              <input type="number" step="1" min="0" value={form.cylinderCost} onChange={e => set('cylinderCost', e.target.value)} className="form-control-dark" style={{ width: '100%' }} placeholder="e.g. 2800" required />
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
              {saving ? 'Saving...' : entry ? 'Update Entry' : 'Log Cylinder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
