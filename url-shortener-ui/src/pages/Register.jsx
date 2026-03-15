import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Link2, Github, Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
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
      const msg = typeof err.response?.data === 'string' 
        ? err.response.data 
        : (err.response?.data?.message || 'Registration failed');
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStrength = () => {
    if (password.length > 8) return { bars: 4, text: 'Strong', color: '#10B981' };
    if (password.length > 5) return { bars: 3, text: 'Good', color: '#3B82F6' };
    if (password.length > 2) return { bars: 2, text: 'Fair', color: '#F59E0B' };
    if (password.length > 0) return { bars: 1, text: 'Weak', color: '#EF4444' };
    return { bars: 0, text: '', color: 'transparent' };
  };

  const strength = getStrength();

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <Link2 size={18} /> brevly.io
        </Link>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Create your account</h2>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>Start shortening URLs for free</p>
        </div>

        <button className="auth-btn-github" style={{ marginBottom: '20px' }}>
          <Github size={16} color="#111827" /> Sign up with GitHub
        </button>

        <div className="auth-divider">
          or continue with email
        </div>

        <form onSubmit={handleRegister}>
          <div className="auth-field-group">
            <label className="auth-label">Username</label>
            <div className="auth-input-wrapper">
              <User className="auth-input-icon" size={16} />
              <input type="text" className="auth-input" placeholder="johndoe" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
          </div>

          <div className="auth-field-group">
            <label className="auth-label">Email address</label>
            <div className="auth-input-wrapper">
              <Mail className="auth-input-icon" size={16} />
              <input type="email" className="auth-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="auth-field-group" style={{ marginBottom: '18px' }}>
            <label className="auth-label">Password</label>
            <div className="auth-input-wrapper">
              <Lock className="auth-input-icon" size={16} />
              <input type={showPass ? 'text' : 'password'} className="auth-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              <span className="auth-eye-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </span>
            </div>
            {/* password strength bar */}
            <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} style={{ flex: 1, height: '3px', borderRadius: '2px', background: strength.bars >= idx ? strength.color : '#E5E7EB', transition: 'background 0.3s ease' }}></div>
              ))}
            </div>
            {strength.bars > 0 && <div style={{ fontSize: '12px', color: strength.color, marginTop: '4px', textAlign: 'right', fontWeight: '500' }}>{strength.text}</div>}
          </div>

          <div className="auth-field-group">
            <label className="auth-label">Confirm password</label>
            <div className="auth-input-wrapper">
              <Lock className="auth-input-icon" size={16} />
              <input type="password" className="auth-input" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Create account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
