import React, { useState } from 'react';
import { RiBellLine, RiMoonLine, RiSunLine, RiCheckLine, RiSaveLine } from 'react-icons/ri';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Toggle = ({ checked, onChange, color = 'var(--primary)' }) => (
  <div
    onClick={onChange}
    style={{
      width: 48, height: 26, borderRadius: 13, cursor: 'pointer', position: 'relative',
      background: checked ? color : 'rgba(255,255,255,0.12)', transition: 'background 0.3s',
      border: `1px solid ${checked ? color : 'var(--border)'}`, flexShrink: 0
    }}
  >
    <div style={{
      width: 20, height: 20, borderRadius: '50%', background: 'white',
      position: 'absolute', top: 2, left: checked ? 24 : 3,
      transition: 'left 0.3s', boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
    }} />
  </div>
);

export default function Settings() {
  const { user, updateUser, darkMode, toggleDarkMode } = useAuth();
  const [notifs, setNotifs] = useState({
    cylinderReminder: user?.notifications?.cylinderReminder ?? true,
    waterReminder: user?.notifications?.waterReminder ?? true,
    monthlyBill: user?.notifications?.monthlyBill ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', { notifications: notifs, darkMode });
      updateUser(data.user);
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const SettingRow = ({ icon, title, desc, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', borderBottom: '1px solid var(--border)' }}>
      <div className="d-flex align-items-center gap-3">
        <div style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>{icon}</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{title}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <div className="fade-in">
      <div className="page-header"><h1>⚙️ Settings</h1><p>Customize your Doodh Ledger experience</p></div>

      <div className="row g-4">
        {/* Appearance */}
        <div className="col-lg-6">
          <div className="glass-card" style={{ padding: 28 }}>
            <h5 style={{ fontWeight: 700, marginBottom: 4 }}>Appearance</h5>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>Customize how Doodh Ledger looks</p>
            <SettingRow icon={darkMode ? <RiMoonLine /> : <RiSunLine />} title="Dark Mode" desc="Switch between dark and light theme">
              <Toggle checked={darkMode} onChange={toggleDarkMode} />
            </SettingRow>
          </div>
        </div>

        {/* Notifications */}
        <div className="col-lg-6">
          <div className="glass-card" style={{ padding: 28 }}>
            <h5 style={{ fontWeight: 700, marginBottom: 4 }}>Notifications</h5>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>Manage in-app alert preferences</p>
            <SettingRow icon={<RiBellLine />} title="Gas Cylinder Reminder" desc="Alert when cylinder is estimated to run out">
              <Toggle checked={notifs.cylinderReminder} onChange={() => setNotifs(p => ({...p, cylinderReminder: !p.cylinderReminder}))} color="#fb923c" />
            </SettingRow>
            <SettingRow icon={<RiBellLine />} title="Water Refill Reminder" desc="Notify when water delivery is due">
              <Toggle checked={notifs.waterReminder} onChange={() => setNotifs(p => ({...p, waterReminder: !p.waterReminder}))} color="#38bdf8" />
            </SettingRow>
            <SettingRow icon={<RiBellLine />} title="Monthly Bill Alert" desc="Notify when monthly bill is generated">
              <Toggle checked={notifs.monthlyBill} onChange={() => setNotifs(p => ({...p, monthlyBill: !p.monthlyBill}))} color="#4f9cf9" />
            </SettingRow>
          </div>
        </div>

        {/* About */}
        <div className="col-lg-6">
          <div className="glass-card" style={{ padding: 28 }}>
            <h5 style={{ fontWeight: 700, marginBottom: 20 }}>About Doodh Ledger</h5>
            {[
              ['Version', '1.0.0'],
              ['Build', 'Production'],
              ['Stack', 'MERN + PWA'],
              ['Logged in as', user?.name],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PWA Install */}
        <div className="col-lg-6">
          <div className="glass-card" style={{ padding: 28 }}>
            <h5 style={{ fontWeight: 700, marginBottom: 12 }}>📱 Install App</h5>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>
              Install Doodh Ledger on your device for offline access and a native app experience.
            </p>
            <div style={{ background: 'rgba(79,156,249,0.08)', borderRadius: 14, padding: 20, border: '1px solid rgba(79,156,249,0.2)' }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>How to install:</div>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', paddingLeft: 20, margin: 0, lineHeight: 2 }}>
                <li><strong>iOS Safari:</strong> Tap Share → Add to Home Screen</li>
                <li><strong>Android Chrome:</strong> Tap ⋮ → Add to Home Screen</li>
                <li><strong>Desktop Chrome:</strong> Click ⊕ in address bar</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="d-flex align-items-center gap-3 mt-4">
        <button onClick={handleSave} className="btn-primary-custom" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}>
          <RiSaveLine />{saving ? 'Saving...' : 'Save Settings'}
        </button>
        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#34d399', fontWeight: 600, fontSize: '0.9rem' }}>
            <RiCheckLine /> Saved!
          </div>
        )}
      </div>
    </div>
  );
}
