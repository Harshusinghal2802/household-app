import React, { useState, useEffect, useCallback } from 'react';
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiFireLine, RiDownload2Line, RiTimeLine } from 'react-icons/ri';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, getCurrentMonthYear, downloadCSV, monthNames, cylinderTypeLabels } from '../utils/helpers';
import GasModal from '../components/GasModal';
import SummaryCard from '../components/SummaryCard';
import ConfirmModal from '../components/ConfirmModal';

export default function GasRecords() {
  const { user } = useAuth();
  const curr = user?.currency || 'PKR';
  const { month: cm, year: cy } = getCurrentMonthYear();

  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({});
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(cm);
  const [year, setYear] = useState(cy);
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [eRes, sRes, supRes] = await Promise.all([
        api.get(`/gas?month=${month}&year=${year}`),
        api.get(`/gas/summary?month=${month}&year=${year}`),
        api.get('/suppliers?type=gas')
      ]);
      setEntries(eRes.data.data);
      setSummary(sRes.data.data);
      setSuppliers(supRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (formData) => {
    if (editEntry) await api.put(`/gas/${editEntry._id}`, formData);
    else await api.post('/gas', formData);
    setShowModal(false); setEditEntry(null);
    fetchData();
  };

  const handleDelete = async () => {
    await api.delete(`/gas/${deleteId}`);
    setDeleteId(null); fetchData();
  };

  const years = Array.from({ length: 5 }, (_, i) => cy - 2 + i);

  const daysUntilRefill = summary.nextRefillDate
    ? Math.ceil((new Date(summary.nextRefillDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="fade-in">
      <div className="page-header d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
          <h1>🔥 Gas Records</h1>
          <p>Track your gas cylinder deliveries and usage</p>
        </div>
        <div className="d-flex gap-2">
          <button onClick={() => { setEditEntry(null); setShowModal(true); }} className="btn-primary-custom"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RiAddLine /> Log Cylinder
          </button>
        </div>
      </div>

      {/* Refill Alert */}
      {daysUntilRefill !== null && daysUntilRefill <= 5 && (
        <div style={{
          background: daysUntilRefill <= 2 ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.1)',
          border: `1px solid ${daysUntilRefill <= 2 ? 'rgba(248,113,113,0.3)' : 'rgba(251,191,36,0.3)'}`,
          borderRadius: 16, padding: '16px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <span style={{ fontSize: '1.5rem' }}>{daysUntilRefill <= 0 ? '🚨' : '⚠️'}</span>
          <div>
            <strong style={{ color: daysUntilRefill <= 2 ? '#f87171' : '#fbbf24' }}>
              {daysUntilRefill <= 0 ? 'Gas cylinder may be empty!' : `Gas refill needed in ~${daysUntilRefill} days`}
            </strong>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Based on your average usage of {summary.avgDuration} days per cylinder
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="glass-card d-flex align-items-center gap-3 flex-wrap mb-4" style={{ padding: '16px 20px' }}>
        <RiFireLine style={{ color: '#fb923c', fontSize: '1.2rem' }} />
        <select value={month} onChange={e => setMonth(Number(e.target.value))} className="form-control-dark" style={{ width: 140 }}>
          {monthNames.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setYear(Number(e.target.value))} className="form-control-dark" style={{ width: 100 }}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Cylinders This Month', value: `${summary.totalCylinders || 0}`, color: '#fb923c' },
          { label: 'Total Gas Cost', value: formatCurrency(summary.totalCost, curr), color: '#a855f7' },
          { label: 'Avg Duration', value: summary.avgDuration ? `${summary.avgDuration} days` : 'N/A', color: '#34d399' },
          { label: 'Next Refill Est.', value: summary.nextRefillDate ? formatDate(summary.nextRefillDate, { day: 'numeric', month: 'short' }) : 'N/A', color: '#f472b6' },
        ].map((s, i) => (
          <div key={i} className="col-6 col-lg-3"><SummaryCard {...s} /></div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div className="d-flex justify-content-center p-5"><div className="spinner-ring" /></div>
          ) : entries.length === 0 ? (
            <div className="empty-state">
              <RiFireLine />
              <h5>No gas entries for this period</h5>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Log your first cylinder delivery</p>
            </div>
          ) : (
            <table className="table-dark-custom w-100">
              <thead>
                <tr>
                  <th>Delivery Date</th>
                  <th>Cylinder Type</th>
                  <th>Cost</th>
                  <th>Days Used</th>
                  <th>Next Refill</th>
                  <th>Supplier</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(e => {
                  const daysSince = Math.floor((new Date() - new Date(e.deliveryDate)) / (1000*60*60*24));
                  return (
                    <tr key={e._id}>
                      <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{formatDate(e.deliveryDate)}</td>
                      <td>
                        <span style={{
                          background: 'rgba(251,146,60,0.15)', color: '#fb923c',
                          borderRadius: 8, padding: '3px 10px', fontSize: '0.8rem', fontWeight: 600
                        }}>
                          {cylinderTypeLabels[e.cylinderType] || e.cylinderType}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(e.cylinderCost, curr)}</td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <RiTimeLine style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }} />
                          <span style={{ color: '#fb923c', fontWeight: 600 }}>{e.daysUsed ?? daysSince}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>days</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {e.nextRefillDate ? formatDate(e.nextRefillDate, { day: 'numeric', month: 'short' }) : '—'}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{e.supplier?.name || '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{e.notes || '—'}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button onClick={() => { setEditEntry(e); setShowModal(true); }}
                            style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: 8, color: '#fb923c', padding: '6px 10px', cursor: 'pointer' }}>
                            <RiEditLine />
                          </button>
                          <button onClick={() => setDeleteId(e._id)}
                            style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, color: '#f87171', padding: '6px 10px', cursor: 'pointer' }}>
                            <RiDeleteBinLine />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <GasModal entry={editEntry} suppliers={suppliers} onSave={handleSave} onClose={() => { setShowModal(false); setEditEntry(null); }} />
      )}
      {deleteId && (
        <ConfirmModal message="Delete this gas entry? This cannot be undone." onConfirm={handleDelete} onClose={() => setDeleteId(null)} />
      )}
    </div>
  );
}
