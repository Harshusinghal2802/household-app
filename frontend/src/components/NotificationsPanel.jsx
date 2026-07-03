import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiDeleteBinLine, RiCheckDoubleLine, RiBellLine } from 'react-icons/ri';
import { useNotif } from '../context/NotifContext';
import { formatDate } from '../utils/helpers';

const TYPE_ICONS = {
  gas_reminder: '⚠️',
  water_reminder: '💧',
  bill_ready: '📄',
  info: 'ℹ️',
  warning: '⚠️'
};

export default function NotificationsPanel({ onClose }) {
  const { notifications, fetchNotifications, markAllRead, deleteNotif } = useNotif();
  const panelRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = async (notif) => {
    if (notif.link) { navigate(notif.link); onClose(); }
  };

  return (
    <div ref={panelRef} style={{
      position: 'absolute', top: 'calc(100% + 10px)', right: 0,
      width: 340, maxHeight: 480,
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      backdropFilter: 'blur(20px)',
      zIndex: 500, overflow: 'hidden',
      display: 'flex', flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notifications</div>
        {notifications.some(n => !n.isRead) && (
          <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <RiCheckDoubleLine /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <RiBellLine style={{ fontSize: '2rem', marginBottom: 10, opacity: 0.4 }} />
            <div style={{ fontSize: '0.875rem' }}>No notifications</div>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n._id}
              onClick={() => handleClick(n)}
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border)',
                cursor: n.link ? 'pointer' : 'default',
                background: n.isRead ? 'transparent' : 'rgba(79,156,249,0.04)',
                transition: 'background 0.2s',
                display: 'flex', alignItems: 'flex-start', gap: 12
              }}
            >
              <span style={{ fontSize: '1.2rem', marginTop: 2, flexShrink: 0 }}>{TYPE_ICONS[n.type] || 'ℹ️'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: '0.88rem', marginBottom: 3 }}>{n.title}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.4 }}>{n.message}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.73rem', marginTop: 5 }}>{formatDate(n.createdAt)}</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteNotif(n._id); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, borderRadius: 6, flexShrink: 0, opacity: 0.6 }}
              >
                <RiDeleteBinLine size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
