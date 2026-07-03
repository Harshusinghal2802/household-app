import React, { useState, useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { RiBarChart2Line, RiDownload2Line } from 'react-icons/ri';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, monthNames } from '../utils/helpers';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const gridColor = 'rgba(255,255,255,0.06)';
const tickColor = 'rgba(240,244,255,0.45)';

const baseOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: 'rgba(10,15,30,0.92)', padding: 14, cornerRadius: 12, titleFont: { size: 13 }, bodyFont: { size: 12 } }
  },
  scales: {
    x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 } } },
    y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 } } }
  }
};

export default function Reports() {
  const { user } = useAuth();
  const curr = user?.currency || 'PKR';
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/analytics/yearly?year=${year}`)
      .then(r => setAnalytics(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year]);

  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}><div className="spinner-ring" /></div>;
  if (!analytics) return null;

  const { milkByMonth, waterByMonth, gasByMonth, totals } = analytics;

  // Chart datasets
  const milkAmountData = {
    labels: MONTHS_SHORT,
    datasets: [{
      label: 'Milk Expense', data: milkByMonth.map(m => m.amount || 0),
      backgroundColor: 'rgba(79,156,249,0.7)', borderColor: '#4f9cf9',
      borderRadius: 8, borderWidth: 2
    }]
  };

  const milkQtyData = {
    labels: MONTHS_SHORT,
    datasets: [{
      label: 'Liters', data: milkByMonth.map(m => m.qty || 0),
      borderColor: '#4f9cf9', backgroundColor: 'rgba(79,156,249,0.1)',
      fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#4f9cf9', borderWidth: 2.5
    }]
  };

  const waterData = {
    labels: MONTHS_SHORT,
    datasets: [{
      label: 'Cans', data: waterByMonth.map(m => m.cans || 0),
      backgroundColor: 'rgba(56,189,248,0.7)', borderColor: '#38bdf8',
      borderRadius: 8, borderWidth: 2
    }]
  };

  const gasData = {
    labels: MONTHS_SHORT,
    datasets: [{
      label: 'Gas Cost', data: gasByMonth.map(m => m.amount || 0),
      backgroundColor: 'rgba(251,146,60,0.7)', borderColor: '#fb923c',
      borderRadius: 8, borderWidth: 2
    }]
  };

  const totalByMonth = MONTHS_SHORT.map((_, i) => (milkByMonth[i]?.amount||0) + (waterByMonth[i]?.amount||0) + (gasByMonth[i]?.amount||0));
  const expenseTrendData = {
    labels: MONTHS_SHORT,
    datasets: [
      { label: 'Milk', data: milkByMonth.map(m => m.amount||0), backgroundColor: 'rgba(79,156,249,0.75)', borderRadius: 6 },
      { label: 'Water', data: waterByMonth.map(m => m.amount||0), backgroundColor: 'rgba(56,189,248,0.75)', borderRadius: 6 },
      { label: 'Gas', data: gasByMonth.map(m => m.amount||0), backgroundColor: 'rgba(251,146,60,0.75)', borderRadius: 6 },
    ]
  };

  const donutData = {
    labels: ['Milk', 'Water', 'Gas'],
    datasets: [{
      data: [totals.milk.amount, totals.water.amount, totals.gas.amount],
      backgroundColor: ['rgba(79,156,249,0.8)','rgba(56,189,248,0.8)','rgba(251,146,60,0.8)'],
      borderColor: ['#4f9cf9','#38bdf8','#fb923c'], borderWidth: 2, hoverOffset: 8
    }]
  };

  const stackedOptions = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      legend: {
        display: true,
        labels: { color: tickColor, font: { size: 11 }, boxWidth: 14, padding: 16 }
      }
    },
    scales: { ...baseOptions.scales, x: { ...baseOptions.scales.x, stacked: true }, y: { ...baseOptions.scales.y, stacked: true } }
  };

  return (
    <div className="fade-in">
      <div className="page-header d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div><h1>📊 Reports & Analytics</h1><p>Yearly breakdown of your household expenses</p></div>
        <select value={year} onChange={e => setYear(Number(e.target.value))} className="form-control-dark" style={{ width: 110 }}>
          {[thisYear-2, thisYear-1, thisYear].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Annual Summary Cards */}
      <div className="row g-3 mb-4 stagger">
        {[
          { label: `Total Milk (${year})`, value: `${totals.milk.qty.toFixed(0)} L`, sub: formatCurrency(totals.milk.amount, curr), color: '#4f9cf9', icon: '🥛' },
          { label: `Total Water (${year})`, value: `${totals.water.cans} Cans`, sub: formatCurrency(totals.water.amount, curr), color: '#38bdf8', icon: '💧' },
          { label: `Total Gas (${year})`, value: `${totals.gas.cylinders} Cyl.`, sub: formatCurrency(totals.gas.amount, curr), color: '#fb923c', icon: '🔥' },
          { label: `Grand Total (${year})`, value: formatCurrency(totals.grandTotal, curr), sub: `Avg ${formatCurrency(totals.grandTotal/12, curr)}/mo`, color: '#a855f7', icon: '💰' },
        ].map((c, i) => (
          <div key={i} className="col-6 col-lg-3">
            <div className="stat-card" style={{ '--card-accent': c.color + '22' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: 12 }}>{c.icon}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: c.color, letterSpacing: '-0.03em' }}>{c.value}</div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginTop: 4 }}>{c.sub}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="row g-3 mb-3">
        <div className="col-lg-8">
          <div className="glass-card" style={{ padding: 24 }}>
            <h6 style={{ fontWeight: 700, marginBottom: 4 }}>Expense Breakdown by Month</h6>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>Stacked monthly costs across all categories</p>
            <div style={{ height: 240 }}>
              <Bar data={expenseTrendData} options={stackedOptions} />
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="glass-card" style={{ padding: 24, height: '100%' }}>
            <h6 style={{ fontWeight: 700, marginBottom: 4 }}>Annual Share</h6>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>Category distribution</p>
            <div style={{ height: 190 }}>
              <Doughnut data={donutData} options={{
                ...baseOptions, cutout: '68%',
                plugins: {
                  ...baseOptions.plugins,
                  legend: { display: true, position: 'bottom', labels: { color: tickColor, font: { size: 10 }, padding: 14, boxWidth: 12 } }
                }
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <div className="glass-card" style={{ padding: 24 }}>
            <div className="d-flex align-items-center gap-2 mb-4">
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4f9cf9' }} />
              <h6 style={{ fontWeight: 700, margin: 0 }}>Milk Consumption Trend</h6>
            </div>
            <div style={{ height: 200 }}>
              <Line data={milkQtyData} options={baseOptions} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="glass-card" style={{ padding: 24 }}>
            <div className="d-flex align-items-center gap-2 mb-4">
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4f9cf9' }} />
              <h6 style={{ fontWeight: 700, margin: 0 }}>Milk Monthly Cost</h6>
            </div>
            <div style={{ height: 200 }}>
              <Bar data={milkAmountData} options={baseOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="row g-3">
        <div className="col-md-6">
          <div className="glass-card" style={{ padding: 24 }}>
            <div className="d-flex align-items-center gap-2 mb-4">
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#38bdf8' }} />
              <h6 style={{ fontWeight: 700, margin: 0 }}>Water Can Deliveries</h6>
            </div>
            <div style={{ height: 200 }}>
              <Bar data={waterData} options={baseOptions} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="glass-card" style={{ padding: 24 }}>
            <div className="d-flex align-items-center gap-2 mb-4">
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fb923c' }} />
              <h6 style={{ fontWeight: 700, margin: 0 }}>Gas Expenditure</h6>
            </div>
            <div style={{ height: 200 }}>
              <Bar data={gasData} options={baseOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly breakdown table */}
      <div className="glass-card mt-3" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h6 style={{ fontWeight: 700, margin: 0 }}>Monthly Summary Table — {year}</h6>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-dark-custom w-100">
            <thead>
              <tr>
                <th>Month</th>
                <th>Milk (L)</th>
                <th>Milk Cost</th>
                <th>Water (Cans)</th>
                <th>Water Cost</th>
                <th>Gas (Cyl.)</th>
                <th>Gas Cost</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {MONTHS_SHORT.map((m, i) => {
                const total = (milkByMonth[i]?.amount||0) + (waterByMonth[i]?.amount||0) + (gasByMonth[i]?.amount||0);
                return (
                  <tr key={m}>
                    <td style={{ fontWeight: 600 }}>{monthNames[i]}</td>
                    <td style={{ color: '#4f9cf9' }}>{(milkByMonth[i]?.qty||0).toFixed(1)}</td>
                    <td>{formatCurrency(milkByMonth[i]?.amount||0, curr)}</td>
                    <td style={{ color: '#38bdf8' }}>{waterByMonth[i]?.cans||0}</td>
                    <td>{formatCurrency(waterByMonth[i]?.amount||0, curr)}</td>
                    <td style={{ color: '#fb923c' }}>{gasByMonth[i]?.cylinders||0}</td>
                    <td>{formatCurrency(gasByMonth[i]?.amount||0, curr)}</td>
                    <td style={{ fontWeight: 700, color: total > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {formatCurrency(total, curr)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: 'rgba(79,156,249,0.06)', fontWeight: 700 }}>
                <td style={{ padding: '14px 16px' }}>Annual Total</td>
                <td style={{ padding: '14px 16px', color: '#4f9cf9' }}>{totals.milk.qty.toFixed(0)} L</td>
                <td style={{ padding: '14px 16px', color: '#4f9cf9' }}>{formatCurrency(totals.milk.amount, curr)}</td>
                <td style={{ padding: '14px 16px', color: '#38bdf8' }}>{totals.water.cans}</td>
                <td style={{ padding: '14px 16px', color: '#38bdf8' }}>{formatCurrency(totals.water.amount, curr)}</td>
                <td style={{ padding: '14px 16px', color: '#fb923c' }}>{totals.gas.cylinders}</td>
                <td style={{ padding: '14px 16px', color: '#fb923c' }}>{formatCurrency(totals.gas.amount, curr)}</td>
                <td style={{ padding: '14px 16px', color: '#a855f7', fontSize: '1rem' }}>{formatCurrency(totals.grandTotal, curr)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
