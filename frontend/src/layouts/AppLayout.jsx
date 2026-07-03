import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  RiDashboardLine, RiDropLine, RiDropFill, RiFireLine,
  RiUserLine, RiSettings3Line, RiBillLine, RiBarChart2Line,
  RiTruckLine, RiMenuLine, RiCloseLine, RiBellLine,
  RiLogoutBoxLine, RiMoonLine, RiSunLine
} from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import { useNotif } from '../context/NotifContext';
import NotificationsPanel from '../components/NotificationsPanel';

const navLinks = [
  { to: '/dashboard', icon: <RiDashboardLine />, label: 'Dashboard' },
  { to: '/milk', icon: <RiDropLine />, label: 'Milk Records' },
  { to: '/water', icon: <RiDropFill />, label: 'Water Records' },
  { to: '/gas', icon: <RiFireLine />, label: 'Gas Records' },
  { to: '/suppliers', icon: <RiTruckLine />, label: 'Suppliers' },
  { to: '/billing', icon: <RiBillLine />, label: 'Billing' },
  { to: '/reports', icon: <RiBarChart2Line />, label: 'Reports' },
];

const bottomLinks = [
  { to: '/profile', icon: <RiUserLine />, label: 'Profile' },
  { to: '/settings', icon: <RiSettings3Line />, label: 'Settings' },
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const { unreadCount, fetchNotifications } = useNotif();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { fetchNotifications(); }, []);
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 999, backdropFilter: 'blur(4px)'
          }}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="d-flex align-items-center gap-3">
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, boxShadow: '0 4px 16px var(--primary-glow)'
            }}>🥛</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Doodh Ledger</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>Household Tracker</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8, paddingLeft: 8 }}>
            MAIN MENU
          </div>
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}

          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', margin: '16px 0 8px', paddingLeft: 8 }}>
            ACCOUNT
          </div>
          {bottomLinks.map(link => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 12px', borderRadius: 12,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)'
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 700, color: 'white', flexShrink: 0
            }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
            </div>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, borderRadius: 8, transition: 'var(--transition)' }} title="Logout">
              <RiLogoutBoxLine size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar d-flex align-items-center justify-content-between mb-4" style={{ borderRadius: 16, marginBottom: '24px !important' }}>
          <div className="d-flex align-items-center gap-3">
            <button
              className="d-md-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: 4 }}
            >
              {sidebarOpen ? <RiCloseLine size={24} /> : <RiMenuLine size={24} />}
            </button>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button onClick={toggleDarkMode} style={{
              background: 'var(--glass-bg)', border: '1px solid var(--border)',
              borderRadius: 10, width: 38, height: 38,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-secondary)', transition: 'var(--transition)'
            }}>
              {darkMode ? <RiSunLine size={18} /> : <RiMoonLine size={18} />}
            </button>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                style={{
                  background: 'var(--glass-bg)', border: '1px solid var(--border)',
                  borderRadius: 10, width: 38, height: 38,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--text-secondary)', transition: 'var(--transition)'
                }}
              >
                <RiBellLine size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    background: 'var(--danger)', color: 'white',
                    borderRadius: '50%', width: 18, height: 18,
                    fontSize: '0.65rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>
              {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} />}
            </div>

            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700, color: 'white'
            }}>{initials}</div>
          </div>
        </div>

        {/* Page Content */}
        <Outlet />
      </div>
    </div>
  );
}
