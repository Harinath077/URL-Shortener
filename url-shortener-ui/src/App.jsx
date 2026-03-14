import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import AuthGuard from './components/AuthGuard';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={<AuthGuard><Dashboard /></AuthGuard>}
            />
            {/* Alias /dashboard/links to dashboard */}
            <Route
              path="/dashboard/links"
              element={<Navigate to="/dashboard" replace />}
            />
            <Route
              path="/dashboard/analytics/:code"
              element={<AuthGuard><Analytics /></AuthGuard>}
            />
            <Route
              path="/dashboard/settings"
              element={<AuthGuard><div className="flex h-screen items-center justify-center dashboard-shell text-center"><div className="text-muted"><h2 className="font-bold text-xl mb-2 text-text">Account Settings</h2>Under construction</div></div></AuthGuard>}
            />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
