import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Link as LinkIcon, BarChart2, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const loc = useLocation();

  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar-logo">
        <LinkIcon size={22} />
        short.ly
      </Link>

      <div className="sidebar-nav">
        <Link to="/dashboard" className={`sidebar-link ${loc.pathname === '/dashboard' ? 'active' : ''}`}>
          <LayoutDashboard size={18} /> Dashboard
        </Link>
        <Link to="/dashboard/links" className={`sidebar-link ${loc.pathname === '/dashboard/links' ? 'active' : ''}`}>
          <LinkIcon size={18} /> My Links
        </Link>
        <Link to="/dashboard/analytics" className={`sidebar-link ${loc.pathname.includes('/analytics') ? 'active' : ''}`}>
          <BarChart2 size={18} /> Analytics
        </Link>
        <Link to="/dashboard/settings" className={`sidebar-link ${loc.pathname === '/dashboard/settings' ? 'active' : ''}`}>
          <Settings size={18} /> Settings
        </Link>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.username?.charAt(0).toUpperCase() || 'U'}</div>
          <div>
            <div className="sidebar-username">{user?.username || 'User'}</div>
            <div className="sidebar-email">Free Plan</div>
          </div>
        </div>
        <button className="sidebar-logout w-full mt-2" onClick={logout}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
