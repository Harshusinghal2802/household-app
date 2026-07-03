import React from 'react';
import { Link } from 'react-router-dom';
import { RiDropLine, RiDropFill, RiFireLine, RiBarChart2Line, RiShieldCheckLine, RiSmartphoneLine } from 'react-icons/ri';

const features = [
  { icon: <RiDropLine />, color: '#4f9cf9', title: 'Milk Tracking', desc: 'Log morning & evening quantities, fat %, rates and get monthly summaries automatically.' },
  { icon: <RiDropFill />, color: '#38bdf8', title: 'Water Records', desc: 'Track water can deliveries, costs per can and monthly consumption trends.' },
  { icon: <RiFireLine />, color: '#fb923c', title: 'Gas Monitoring', desc: 'Record cylinder deliveries, track usage duration and get refill reminders.' },
  { icon: <RiBarChart2Line />, color: '#a855f7', title: 'Smart Analytics', desc: 'Beautiful charts and insights on your monthly and yearly household expenses.' },
  { icon: <RiShieldCheckLine />, color: '#34d399', title: 'Secure & Private', desc: 'Your data is protected with JWT authentication and encrypted storage.' },
  { icon: <RiSmartphoneLine />, color: '#f472b6', title: 'Works Offline', desc: 'Install as a PWA on your phone. Works even without internet connection.' },
];

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
      {/* Background effects */}
      <div style={{
        position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
        width: '80vw', height: '60vh',
        background: 'radial-gradient(ellipse, rgba(79,156,249,0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div className="d-flex align-items-center gap-3">
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #4f9cf9, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
          }}>🥛</div>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>Doodh Ledger</span>
        </div>
        <div className="d-flex gap-3">
          <Link to="/login" style={{
            padding: '10px 20px', borderRadius: 12, fontWeight: 600,
            color: 'var(--text-secondary)', textDecoration: 'none',
            border: '1px solid var(--border)', transition: 'all 0.2s',
            background: 'var(--glass-bg)'
          }}>Login</Link>
          <Link to="/signup" className="btn-primary-custom" style={{ padding: '10px 20px', borderRadius: 12, textDecoration: 'none', display: 'inline-block' }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '100px 20px 80px', position: 'relative' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(79,156,249,0.1)', border: '1px solid rgba(79,156,249,0.3)',
          borderRadius: 20, padding: '6px 16px', marginBottom: 32,
          fontSize: '0.8rem', fontWeight: 600, color: '#4f9cf9'
        }}>
          ✨ Free for personal use
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 800,
          letterSpacing: '-0.04em', lineHeight: 1.05,
          maxWidth: 800, margin: '0 auto 24px',
          background: 'linear-gradient(135deg, #f0f4ff 30%, #4f9cf9 70%, #a855f7)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Track Every Drop.<br />Save Every Rupee.
        </h1>

        <p style={{
          fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: 520,
          margin: '0 auto 48px', lineHeight: 1.7
        }}>
          The smartest way to manage your milk, water and gas expenses.
          Beautiful insights. Zero complexity.
        </p>

        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <Link to="/signup" className="btn-primary-custom" style={{ padding: '14px 32px', fontSize: '1rem', borderRadius: 14, textDecoration: 'none' }}>
            Start Tracking Free →
          </Link>
          <Link to="/login" style={{
            padding: '14px 32px', borderRadius: 14, fontWeight: 600,
            color: 'var(--text-secondary)', textDecoration: 'none',
            border: '1px solid var(--border)', background: 'var(--glass-bg)',
            backdropFilter: 'blur(10px)', fontSize: '1rem'
          }}>
            Sign In
          </Link>
        </div>

        {/* Stats */}
        <div className="d-flex justify-content-center gap-5 flex-wrap mt-5" style={{ color: 'var(--text-secondary)' }}>
          {[['🥛', 'Milk Tracking'], ['💧', 'Water Logs'], ['🔥', 'Gas Records'], ['📊', 'Analytics']].map(([e, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem' }}>{e}</div>
              <div style={{ fontSize: '0.8rem', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '60px 40px 100px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>
          Everything you need
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 56 }}>
          Purpose-built for Pakistani households
        </p>

        <div className="row g-4 stagger">
          {features.map((f, i) => (
            <div key={i} className="col-md-6 col-lg-4">
              <div className="glass-card h-100" style={{ padding: 28 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${f.color}20`,
                  border: `1px solid ${f.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', color: f.color, marginBottom: 16
                }}>{f.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '60px 20px 100px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(79,156,249,0.1), rgba(168,85,247,0.1))',
          border: '1px solid rgba(79,156,249,0.2)',
          borderRadius: 28, padding: '60px 40px', maxWidth: 600, margin: '0 auto'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 16 }}>Ready to get started?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Free. No credit card. Forever yours.</p>
          <Link to="/signup" className="btn-primary-custom" style={{ padding: '14px 40px', fontSize: '1rem', borderRadius: 14, textDecoration: 'none' }}>
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '24px', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        © 2025 Doodh Ledger. Made with 🥛 for Pakistani households.
      </footer>
    </div>
  );
}
