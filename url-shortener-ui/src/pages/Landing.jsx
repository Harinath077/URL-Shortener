import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Link2, ArrowRight, Copy, Check, FileText, MousePointerClick, ThumbsUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useToast } from '../components/Toast';

export default function Landing() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const addToast = useToast();

  const redirectBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    try {
      const res = await api.post('/shorten', { originalUrl: url });
      setResult(res.data);
      addToast('URL shortened successfully!', 'success');
      setUrl('');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to shorten URL', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const shortUrl = `${redirectBase}/${result.shortUrl}`;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    addToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="landing-page">
      <Navbar />
      
      <main className="hero-section" style={{maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '55fr 45fr', gap: 48, padding: '80px 40px', alignItems: 'center'}}>
        {/* LEFT COLUMN */}
        <div>
          <div style={{marginBottom: 16}}>
            <span style={{background: '#EFF6FF', color: 'var(--primary)', border: '1px solid #DBEAFE', padding: '4px 10px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em'}}>Enterprise Grade Shortener</span>
          </div>
          <h1 style={{fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, color: 'var(--text)', marginBottom: 20, letterSpacing: '-0.02em'}}>
            Shorten URLs.<br /><span style={{color: 'var(--primary)'}}>Track Every Click.</span>
          </h1>
          <p style={{fontSize: '1.125rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 32, maxWidth: 440}}>
            A short link lets you collect rich data about your audience and their behavior. Built for scale.
          </p>

          <div style={{background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '10px 10px 10px 20px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--shadow-sm)'}}>
            <Link2 className="text-muted" size={20} />
            <form onSubmit={handleShorten} className="flex flex-1 gap-2" style={{margin: 0, width: '100%', display: 'flex'}}>
              <input
                type="url"
                style={{flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9375rem', color: 'var(--text)'}}
                placeholder="Paste a link to shorten it"
                value={url}
                onChange={e => setUrl(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" style={{borderRadius: 8}} disabled={loading}>
                {loading ? 'Shortening...' : 'Shorten' } <ArrowRight size={16} />
              </button>
            </form>
          </div>
          <p style={{fontSize: '0.8125rem', color: 'var(--text-light)', marginTop: 12, marginLeft: 4, fontWeight: 500}}>Free forever. No account required for your first 5 links.</p>

          {result && (
            <div style={{background: 'var(--bg)', border: '1px solid var(--success)', borderRadius: 'var(--radius-lg)', padding: '20px', marginTop: 24, animation: 'slideUp 0.3s ease'}}>
              <div style={{fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', gap: 6, alignItems: 'center'}}><Check size={14}/> READY TO SHARE</div>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <span style={{fontFamily: 'var(--font-mono)', fontSize: '1.0625rem', color: 'var(--primary)', fontWeight: 600}}>
                  {redirectBase.replace('https://', '').replace('http://', '')}/{result.shortUrl}
                </span>
                <button className="btn btn-outline btn-sm" style={{borderRadius: 6}} onClick={copyToClipboard}>
                  {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN ILLUSTRATION / DESIGN */}
        <div style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', width: '100%', maxWidth: 440, overflow: 'hidden'}}>
            <div style={{background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', gap: 8, alignItems: 'center'}}>
              <div style={{display: 'flex', gap: 6}}>
                <div style={{width: 10, height: 10, borderRadius: '50%', background: '#EF4444'}}></div>
                <div style={{width: 10, height: 10, borderRadius: '50%', background: '#F59E0B'}}></div>
                <div style={{width: 10, height: 10, borderRadius: '50%', background: '#10B981'}}></div>
              </div>
              <div style={{flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'center'}}>
                <Link2 size={12} style={{marginRight: 6}}/> {redirectBase.replace('https://', '').replace('http://', '')}/aZ91K
              </div>
            </div>
            <div style={{padding: '24px'}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24}}>
                <div style={{background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16}}>
                  <div style={{fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', lineHeight: 1}}>4.2M</div>
                  <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: 4}}>Total Clicks</div>
                </div>
                <div style={{background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16}}>
                  <div style={{fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)', lineHeight: 1}}>92%</div>
                  <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: 4}}>Mobile Traffic</div>
                </div>
              </div>
              <div style={{display: 'flex', alignItems: 'flex-end', gap: 6, height: 80}}>
                <div style={{flex: 1, background: 'var(--primary)', opacity: 0.2, height: '30%', borderRadius: '4px 4px 0 0'}}></div>
                <div style={{flex: 1, background: 'var(--primary)', opacity: 0.4, height: '45%', borderRadius: '4px 4px 0 0'}}></div>
                <div style={{flex: 1, background: 'var(--primary)', opacity: 0.6, height: '70%', borderRadius: '4px 4px 0 0'}}></div>
                <div style={{flex: 1, background: 'var(--primary)', opacity: 0.8, height: '55%', borderRadius: '4px 4px 0 0'}}></div>
                <div style={{flex: 1, background: 'var(--primary)', opacity: 1.0, height: '100%', borderRadius: '4px 4px 0 0', position: 'relative'}}>
                   <div style={{position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', background: 'var(--text)', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4, fontWeight: 600}}>+148</div>
                </div>
                <div style={{flex: 1, background: 'var(--primary)', opacity: 0.6, height: '65%', borderRadius: '4px 4px 0 0'}}></div>
                <div style={{flex: 1, background: 'var(--primary)', opacity: 0.3, height: '40%', borderRadius: '4px 4px 0 0'}}></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Achievement Strip */}
      <section style={{maxWidth: 1200, margin: '0 auto 80px', padding: '0 40px'}}>
        <div style={{background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2xl)', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 2fr', gap: 40, padding: '32px 48px', alignItems: 'center'}}>
          
          <div>
            <h2 style={{fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.3}}>
              Trusted by professionals<br/> worldwide.
            </h2>
            <div style={{width: 48, height: 4, background: 'var(--primary)', borderRadius: 2, marginTop: 12}}></div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <div style={{width: 48, height: 48, background: '#F0FDFA', color: '#0D9488', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><FileText size={24} /></div>
              <div>
                <div style={{fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1}}>30M+</div>
                <div style={{fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: 4}}>Powering Links</div>
              </div>
            </div>
            
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <div style={{width: 48, height: 48, background: '#EFF6FF', color: 'var(--primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><MousePointerClick size={24} /></div>
              <div>
                <div style={{fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1}}>2B+</div>
                <div style={{fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: 4}}>Serving Clicks</div>
              </div>
            </div>

            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <div style={{width: 48, height: 48, background: '#FEFCE8', color: '#CA8A04', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><ThumbsUp size={24} /></div>
              <div>
                <div style={{fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1}}>20K+</div>
                <div style={{fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: 4}}>Happy Users</div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
