import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  BarChart2, Trash2, Copy, Check, Link2, ExternalLink,
  MousePointerClick, Calendar as CalIcon, ArrowRight, LinkIcon,
  ChevronDown
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../api/axios';

export default function Dashboard() {
  const { user } = useAuth();
  const [urls, setUrls] = useState([]);
  
  // Dev: Redirects happen on port 8080. Prod: redirects happen on brevly.io.
  const redirectBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
  const [loading, setLoading] = useState(true);
  const [shrUrl, setShrUrl] = useState('');
  const [expiryDays, setExpiryDays] = useState('');
  const [shortening, setShortening] = useState(false);
  const [recentResult, setRecentResult] = useState(null);
  const [copiedRecent, setCopiedRecent] = useState(false);

  const addToast = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => { fetchUrls(); }, []);

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const res = await api.get('/urls');
      setUrls(res.data || []);
      // Backend already returns newest-first — use index 0
      if (res.data?.length > 0) setRecentResult(res.data[0]);
    } catch (err) {
      addToast('Failed to load your URLs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!shrUrl) return;
    setShortening(true);
    try {
      const res = await api.post('/shorten', {
        originalUrl: shrUrl,
        expiryDays: expiryDays ? parseInt(expiryDays) : null,
      });
      setRecentResult(res.data);
      setShrUrl('');
      setExpiryDays('');
      fetchUrls();
      addToast('Link created!', 'success');
    } catch (err) {
      if (err.response?.status === 429) {
        const retryAfter = err.response.headers?.['retry-after'] || 60;
        addToast(`Rate limit hit — retry after ${retryAfter}s`, 'error');
      } else {
        addToast(err.response?.data?.message || 'Failed to shorten', 'error');
      }
    } finally {
      setShortening(false);
    }
  };

  const copyToClipboard = (shortId, isRecent = false) => {
    const fullUrl = `${redirectBase}/${shortId}`;
    navigator.clipboard.writeText(fullUrl);
    if (isRecent) {
      setCopiedRecent(true);
      setTimeout(() => setCopiedRecent(false), 2000);
    }
    addToast('Copied to clipboard', 'success');
  };

  const handleDelete = async (code) => {
    if(!window.confirm('Delete this link permanently?')) return;
    try {
      await api.delete(`/urls/${code}`);
      setUrls(prev => prev.filter(u => u.shortUrl !== code));
      if (recentResult?.shortUrl === code) setRecentResult(null);
      addToast('Link deleted', 'success');
    } catch (err) {
      addToast('Failed to delete', 'error');
    }
  };

  const totalClicks = urls.reduce((sum, u) => sum + (u.clickCount || 0), 0);
  // Backend returns newest-first already — no client-side sort needed
  const sortedUrls = urls;

  // Chart uses real total click count per link as a bar chart proxy
  // (real daily breakdown is on the individual Analytics page)

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <div className="dashboard-main">
        
        <header className="dash-header">
          <div className="flex items-center gap-2">
            <Link2 size={20} className="text-primary" />
            <h1>
              {pathname === '/dashboard/links' ? 'My Links' : 
               pathname === '/dashboard/analytics' ? 'Analytics' : 'Dashboard'}
            </h1>
          </div>
          <div className="header-actions">
            <div className="header-profile">
              <div className="avatar-circle">{user?.username?.charAt(0).toUpperCase() || 'U'}</div>
              <span>{user?.username}</span>
            </div>
          </div>
        </header>

        <div className="dash-scroll">
          <div className="dash-content-stack">
            
            {/* ZONE 1: Hero Shortener - only on main dashboard */}
            {pathname === '/dashboard' && (
              <div className="hero-card">
              <div className="hero-header">
                <div>
                  <h2>Shorten a new link</h2>
                  <p>Paste any long URL and get a short trackable link instantly</p>
                </div>
              </div>

              <form onSubmit={handleShorten} className="unified-input-bar">
                <div className="bar-input-group">
                  <LinkIcon size={18} className="hero-input-icon" />
                  <input 
                    className="bar-input" 
                    placeholder="https://paste-your-long-url-here.com" 
                    value={shrUrl}
                    onChange={e => setShrUrl(e.target.value)}
                    required 
                  />
                </div>
                
                <div className="bar-divider"></div>

                <div className="bar-select-wrapper">
                  <select 
                    className="bar-select"
                    value={expiryDays}
                    onChange={e => setExpiryDays(e.target.value)}
                  >
                    <option value="">Never Expires</option>
                    <option value="1">Expire in 1 Day</option>
                    <option value="7">Expire in 7 Days</option>
                    <option value="30">Expire in 30 Days</option>
                  </select>
                  <ChevronDown size={14} className="bar-select-icon" />
                </div>

                <button type="submit" className="bar-button" disabled={shortening}>
                  {shortening ? 'Creating...' : 'Create Link' } <ArrowRight size={16} />
                </button>
              </form>

              {recentResult && (
                <div className="hero-result-card">
                  <div className="flex items-center gap-4">
                    <div className="qr-mini-card">
                      <QRCodeSVG value={`${redirectBase}/${recentResult.shortUrl}`} size={48} level="M" />
                    </div>
                    <div className="result-url-display">
                      <div className="result-short">{redirectBase.replace('http://','').replace('https://','')}/{recentResult.shortUrl}</div>
                      <div className="result-original">{recentResult.originalUrl}</div>
                    </div>
                  </div>
                  
                  <div className="result-actions">
                    <button 
                      className="btn btn-primary" 
                      style={{ height: 40, borderRadius: 8 }}
                      onClick={() => copyToClipboard(recentResult.shortUrl, true)}
                    >
                      {copiedRecent ? <Check size={16} /> : <Copy size={16} />}
                      {copiedRecent ? 'Copied' : 'Copy Link'}
                    </button>
                    <a 
                      href={`${redirectBase}/${recentResult.shortUrl}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn btn-outline"
                      style={{ height: 40, borderRadius: 8 }}
                    >
                      <ExternalLink size={16} /> Visit
                    </a>
                  </div>
                </div>
              )}
            </div>
            )}

            {/* ZONE 2: Metric Cards Row - hidden on analytics picker */}
            {pathname !== '/dashboard/analytics' && (
              <div className="metric-row">
              <div className="metric-compact-card">
                <div className="metric-label-group">
                  <span className="metric-compact-label">Total Links</span>
                  <span className="metric-compact-value">{urls.length}</span>
                </div>
                <Link2 size={24} className="text-light" style={{opacity: 0.5}} />
              </div>
              <div className="metric-compact-card">
                <div className="metric-label-group">
                  <span className="metric-compact-label">Total Clicks</span>
                  <span className="metric-compact-value">{totalClicks.toLocaleString()}</span>
                </div>
                <BarChart2 size={24} className="text-light" style={{opacity: 0.5}} />
              </div>
              <div className="metric-compact-card">
                <div className="metric-label-group">
                  <span className="metric-compact-label">Active Links</span>
                  <span className="metric-compact-value">
                    {urls.filter(u => !u.expired).length}
                  </span>
                </div>
                <MousePointerClick size={24} className="text-light" style={{opacity: 0.5}} />
              </div>
            </div>
            )}

            {/* ZONE 3: Links Table */}
            <div className="links-section">
              <div className="links-header">
                <h3>
                  {pathname === '/dashboard/analytics' ? 'Select a link to view analytics' : 'Your links'}
                </h3>
                <span style={{fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500}}>
                  {urls.length} result{urls.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="links-table-wrapper">
                <table className="links-table">
                  <thead>
                    <tr>
                      <th>Short URL</th>
                      <th>Original URL</th>
                      <th>Clicks</th>
                      <th>Created</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && <tr><td colSpan="6" style={{textAlign: 'center', padding: '40px'}}>Loading links...</td></tr>}
                    {!loading && urls.length === 0 && <tr><td colSpan="6" style={{textAlign: 'center', padding: '40px'}}>No links created yet.</td></tr>}
                    {sortedUrls.map(u => (
                      <tr key={u.shortUrl}>
                        <td>
                          <div className="table-short-link">
                            {redirectBase.replace('http://','').replace('https://','')}/{u.shortUrl}
                          </div>
                        </td>
                        <td>
                          <div className="table-original-url" title={u.originalUrl}>
                            {u.originalUrl}
                          </div>
                        </td>
                        <td>
                          <span style={{fontWeight: 600}}>{u.clickCount}</span>
                        </td>
                        <td>
                          <span style={{color: 'var(--text-muted)'}}>{new Date(u.createdDate).toLocaleDateString()}</span>
                        </td>
                        <td>
                          {u.expired ? (
                            <span className="badge" style={{background: '#FEF2F2', color: '#EF4444'}}>Expired</span>
                          ) : (
                            <span className="badge badge-green">Active</span>
                          )}
                        </td>
                        <td>
                          <div className="table-actions">
                            <button className="action-icon-btn" title="Copy" onClick={() => copyToClipboard(u.shortUrl)}>
                              <Copy size={16} />
                            </button>
                            <button className="action-icon-btn" title="Analytics" onClick={() => navigate(`/dashboard/analytics/${u.shortUrl}`)}>
                              <BarChart2 size={16} />
                            </button>
                            <button className="action-icon-btn delete" title="Delete" onClick={() => handleDelete(u.shortUrl)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
