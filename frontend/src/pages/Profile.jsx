import React, { useState } from 'react';
import { RiUserLine, RiLockLine, RiSaveLine, RiCheckLine } from 'react-icons/ri';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    address: user?.address || '', currency: user?.currency || 'PKR'
  });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleProfileSave = async (e) => {
    e.preventDefault(); setSaving(true); setError(''); setSaved(false);
    try {
      const { data } = await api.put('/auth/profile', profileForm);
      updateUser(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) { setError(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault(); setError('');
    if (passForm.newPassword !== passForm.confirmPassword) { setError('New passwords do not match'); return; }
    if (passForm.newPassword.length < 6) { setError('New password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      await api.put('/auth/password', { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (err) { setError(err.response?.data?.message || 'Password change failed'); }
    finally { setSaving(false); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="fade-in">
      <div className="page-header"><h1>👤 Profile</h1><p>Manage your account details</p></div>

      <div className="row g-4">
        {/* Avatar Card */}
        <div className="col-lg-3">
          <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
            <div style={{
              width: 88, height: 88, borderRadius: '50%', margin: '0 auto 16px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 800, color: 'white',
              boxShadow: '0 8px 32px rgba(79,156,249,0.4)'
            }}>{initials}</div>
            <h5 style={{ fontWeight: 700 }}>{user?.name}</h5>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.email}</p>
            <span style={{
              background: 'rgba(79,156,249,0.1)', color: 'var(--primary)',
              border: '1px solid rgba(79,156,249,0.2)',
              borderRadius: 8, padding: '4px 14px', fontSize: '0.78rem', fontWeight: 700
            }}>{user?.role?.toUpperCase()}</span>
            <div style={{ marginTop: 20, padding: '14px', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)', textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>MEMBER SINCE</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' }) : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="col-lg-9">
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
              {[['profile', <RiUserLine />, 'Profile Info'], ['password', <RiLockLine />, 'Change Password']].map(([t, icon, label]) => (
                <button key={t} onClick={() => { setTab(t); setError(''); setSaved(false); }} style={{
                  padding: '16px 24px', background: 'none', border: 'none',
                  borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
                  color: tab === t ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginBottom: -1, transition: 'color 0.2s'
                }}>{icon}{label}</button>
              ))}
            </div>

            <div style={{ padding: 32 }}>
              {error && (
                <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, color: '#f87171', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}
              {saved && (
                <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, color: '#34d399', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RiCheckLine /> Changes saved successfully!
                </div>
              )}

              {tab === 'profile' ? (
                <form onSubmit={handleProfileSave}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 8, color: 'var(--text-secondary)' }}>Full Name *</label>
                      <input value={profileForm.name} onChange={e => setProfileForm(p => ({...p, name: e.target.value}))} className="form-control-dark" style={{ width: '100%' }} required />
                    </div>
                    <div className="col-md-6">
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 8, color: 'var(--text-secondary)' }}>Email</label>
                      <input value={user?.email} className="form-control-dark" style={{ width: '100%', opacity: 0.5 }} disabled />
                    </div>
                    <div className="col-md-6">
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 8, color: 'var(--text-secondary)' }}>Phone</label>
                      <input value={profileForm.phone} onChange={e => setProfileForm(p => ({...p, phone: e.target.value}))} className="form-control-dark" style={{ width: '100%' }} placeholder="+92 300 1234567" />
                    </div>
                    <div className="col-md-6">
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 8, color: 'var(--text-secondary)' }}>Currency</label>
                      <select value={profileForm.currency} onChange={e => setProfileForm(p => ({...p, currency: e.target.value}))} className="form-control-dark" style={{ width: '100%' }}>
                        {['PKR','INR','USD','EUR','GBP','AED','SAR','BDT'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 8, color: 'var(--text-secondary)' }}>Address</label>
                      <textarea value={profileForm.address} onChange={e => setProfileForm(p => ({...p, address: e.target.value}))} className="form-control-dark" style={{ width: '100%', resize: 'vertical', minHeight: 80 }} placeholder="Street, City, Country" />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary-custom mt-4" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}>
                    <RiSaveLine />{saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePasswordSave}>
                  <div className="d-flex flex-column gap-3" style={{ maxWidth: 420 }}>
                    {[
                      ['currentPassword', 'Current Password', 'Enter your current password'],
                      ['newPassword', 'New Password', 'Min. 6 characters'],
                      ['confirmPassword', 'Confirm New Password', 'Repeat new password'],
                    ].map(([k, label, ph]) => (
                      <div key={k}>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 8, color: 'var(--text-secondary)' }}>{label}</label>
                        <input type="password" value={passForm[k]} onChange={e => setPassForm(p => ({...p, [k]: e.target.value}))} className="form-control-dark" style={{ width: '100%' }} placeholder={ph} required />
                      </div>
                    ))}
                  </div>
                  <button type="submit" className="btn-primary-custom mt-4" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}>
                    <RiLockLine />{saving ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
