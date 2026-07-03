import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { RiDropLine, RiDropFill, RiFireLine, RiMoneyDollarCircleLine, RiAddLine, RiArrowRightLine } from 'react-icons/ri';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, monthNames } from '../utils/helpers';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const curr = user?.currency || 'PKR';

  useEffect(() => {
    api.get('/dashboard').then(res => setData(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
      <div className="spinner-ring" />
    </div>
  );

  const cards = [
    { label: 'Milk This Month', icon: <RiDropLine />, color: '#4f9cf9', value: data?.cards?.milk?.qty?.toFixed(1) + ' L', sub: formatCurrency(data?.cards?.milk?.amount, curr), link: '/milk' },
    { label: 'Water This Month', icon: <RiDropFill />, color: '#38bdf8', value: (data?.cards?.water?.cans || 0) + ' Cans', sub: formatCurrency(data?.cards?.water?.amount, curr), link: '/water' },
    { label: 'Gas This Month', icon: <RiFireLine />, color: '#fb923c', value: (data?.cards?.gas?.cylinders || 0) + ' Cyl.', sub: formatCurrency(data?.cards?.gas?.amount, curr), link: '/gas' },
    { label: 'Total Expenses', icon: <RiMoneyDollarCircleLine />, color: '#a855f7', value: formatCurrency(data?.cards?.totalExpenses, curr), sub: 'This month', link: '/billing' },
  ];

  // Build trend data
  const buildTrendLabels = (trendArr) => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return MONTHS[d.getMonth()];
    });
  };
  const labels = buildTrendLabels(data?.trends?.milk);

  const fillTrend = (trendArr, key) => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const found = trendArr?.find(x => x._id.month === d.getMonth() + 1 && x._id.year === d.getFullYear());
      return found ? found[key] : 0;
    });
  };

  const chartDefaults = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(13,18,37,0.9)', padding: 12, cornerRadius: 10 } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(240,244,255,0.5)', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(240,244,255,0.5)', font: { size: 11 } } }
    }
  };

  const milkChartData = {
    labels,
    datasets: [{
      label: 'Liters', data: fillTrend(data?.trends?.milk, 'totalQty'),
      borderColor: '#4f9cf9', backgroundColor: 'rgba(79,156,249,0.1)',
      borderWidth: 2.5, fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#4f9cf9'
    }]
  };

  const expenseDonut = {
    labels: ['Milk', 'Water', 'Gas'],
    datasets: [{
      data: [data?.cards?.milk?.amount || 0, data?.cards?.water?.amount || 0, data?.cards?.gas?.amount || 0],
      backgroundColor: ['rgba(79,156,249,0.8)', 'rgba(56,189,248,0.8)', 'rgba(251,146,60,0.8)'],
      borderColor: ['#4f9cf9', '#38bdf8', '#fb923c'],
      borderWidth: 2
    }]
  };

  const totalExp = (data?.cards?.milk?.amount || 0) + (data?.cards?.water?.amount || 0) + (data?.cards?.gas?.amount || 0);

  return (
    <div className="fade-in">
      <div className="page-header d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
          <h1>Good {new Date().getHours() < 12 ? 'Morning' : 'Evening'}, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Here's your household summary for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4 stagger">
        {cards.map((card, i) => (
          <div key={i} className="col-sm-6 col-xl-3">
            <Link to={card.link} style={{ textDecoration: 'none' }}>
              <div className="stat-card" style={{ '--card-accent': card.color + '33' }}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: card.color + '20', border: `1px solid ${card.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: card.color, fontSize: '1.3rem'
                  }}>{card.icon}</div>
                  <RiArrowRightLine style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }} />
                </div>
                <div className="amount-display" style={{ color: card.color }}>{card.value}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>{card.sub}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8, fontWeight: 600 }}>{card.label}</div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="row g-3 mb-4">
        {/* Milk Trend */}
        <div className="col-lg-8">
          <div className="glass-card" style={{ padding: 24 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 style={{ fontWeight: 700, margin: 0 }}>Milk Consumption Trend</h5>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Last 6 months</div>
              </div>
              <div style={{
                background: 'rgba(79,156,249,0.1)', color: '#4f9cf9',
                borderRadius: 8, padding: '4px 12px', fontSize: '0.8rem', fontWeight: 600
              }}>Liters</div>
            </div>
            <div className="chart-wrapper" style={{ height: 220 }}>
              <Line data={milkChartData} options={chartDefaults} />
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="col-lg-4">
          <div className="glass-card" style={{ padding: 24, height: '100%' }}>
            <h5 style={{ fontWeight: 700, marginBottom: 4 }}>Expense Breakdown</h5>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>This month</div>
            <div className="chart-wrapper" style={{ height: 180 }}>
              <Doughnut data={expenseDonut} options={{
                ...chartDefaults,
                cutout: '72%',
                plugins: { ...chartDefaults.plugins, legend: { display: true, position: 'bottom', labels: { color: 'rgba(240,244,255,0.6)', font: { size: 11 }, padding: 16 } } }
              }} />
            </div>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>{formatCurrency(totalExp, curr)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions + Recent */}
      <div className="row g-3">
        {/* Quick Add */}
        <div className="col-lg-4">
          <div className="glass-card" style={{ padding: 24 }}>
            <h5 style={{ fontWeight: 700, marginBottom: 20 }}>Quick Add</h5>
            <div className="d-flex flex-column gap-3">
              {[
                { to: '/milk', color: '#4f9cf9', icon: '🥛', label: 'Add Milk Entry' },
                { to: '/water', color: '#38bdf8', icon: '💧', label: 'Add Water Delivery' },
                { to: '/gas', color: '#fb923c', icon: '🔥', label: 'Add Gas Cylinder' },
              ].map(item => (
                <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 16px', borderRadius: 14,
                    background: item.color + '12', border: `1px solid ${item.color}30`,
                    transition: 'all 0.2s', cursor: 'pointer'
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                    <span style={{ fontWeight: 600, color: item.color, fontSize: '0.9rem' }}>{item.label}</span>
                    <RiAddLine style={{ marginLeft: 'auto', color: item.color }} />
                  </div>
                </Link>
              ))}
            </div>

            {/* Gas status */}
            {data?.lastGasRefill && (
              <div style={{ marginTop: 24, padding: '14px', borderRadius: 14, background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)' }}>
                <div style={{ fontSize: '0.75rem', color: '#fb923c', fontWeight: 700, marginBottom: 4 }}>🔥 LAST GAS REFILL</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {new Date(data.lastGasRefill.deliveryDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                {data.lastGasRefill.nextRefillDate && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Est. next: {new Date(data.lastGasRefill.nextRefillDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Milk */}
        <div className="col-lg-8">
          <div className="glass-card" style={{ padding: 24 }}>
            <div className="d-flex justify-content-between align-items-center mb-20" style={{ marginBottom: 20 }}>
              <h5 style={{ fontWeight: 700, margin: 0 }}>Recent Milk Entries</h5>
              <Link to="/milk" style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
                View all →
              </Link>
            </div>
            {data?.recentMilk?.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="table-dark-custom w-100">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Morning</th>
                      <th>Evening</th>
                      <th>Total</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentMilk.map(e => (
                      <tr key={e._id}>
                        <td style={{ fontWeight: 600 }}>{new Date(e.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</td>
                        <td>{e.morningQty} L</td>
                        <td>{e.eveningQty} L</td>
                        <td><span style={{ color: '#4f9cf9', fontWeight: 600 }}>{e.totalQty} L</span></td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(e.totalAmount, curr)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <RiDropLine />
                <div>No milk entries yet</div>
                <Link to="/milk" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>Add your first entry →</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
