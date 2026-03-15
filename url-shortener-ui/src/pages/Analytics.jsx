import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ArrowLeft, ExternalLink, Calendar, MousePointerClick, Clock, Trash2, Copy, TrendingUp, BarChart2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { useToast } from '../components/Toast';

export default function Analytics() {
  const { code } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  const redirectBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

  useEffect(() => {
    fetchStats();
  }, [code, days]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/analytics/${code}?days=${days}`);
      setData(res.data);
    } catch (err) {
      addToast('Failed to load analytics', 'error');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${redirectBase}/${code}`);
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

  const chartData = (data?.dailyClicks || []).map(d => ({
    name: new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
    clicks: d.clickCount,
  }));

  const totalClicksStored = data?.clickCount || 0;
  const daysActive = Math.max(1, Math.floor((new Date() - new Date(data?.createdDate)) / (1000 * 60 * 60 * 24)));
  const avgClicks = (totalClicksStored / daysActive).toFixed(1);
  const peakDay = chartData.reduce((max, d) => d.clicks > (max?.clicks ?? -1) ? d : max, null);

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
        <div className="dash-scroll">
          <div className="analytics-container">
          
          <div className="analytics-back" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} /> Back to Dashboard
          </div>

          <div className="analytics-title-row">
            <h1>Analytics for /{code}</h1>
            <p>Click data · last updated live</p>
          </div>

          {/* Metric Cards Row */}
          <div className="analytics-metrics-row">
            <div className="analytics-metric-card">
              <div className="metric-icon-circle blue"><BarChart2 size={22} /></div>
              <div className="metric-info">
                <span className="metric-val">{totalClicksStored.toLocaleString()}</span>
                <span className="metric-lab">Total clicks</span>
              </div>
            </div>
            <div className="analytics-metric-card">
              <div className="metric-icon-circle purple"><Clock size={22} /></div>
              <div className="metric-info">
                <span className="metric-val">{daysActive}</span>
                <span className="metric-lab">Days active</span>
              </div>
            </div>
            <div className="analytics-metric-card">
              <div className="metric-icon-circle green"><TrendingUp size={22} /></div>
              <div className="metric-info">
                <span className="metric-val">{avgClicks}</span>
                <span className="metric-lab">Avg clicks / day</span>
              </div>
            </div>
          </div>

          {/* URL Info Card */}
          <div className="analytics-info-card">
            <div className="info-row">
              <span className="info-key">Short URL</span>
              <div className="flex items-center gap-2">
                <span className="info-short">{redirectBase.replace('http://','').replace('https://','')}/{data?.shortUrl}</span>
                <button className="action-icon-btn" onClick={copyLink}><Copy size={14}/></button>
              </div>
            </div>
            <div className="info-row">
              <span className="info-key">Original URL</span>
              <div className="info-val info-original" title={data?.originalUrl}>
                {data?.originalUrl}
              </div>
            </div>
            <div className="info-row">
              <span className="info-key">Created</span>
              <span className="info-val">
                {data?.createdDate ? new Date(data.createdDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-key">Status</span>
              <span className={`badge ${data?.expired ? 'badge-danger' : 'badge-green'}`}>
                {data?.expired ? 'Expired' : 'Active'}
              </span>
            </div>
          </div>

          {/* Chart Card */}
          <div className="analytics-chart-card">
            <div className="chart-header-row">
              <h3>Daily clicks</h3>
              <div className="toggle-pill-group">
                <button 
                  className={`toggle-btn ${days === 7 ? 'active' : ''}`} 
                  onClick={() => setDays(7)}
                >7 Days</button>
                <button 
                  className={`toggle-btn ${days === 30 ? 'active' : ''}`} 
                  onClick={() => setDays(30)}
                >30 Days</button>
              </div>
            </div>

            <div className="chart-stats-row">
              <div className="chart-stat-item">
                <div className="dot-indicator" style={{background: '#2563EB'}}></div>
                <span>Avg daily: <strong>{data?.dailyClicks?.length ? (data.dailyClicks.reduce((s,d) => s+d.clickCount,0)/data.dailyClicks.length).toFixed(1) : 0}</strong></span>
              </div>
              <div className="chart-stat-item">
                <div className="dot-indicator" style={{background: '#10B981'}}></div>
                <span>Peak: <strong>{peakDay?.clicks ? `${peakDay.name} (${peakDay.clicks})` : 'N/A'}</strong></span>
              </div>
            </div>

            <div style={{ height: 280, width: '100%', marginTop: '30px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity={0.15}/>
                        <stop offset="100%" stopColor="#2563EB" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 12, fill: '#94A3B8'}} 
                      dy={12}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 12, fill: '#94A3B8'}} 
                      allowDecimals={false}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '13px'}}
                      cursor={{ stroke: '#E2E8F0', strokeWidth: 1 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="clicks" 
                      stroke="#2563EB" 
                      strokeWidth={2.5} 
                      fill="url(#areaGradient)"
                      dot={false}
                      activeDot={{ r: 5, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
          </div>

          <div className="analytics-actions">
            <button className="btn-outline-danger" onClick={handleDelete}>
              <Trash2 size={16} /> Delete this URL
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Shorten another
            </button>
          </div>

        </div>
      </div>
    </div>
    </div>
  );
}
