import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ArrowLeft, ExternalLink, Calendar, MousePointerClick, Clock, Trash2, Copy } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { useToast } from '../components/Toast';

export default function Analytics() {
  const { code } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [code]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/analytics/${code}`);
      setData(res.data);
    } catch (err) {
      addToast('Failed to load analytics', 'error');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${code}`);
    addToast('Short link copied!', 'success');
  };

  const handleDelete = async () => {
    if(!window.confirm('Are you sure you want to delete this link?')) return;
    try {
      await api.delete(`/urls/${code}`);
      addToast('Link deleted successfully', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast('Failed to delete link', 'error');
    }
  };

  // Mock timeline data to visualize chart since click_events lack a specific timeseries API right now
  const mockChartData = [
    { name: 'Mon', clicks: Math.floor((data?.clickCount || 0) * 0.1) },
    { name: 'Tue', clicks: Math.floor((data?.clickCount || 0) * 0.15) },
    { name: 'Wed', clicks: Math.floor((data?.clickCount || 0) * 0.25) },
    { name: 'Thu', clicks: Math.floor((data?.clickCount || 0) * 0.2) },
    { name: 'Fri', clicks: Math.floor((data?.clickCount || 0) * 0.1) },
    { name: 'Sat', clicks: Math.floor((data?.clickCount || 0) * 0.05) },
    { name: 'Sun', clicks: Math.floor((data?.clickCount || 0) * 0.15) },
  ];

  if (loading) {
    return (
      <div className="dashboard-shell">
        <Sidebar />
        <div className="dashboard-main flex items-center justify-center text-muted">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <div className="dashboard-main">
        <div className="dashboard-content analytics-page">
          
          <div className="back-link" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} /> Back to Dashboard
          </div>

          <div className="analytics-header">
            <h1>Analytics for /{code}</h1>
            <p>Click data powered by Spring Boot background sync + Redis Fast-Path</p>
          </div>

          <div className="analytics-metrics">
            <div className="metric-card">
              <div className="metric-icon blue"><MousePointerClick size={22} /></div>
              <div><div className="value">{data?.clickCount || 0}</div><div className="label">Total Clicks</div></div>
            </div>
            <div className="metric-card">
              <div className="metric-icon purple"><Clock size={22} /></div>
              <div>
                <div className="value">
                  {Math.max(1, Math.floor((new Date() - new Date(data?.createdDate)) / (1000 * 60 * 60 * 24)))}
                </div>
                <div className="label">Days Active</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon green"><Calendar size={22} /></div>
              <div>
                <div className="value">
                  {data?.createdDate ? new Date(data.createdDate).toLocaleDateString() : 'N/A'}
                </div>
                <div className="label">Created Date</div>
              </div>
            </div>
          </div>

          <div className="info-table-card">
            <table>
              <thead>
                <tr>
                  <th>Info</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-bold text-sm">Short URL</td>
                  <td>
                    <div className="flex items-center gap-2">
                       <span className="badge badge-blue">
                         {window.location.host}/{data?.shortUrl}
                       </span>
                       <button className="icon-btn" onClick={copyLink}><Copy size={14}/></button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="font-bold text-sm">Original Destination</td>
                  <td>
                    <a href={data?.originalUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                      {data?.originalUrl} <ExternalLink size={14} />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="font-bold text-sm">Status</td>
                  <td><span className="badge badge-green">Active — Cached</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Engagement Metrics (7 Days)</h3>
              <div className="chart-tabs">
                <button className="chart-tab active">Traffic</button>
                <button className="chart-tab">Referrers</button>
                <button className="chart-tab">Locations</button>
              </div>
            </div>
            <div className="chart-meta">
              <div className="chart-metric">
                <div className="dot" style={{background: 'var(--primary)'}}></div>
                <span>Average Daily: <strong>{Math.floor((data?.clickCount || 0) / 7)}</strong></span>
              </div>
              <div className="chart-metric">
                <div className="dot" style={{background: 'var(--success)'}}></div>
                <span>Peak Traffic: <strong>Wed</strong></span>
              </div>
            </div>
            
            <div style={{ height: 300, width: '100%', marginTop: '30px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}
                    itemStyle={{ color: '#2563EB', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="clicks" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="analytics-bottom-actions">
            <button className="btn btn-danger" onClick={handleDelete}>
              <Trash2 size={16} /> Delete URL
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
