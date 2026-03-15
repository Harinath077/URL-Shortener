import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Link2, Github, Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const addToast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      addToast('Logged in successfully', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = typeof err.response?.data === 'string' 
        ? err.response.data 
        : (err.response?.data?.message || 'Invalid credentials');
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <Link2 size={18} /> brevly.io
        </Link>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Welcome back</h2>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>Sign in to manage your links</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="auth-field-group">
            <label className="auth-label">Email or username</label>
            <div className="auth-input-wrapper">
              <Mail className="auth-input-icon" size={16} />
              <input 
                type="text" 
                className="auth-input" 
                placeholder="name@company.com" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="auth-field-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="auth-label" style={{ marginBottom: 0 }}>Password</label>
              <Link to="#" style={{ fontSize: '13px', color: '#2563EB', fontWeight: '500', textDecoration: 'none' }} onMouseEnter={e => e.target.style.textDecoration='underline'} onMouseLeave={e => e.target.style.textDecoration='none'}>Forgot password?</Link>
            </div>
            <div className="auth-input-wrapper">
              <Lock className="auth-input-icon" size={16} />
              <input 
                type={showPass ? 'text' : 'password'} 
                className="auth-input" 
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required 
              />
              <span className="auth-eye-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </span>
            </div>
          </div>

          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Sign in'}
          </button>
        </form>

        <div className="auth-divider">
          or continue with
        </div>

        <button className="auth-btn-github">
          <Github size={16} color="#111827" /> Sign in with GitHub
        </button>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register free</Link>
        </div>
      </div>
    </div>
  );
}
