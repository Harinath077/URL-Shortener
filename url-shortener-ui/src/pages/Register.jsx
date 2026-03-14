import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Link2, Github, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const addToast = useToast();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      await register(username, email, password);
      // Auto login after register
      await login(username, password);
      addToast('Account created successfully', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStrength = () => {
    if (password.length > 8) return { width: '100%', bg: 'var(--success)' };
    if (password.length > 5) return { width: '60%', bg: 'var(--warning)' };
    if (password.length > 2) return { width: '30%', bg: 'var(--danger)' };
    return { width: '0%', bg: '#e2e8f0' };
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <Link to="/" className="auth-logo">
            <Link2 size={24} /> short.ly
          </Link>
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-subtitle">Start shortening URLs for free</p>

          <button className="btn btn-outline w-full" style={{justifyContent: 'center', padding: '10px 16px', borderRadius: 8, marginBottom: 16}}>
            <Github size={18} /> Sign up with GitHub
          </button>

          <div style={{display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0', fontSize: '0.8125rem', color: 'var(--text-muted)'}}>
            <div style={{flex: 1, height: 1, background: 'var(--border)'}}></div>
            or continue with email
            <div style={{flex: 1, height: 1, background: 'var(--border)'}}></div>
          </div>

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input type="text" className="input input-padded" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input type="email" className="input input-padded" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label mb-1">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input type={showPass ? 'text' : 'password'} className="input input-padded" value={password} onChange={e => setPassword(e.target.value)} required />
                <span className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </span>
              </div>
              <div className="strength-bar"><div className="strength-fill" style={{ width: getStrength().width, background: getStrength().bg }}></div></div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input type="password" className="input input-padded" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-2" style={{ justifyContent: 'center', padding: '10px 16px', borderRadius: 8 }} disabled={loading}>
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </form>

          <div style={{textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 24}}>
            Already have an account? <Link to="/login" style={{color: 'var(--primary)', fontWeight: 600}}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
