import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Link2, Github, Eye, EyeOff, Mail, Lock } from 'lucide-react';
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
      addToast(err.response?.data?.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <Link to="/" className="auth-logo">
            <Link2 size={24} /> short.ly
          </Link>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to manage your links</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Username / Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input 
                  type="text" 
                  className="input input-padded" 
                  placeholder="name@company.com" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <div className="flex justify-between items-center mb-1">
                <label className="form-label mb-0">Password</label>
                <Link to="#" className="forgot-link">Forgot password?</Link>
              </div>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input 
                  type={showPass ? 'text' : 'password'} 
                  className="input input-padded" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required 
                />
                <span className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', padding: '10px 16px', borderRadius: 8 }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div style={{display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0', fontSize: '0.8125rem', color: 'var(--text-muted)'}}>
            <div style={{flex: 1, height: 1, background: 'var(--border)'}}></div>
            or continue with
            <div style={{flex: 1, height: 1, background: 'var(--border)'}}></div>
          </div>

          <button className="btn btn-outline w-full" style={{justifyContent: 'center', padding: '10px 16px', borderRadius: 8}}>
            <Github size={18} /> GitHub
          </button>

          <div style={{textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 24}}>
            Don't have an account? <Link to="/register" style={{color: 'var(--primary)', fontWeight: 600}}>Register free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
