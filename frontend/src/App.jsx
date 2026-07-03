import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotifProvider } from './context/NotifContext';

// Layouts
import AppLayout from './layouts/AppLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import MilkRecords from './pages/MilkRecords';
import WaterRecords from './pages/WaterRecords';
import GasRecords from './pages/GasRecords';
import Billing from './pages/Billing';
import Reports from './pages/Reports';
import Suppliers from './pages/Suppliers';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="spinner-ring"></div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

    <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/milk" element={<MilkRecords />} />
      <Route path="/water" element={<WaterRecords />} />
      <Route path="/gas" element={<GasRecords />} />
      <Route path="/suppliers" element={<Suppliers />} />
      <Route path="/billing" element={<Billing />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotifProvider>
          <AppRoutes />
        </NotifProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
