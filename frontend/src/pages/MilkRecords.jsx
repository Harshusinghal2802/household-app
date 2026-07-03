import React, { useState, useEffect, useCallback } from 'react';
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiDropLine, RiDownload2Line, RiCalendarLine } from 'react-icons/ri';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, getCurrentMonthYear, downloadCSV, monthNames } from '../utils/helpers';
import MilkModal from '../components/MilkModal';
import SummaryCard from '../components/SummaryCard';
import ConfirmModal from '../components/ConfirmModal';

export default function MilkRecords() {
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
      const [entriesRes, summaryRes, suppRes] = await Promise.all([
        api.get(`/milk?month=${month}&year=${year}&limit=31`),
        api.get(`/milk/summary?month=${month}&year=${year}`),
        api.get('/suppliers?type=milk')
      ]);
      setEntries(entriesRes.data.data);
      setSummary(summaryRes.data.data);
      setSuppliers(suppRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (formData) => {
    if (editEntry) {
      await api.put(`/milk/${editEntry._id}`, formData);
    } else {
      await api.post('/milk', formData);
    }
    setShowModal(false); setEditEntry(null);
    fetchData();
  };

  const handleDelete = async () => {
    await api.delete(`/milk/${deleteId}`);
    setDeleteId(null);
    fetchData();
  };

  const handleExport = () => {
    const rows = entries.map(e => ({
      Date: formatDate(e.date),
      Morning_L: e.morningQty,
      Evening_L: e.eveningQty,
      Total_L: e.totalQty,
      Fat_Pct: e.fatPercent,
      Rate: e.ratePerLiter,
      Amount: e.totalAmount,
      Supplier: e.supplier?.name || '',
      Notes: e.notes || ''
    }));
    downloadCSV(rows, `milk-records-${monthNames[month-1]}-${year}.csv`);
  };

  const years = Array.from({ length: 5 }, (_, i) => cy - 2 + i);

  return (
    <div className="fade-in">
      <div className="page-header d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
          <h1>🥛 Milk Records</h1>
          <p>Track your daily milk consumption</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button onClick={handleExport} style={{
            background: 'var(--glass-bg)', border: '1px solid var(--border)', borderRadius: 12,
            color: 'var(--text-secondary)', padding: '10px 16px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: '0.875rem'
          }}>
            <RiDownload2Line /> Export CSV
          </button>
          <button onClick={() => { setEditEntry(null); setShowModal(true); }} className="btn-primary-custom"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RiAddLine /> Add Entry
          </button>
        </div>
      </div>

      {/* Month/Year Filter */}
      <div className="glass-card d-flex align-items-center gap-3 flex-wrap mb-4" style={{ padding: '16px 20px' }}>
        <RiCalendarLine style={{ color: 'var(--primary)', fontSize: '1.2rem' }} />
        <select value={month} onChange={e => setMonth(Number(e.target.value))}
          className="form-control-dark" style={{ width: 140 }}>
          {monthNames.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setYear(Number(e.target.value))}
          className="form-control-dark" style={{ width: 100 }}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Showing {entries.length} entries
        </span>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Liters', value: `${(summary.totalQty || 0).toFixed(2)} L`, color: '#4f9cf9' },
          { label: 'Monthly Bill', value: formatCurrency(summary.totalAmount, curr), color: '#a855f7' },
          { label: 'Avg Daily', value: `${summary.days ? (summary.totalQty/summary.days).toFixed(1) : 0} L`, color: '#34d399' },
          { label: 'Avg Fat %', value: `${(summary.avgFat || 0).toFixed(1)}%`, color: '#fbbf24' },
        ].map((s, i) => (
          <div key={i} className="col-6 col-lg-3">
            <SummaryCard {...s} />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div className="d-flex justify-content-center p-5"><div className="spinner-ring" /></div>
          ) : entries.length === 0 ? (
            <div className="empty-state">
              <RiDropLine />
              <h5>No milk entries for this period</h5>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Click "Add Entry" to log your first milk record</p>
            </div>
          ) : (
            <table className="table-dark-custom w-100">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Morning (L)</th>
                  <th>Evening (L)</th>
                  <th>Total (L)</th>
                  <th>Fat %</th>
                  <th>Rate/L</th>
                  <th>Amount</th>
                  <th>Supplier</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e._id}>
                    <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{formatDate(e.date)}</td>
                    <td>{e.morningQty}</td>
                    <td>{e.eveningQty}</td>
                    <td><span style={{ color: '#4f9cf9', fontWeight: 700 }}>{e.totalQty}</span></td>
                    <td>{e.fatPercent ? `${e.fatPercent}%` : '—'}</td>
                    <td>{formatCurrency(e.ratePerLiter, curr)}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(e.totalAmount, curr)}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{e.supplier?.name || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.notes || '—'}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button onClick={() => { setEditEntry(e); setShowModal(true); }}
                          style={{ background: 'rgba(79,156,249,0.1)', border: '1px solid rgba(79,156,249,0.2)', borderRadius: 8, color: '#4f9cf9', padding: '6px 10px', cursor: 'pointer' }}>
                          <RiEditLine />
                        </button>
                        <button onClick={() => setDeleteId(e._id)}
                          style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, color: '#f87171', padding: '6px 10px', cursor: 'pointer' }}>
                          <RiDeleteBinLine />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'rgba(255,255,255,0.03)', fontWeight: 700 }}>
                  <td colSpan={3} style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>Monthly Total</td>
                  <td style={{ padding: '14px 16px', color: '#4f9cf9' }}>{(summary.totalQty||0).toFixed(2)} L</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{(summary.avgFat||0).toFixed(1)}% avg</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{formatCurrency(summary.avgRate||0, curr)} avg</td>
                  <td style={{ padding: '14px 16px', color: '#a855f7' }}>{formatCurrency(summary.totalAmount||0, curr)}</td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <MilkModal
          entry={editEntry}
          suppliers={suppliers}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditEntry(null); }}
        />
      )}

      {deleteId && (
        <ConfirmModal
          message="Delete this milk entry? This cannot be undone."
          onConfirm={handleDelete}
          onClose={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
