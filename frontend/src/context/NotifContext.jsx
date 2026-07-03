import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const NotifContext = createContext(null);

export const NotifProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
    } catch {}
  }, []);

  const markAllRead = async () => {
    await api.put('/notifications/mark-read');
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotif = async (id) => {
    await api.delete(`/notifications/${id}`);
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  return (
    <NotifContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAllRead, deleteNotif }}>
      {children}
    </NotifContext.Provider>
  );
};

export const useNotif = () => useContext(NotifContext);
