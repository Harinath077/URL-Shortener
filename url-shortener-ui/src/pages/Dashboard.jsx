import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  BarChart2, Trash2, Copy, Check, Link2, Download,
  MousePointerClick, Calendar as CalIcon, ArrowRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../api/axios';

export default function Dashboard() {
  const { user } = useAuth();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shrUrl, setShrUrl] = useState('');
  const [expiryDays, setExpiryDays] = useState('');
  const [shortening, setShortening] = useState(false);
  const [recentResult, setRecentResult] = useState(null);

  const addToast = useToast();
  const navigate = useNavigate();

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

  const copyToClipboard = (shortId) => {
    const fullUrl = `${window.location.origin}/${shortId}`;
    navigator.clipboard.writeText(fullUrl);
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
          <h1>URL SHORTENER</h1>
          <div className="header-actions">
            <div className="header-profile">
              <div className="avatar-circle">{user?.username?.charAt(0).toUpperCase() || 'U'}</div>
              {user?.username}
            </div>
          </div>
        </header>

        <div className="dash-scroll">
          <div className="dash-grid">
            
            {/* LEFT COLUMN: Performance & Engagement */}
            <div className="main-col">
              
              <div className="card-clean" style={{ marginBottom: '32px' }}>
                <div className="perf-controls">
                  <span className="section-label" style={{ marginBottom: 0 }}>Performance</span>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-2" style={{fontSize: '0.875rem', fontWeight: 500}}>
                      <div style={{width:8,height:8,borderRadius:'50%',background:'var(--primary)'}}></div> Date created
                    </span>
                    <span className="flex items-center gap-2" style={{fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)'}}>
                      <div style={{width:8,height:8,borderRadius:'50%',border:'2px solid var(--text-muted)'}}></div> Top performing
                    </span>
                    <select className="perf-dropdown">
                      <option>Yearly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                </div>

                <div className="metrics-flex">
                  <div className="metric-box">
                    <div className="metric-icon-wrap solid-blue"><BarChart2 size={24} /></div>
                    <div className="metric-data">
                      <div className="mlabel">Total Clicks</div>
                      <div className="mvalue">{totalClicks.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="metric-box">
                    <div className="metric-icon-wrap solid-indigo"><MousePointerClick size={24} /></div>
                    <div className="metric-data">
                      <div className="mlabel">Active Links</div>
                      <div className="mvalue">{urls.length}</div>
                    </div>
                  </div>
                </div>

                {/* Chart — real per-link click counts */}
                <div className="chart-container-inner">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={urls.map(u => ({ name: u.shortUrl, clicks: u.clickCount }))}
                      margin={{ top: 10, right: 0, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorC" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94A3B8'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94A3B8'}} />
                      <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'}} />
                      <Area type="stepBefore" dataKey="clicks" stroke="#2563EB" strokeWidth={2} fill="url(#colorC)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex justify-center">
                  <button className="btn btn-primary btn-sm" style={{borderRadius: '4px'}}>Hide Chart ^</button>
                </div>
              </div>

              {/* Engagement All Time */}
              <div className="link-list-header">
                <span className="section-label" style={{ marginBottom: 0 }}>Engagement All Time</span>
                <span style={{fontSize: '0.875rem', color: 'var(--text-muted)'}}>{urls.length} Result{urls.length !== 1 ? 's' : ''}</span>
              </div>
              
              <div className="link-list">
                {loading && <div style={{textAlign: 'center', color: 'var(--text-muted)', padding: '16px'}}>Loading links...</div>}
                {!loading && sortedUrls.length === 0 && <div style={{textAlign: 'center', color: 'var(--text-muted)', padding: '16px'}}>No links created yet.</div>}
                {sortedUrls.map(u => (
                  <div key={u.shortUrl} className="link-item">
                    <div className="link-meta">
                      <div className="link-title">short.ly/{u.shortUrl}</div>
                      <div className="link-original">{u.originalUrl}</div>
                      <div className="link-date">
                        <CalIcon size={12} /> {new Date(u.createdDate).toLocaleString()}
                        <span className="badge badge-gray" style={{marginLeft: '12px'}}>{u.clickCount} Clicks</span>
                        {u.expired
                          ? <span className="badge" style={{marginLeft: '8px', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA'}}>Expired</span>
                          : u.expiresAt
                            ? <span className="badge" style={{marginLeft: '8px', background: '#ECFDF5', color: '#10B981', border: '1px solid #A7F3D0'}}>Active</span>
                            : null
                        }
                      </div>
                    </div>
                      <div className="link-actions">
                        <button className="flex items-center justify-center border border-slate-200" style={{background: 'var(--surface)', color: 'var(--text-muted)', borderRadius: '6px', width: 32, height: 32, border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.15s'}} onMouseEnter={(e) => {e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor='var(--primary)'}} onMouseLeave={(e) => {e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor='var(--border)'}} title="Copy" onClick={() => copyToClipboard(u.shortUrl)}>
                          <Copy size={16} />
                        </button>
                        <button className="flex items-center justify-center border border-slate-200" style={{background: 'var(--surface)', color: 'var(--text-muted)', borderRadius: '6px', width: 32, height: 32, border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.15s', marginLeft: '8px'}} onMouseEnter={(e) => {e.currentTarget.style.background = '#F8FAFC';}} onMouseLeave={(e) => {e.currentTarget.style.background = 'var(--surface)';}} title="Analytics" onClick={() => navigate(`/dashboard/analytics/${u.shortUrl}`)}>
                          <BarChart2 size={16} />
                        </button>
                        <button className="flex items-center justify-center border border-slate-200" style={{background: 'var(--surface)', color: 'var(--danger)', borderRadius: '6px', width: 32, height: 32, border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.15s', marginLeft: '8px'}} onMouseEnter={(e) => {e.currentTarget.style.background = '#FEF2F2';}} onMouseLeave={(e) => {e.currentTarget.style.background = 'var(--surface)';}} title="Delete" onClick={() => handleDelete(u.shortUrl)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                  </div>
                ))}
              </div>

            </div>

            {/* RIGHT COLUMN: Action Widgets */}
            <div className="widget-stack">
              
              <div className="card-clean">
                <span className="section-label">CREATE NEW LINK <Link2 size={14} style={{marginLeft: 4}} /></span>
                <p style={{fontSize: '0.875rem', color: 'var(--text-muted)'}}>Create, short, and manage your links</p>
                <form onSubmit={handleShorten} className="create-link-box">
                  <input 
                    className="input" 
                    placeholder="https://very-long..." 
                    value={shrUrl}
                    onChange={e => setShrUrl(e.target.value)}
                    required 
                  />
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      max="365"
                      placeholder="Expires in days (optional)"
                      value={expiryDays}
                      onChange={e => setExpiryDays(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={shortening}>
                    {shortening ? '...' : 'Create' } <ArrowRight size={16} />
                  </button>
                </form>
              </div>

              <div className="card-clean">
                <span className="section-label">CUSTOM YOUR LINK</span>
                <div className="preview-box">
                  <div style={{height: 120, background: '#F1F5F9', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <MousePointerClick size={24} className="text-muted" />
                  </div>
                </div>
                {recentResult && (
                  <div className="preview-url">
                    <Link2 size={14} className="text-primary" /> short.ly/{recentResult.shortUrl}
                  </div>
                )}
              </div>

              {recentResult && (
                <div className="card-clean">
                  <div className="flex justify-between items-center mb-4">
                    <span className="section-label" style={{marginBottom: 0}}>QR CODE</span>
                    <button className="btn btn-primary btn-sm" style={{borderRadius: 4}}>Download PNG</button>
                  </div>
                  <div className="qr-widget">
                    <div className="qr-code-box">
                      <QRCodeSVG value={`${window.location.origin}/${recentResult.shortUrl}`} size={80} level="M" />
                    </div>
                    <div className="qr-meta">
                      <div className="qr-url-text flex items-center gap-1">
                        <Link2 size={14} className="text-primary" /> https://{window.location.host}/{recentResult.shortUrl}
                      </div>
                      <div className="qr-date">
                        <CalIcon size={14} /> {new Date(recentResult.createdDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
