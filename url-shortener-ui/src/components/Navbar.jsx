import { Link, useLocation } from 'react-router-dom';
import { Link2, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();
  const loc = useLocation();

  const navLinkStyle = {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-muted)',
    transition: 'color 0.15s ease'
  };

  const activeLinkStyle = {
    ...navLinkStyle,
    fontWeight: 600,
    color: 'var(--text)'
  };

  return (
    <nav className="navbar-wrapper">
      <div className="navbar-container">
        
        <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)', letterSpacing: '-0.02em', flexShrink: 0 }}>
          <Link2 size={24} style={{ color: 'var(--primary)' }} />
          brevly.io
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links">
          <Link to="/" style={loc.pathname === '/' ? activeLinkStyle : navLinkStyle} onMouseEnter={(e) => e.target.style.color = 'var(--text)'} onMouseLeave={(e) => loc.pathname !== '/' ? e.target.style.color = 'var(--text-muted)' : null}>Home</Link>
          <Link to="/dashboard" style={loc.pathname.includes('/dashboard') ? activeLinkStyle : navLinkStyle} onMouseEnter={(e) => e.target.style.color = 'var(--text)'} onMouseLeave={(e) => !loc.pathname.includes('/dashboard') ? e.target.style.color = 'var(--text-muted)' : null}>Analytics</Link>
          <Link to="/pricing" style={loc.pathname === '/pricing' ? activeLinkStyle : navLinkStyle} onMouseEnter={(e) => e.target.style.color = 'var(--text)'} onMouseLeave={(e) => loc.pathname !== '/pricing' ? e.target.style.color = 'var(--text-muted)' : null}>Pricing</Link>
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary" style={{ borderRadius: 6, padding: '8px 16px' }}>Dashboard</Link>
          ) : (
            <>
              <Link to="/login" style={{ ...navLinkStyle, fontWeight: 600 }} onMouseEnter={(e) => e.target.style.color = 'var(--text)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ borderRadius: 6, padding: '8px 16px' }}>Get Started</Link>
            </>
          )}
        </div>
        
      </div>
    </nav>
  );
}
