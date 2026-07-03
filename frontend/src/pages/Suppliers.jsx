import React, { useState, useEffect } from 'react';
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiTruckLine, RiDropLine, RiDropFill, RiFireLine } from 'react-icons/ri';
import api from '../api/axios';
import ConfirmModal from '../components/ConfirmModal';

const TYPE_CONFIG = {
  milk:  { icon: <RiDropLine />,  color: '#4f9cf9', label: 'Milk',  bg: 'rgba(79,156,249,0.1)',  border: 'rgba(79,156,249,0.2)'  },
  water: { icon: <RiDropFill />, color: '#38bdf8', label: 'Water', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.2)'  },
  gas:   { icon: <RiFireLine />,  color: '#fb923c', label: 'Gas',   bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)'  },
};

const emptyForm = { name: '', type: 'milk', phone: '', address: '', notes: '' };

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/suppliers');
      setSuppliers(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (s) => { setForm({ name: s.name, type: s.type, phone: s.phone||'', address: s.address||'', notes: s.notes||'' }); setEditId(s._id); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId) await api.put(`/suppliers/${editId}`, form);
      else await api.post('/suppliers', form);
      setShowModal(false); fetchSuppliers();
    } catch (err) { alert(err.response?.data?.message || 'Error saving supplier'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    await api.delete(`/suppliers/${deleteId}`);
    setDeleteId(null); fetchSuppliers();
  };

  const filtered = activeTab === 'all' ? suppliers : suppliers.filter(s => s.type === activeTab);

  return (
    <div className="fade-in">
      <div className="page-header d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
          <h1>🚚 Suppliers</h1>
          <p>Manage your milk, water and gas suppliers</p>
        </div>
        <button onClick={openAdd} className="btn-primary-custom" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RiAddLine /> Add Supplier
        </button>
      </div>

      {/* Tabs */}
      <div className="pill-tabs mb-4" style={{ width: 'fit-content' }}>
        {['all','milk','water','gas'].map(t => (
          <button key={t} className={`pill-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'all' ? 'All' : TYPE_CONFIG[t].label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="d-flex justify-content-center p-5"><div className="spinner-ring" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state glass-card" style={{ padding: 60 }}>
          <RiTruckLine />
          <h5>No suppliers yet</h5>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Add your first supplier to get started</p>
        </div>
      ) : (
        <div className="row g-3 stagger">
          {filtered.map(s => {
            const cfg = TYPE_CONFIG[s.type];
            return (
              <div key={s._id} className="col-md-6 col-xl-4">
                <div className="glass-card" style={{ padding: 24 }}>
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: cfg.bg, border: `1px solid ${cfg.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: cfg.color, fontSize: '1.2rem'
                      }}>{cfg.icon}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{s.name}</div>
                        <span style={{
                          background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                          borderRadius: 6, padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700
                        }}>{cfg.label}</span>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button onClick={() => openEdit(s)} style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 8, color: 'var(--text-secondary)', padding: '6px 10px', cursor: 'pointer'
                      }}><RiEditLine /></button>
                      <button onClick={() => setDeleteId(s._id)} style={{
                        background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
                        borderRadius: 8, color: '#f87171', padding: '6px 10px', cursor: 'pointer'
                      }}><RiDeleteBinLine /></button>
                    </div>
                  </div>
                  {s.phone && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>📞 {s.phone}</div>}
                  {s.address && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>📍 {s.address}</div>}
                  {s.notes && <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>{s.notes}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 480, padding: 32 }}>
            <h4 style={{ fontWeight: 700, marginBottom: 24 }}>{editId ? 'Edit Supplier' : 'Add Supplier'}</h4>
            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="form-label" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Supplier Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="form-control-dark" style={{ width: '100%' }} placeholder="e.g. Ahmed Dairy Farm" required />
              </div>
              <div className="mb-3">
                <label className="form-label" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Type *</label>
                <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))} className="form-control-dark" style={{ width: '100%' }}>
                  <option value="milk">🥛 Milk</option>
                  <option value="water">💧 Water</option>
                  <option value="gas">🔥 Gas</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Phone</label>
                <input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} className="form-control-dark" style={{ width: '100%' }} placeholder="+92 300 1234567" />
              </div>
              <div className="mb-3">
                <label className="form-label" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Address</label>
                <input value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))} className="form-control-dark" style={{ width: '100%' }} placeholder="Street, City" />
              </div>
              <div className="mb-4">
                <label className="form-label" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} className="form-control-dark" style={{ width: '100%', resize: 'vertical', minHeight: 80 }} placeholder="Any additional notes..." />
              </div>
              <div className="d-flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" className="btn-primary-custom" style={{ flex: 1, padding: '12px', opacity: saving ? 0.7 : 1 }} disabled={saving}>{saving ? 'Saving...' : 'Save Supplier'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <ConfirmModal message="Delete this supplier?" onConfirm={handleDelete} onClose={() => setDeleteId(null)} />
      )}
    </div>
  );
}
