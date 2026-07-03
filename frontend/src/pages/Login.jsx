import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: '20px', position: 'relative'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(79,156,249,0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #4f9cf9, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, boxShadow: '0 8px 32px rgba(79,156,249,0.3)'
          }}>🥛</div>
          <h1 style={{ fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.03em' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Sign in to your Doodh Ledger account</p>
        </div>

        <div className="glass-card" style={{ padding: 36 }}>
          {error && (
            <div style={{
              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 12, padding: '12px 16px', marginBottom: 20,
              color: '#f87171', fontSize: '0.875rem'
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 8, color: 'var(--text-secondary)' }}>
                Email Address
              </label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange}
                className="form-control-dark" style={{ width: '100%' }}
                placeholder="you@example.com" required
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 8, color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} name="password"
                  value={form.password} onChange={handleChange}
                  className="form-control-dark" style={{ width: '100%', paddingRight: 48 }}
                  placeholder="••••••••" required
                />
                <button
                  type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showPass ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit" className="btn-primary-custom w-100"
              disabled={loading}
              style={{ padding: '13px', fontSize: '0.95rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign up free
            </Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none' }}>
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
