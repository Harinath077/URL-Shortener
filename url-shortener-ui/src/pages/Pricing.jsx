import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';

const orbitFeatures = [
  '10,000 shortened links/month',
  '1 custom short domain',
  'Click & geography analytics',
  'QR code generation with branding',
  'Link expiry & password protection',
  'Up to 3 team members',
  'Email support',
];

const apexFeatures = [
  'Unlimited links/month',
  '5 custom short domains',
  'Advanced analytics (device, UTM, funnel)',
  'Full REST API access & webhooks',
  'Bulk link creation via CSV upload',
  'Unlimited team members with role permissions',
  'Priority chat support + dedicated account manager',
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  const orbitPrice = annual ? 399 : 499;
  const apexPrice  = annual ? 1199 : 1499;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 40px 120px' }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{
            background: '#EFF6FF', color: 'var(--primary)',
            border: '1px solid #DBEAFE', padding: '4px 10px',
            borderRadius: 4, fontSize: '0.75rem', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.05em',
            display: 'inline-block', marginBottom: 20,
          }}>
            Simple, Transparent Pricing
          </span>
          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 16 }}>
            Scaling links shouldn't<br />
            <span style={{ color: 'var(--primary)' }}>break your budget.</span>
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.65 }}>
            Built for Indian founders and digital marketers.{' '}
            <strong style={{ color: 'var(--text)', fontWeight: 600 }}>Up to 40% cheaper than Bitly.</strong>
          </p>

          {/* ── Toggle ── */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', padding: 4, boxShadow: 'var(--shadow-sm)' }}>
            <button
              onClick={() => setAnnual(false)}
              style={{
                fontFamily: 'inherit', cursor: 'pointer', border: 'none',
                padding: '7px 20px', borderRadius: 'var(--radius-full)',
                fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.18s ease',
                background: !annual ? 'var(--primary)' : 'transparent',
                color: !annual ? '#fff' : 'var(--text-muted)',
              }}
            >Monthly</button>
            <button
              onClick={() => setAnnual(true)}
              style={{
                fontFamily: 'inherit', cursor: 'pointer', border: 'none',
                padding: '7px 20px', borderRadius: 'var(--radius-full)',
                fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.18s ease',
                background: annual ? 'var(--primary)' : 'transparent',
                color: annual ? '#fff' : 'var(--text-muted)',
              }}
            >
              Annually
            </button>
          </div>
          {annual && (
            <div style={{ marginTop: 12 }}>
              <span style={{
                background: '#ECFDF5', color: 'var(--success)', border: '1px solid #A7F3D0',
                padding: '3px 10px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                Save 20% — Best Value
              </span>
            </div>
          )}
        </div>

        {/* ── Plans Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, maxWidth: 880, margin: '0 auto' }}>

          {/* ─ Orbit Card ─ */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)',
            padding: '36px 36px 40px', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 10 }}>Orbit</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>₹{orbitPrice}</span>
                <span style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', fontWeight: 500 }}>/month</span>
              </div>
              {annual && <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>Billed ₹{orbitPrice * 12}/year</div>}
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
                For freelancers, creators & small teams.
              </p>
            </div>

            <div style={{ height: 1, background: 'var(--border)', margin: '0 0 24px' }} />

            <ul style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 32 }}>
              {orbitFeatures.map(f => (
                <FeatureItem key={f} text={f} />
              ))}
            </ul>

            <Link to="/register" className="btn btn-primary" style={{ justifyContent: 'center', borderRadius: 'var(--radius-lg)', padding: '12px 20px', fontSize: '0.9375rem', fontWeight: 600 }}>
              Start with Orbit
            </Link>
          </div>

          {/* ─ Apex Card ─ */}
          <div style={{
            background: 'var(--primary)', border: '1px solid var(--primary)',
            borderRadius: 'var(--radius-xl)', boxShadow: '0 8px 40px rgba(37,99,235,0.22), 0 2px 8px rgba(37,99,235,0.12)',
            padding: '36px 36px 40px', display: 'flex', flexDirection: 'column',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Subtle top-right shine */}
            <div style={{
              position: 'absolute', top: -60, right: -60, width: 180, height: 180,
              background: 'rgba(255,255,255,0.08)', borderRadius: '50%', pointerEvents: 'none',
            }} />

            {/* Badge */}
            <div style={{ position: 'absolute', top: 20, right: 20 }}>
              <span style={{
                background: 'rgba(255,255,255,0.2)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '3px 10px', borderRadius: 4, fontSize: '0.7rem',
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <Zap size={11} />Most Popular
              </span>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>Apex</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>₹{apexPrice}</span>
                <span style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>/month</span>
              </div>
              {annual && <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Billed ₹{apexPrice * 12}/year</div>}
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', marginTop: 8, lineHeight: 1.5 }}>
                For scaling businesses & agencies.
              </p>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.18)', margin: '0 0 24px' }} />

            <ul style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 32 }}>
              <li style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                Everything in Orbit, plus:
              </li>
              {apexFeatures.map(f => (
                <FeatureItem key={f} text={f} inverted />
              ))}
            </ul>

            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: '#fff', color: 'var(--primary)', borderRadius: 'var(--radius-lg)',
              padding: '12px 20px', fontSize: '0.9375rem', fontWeight: 700,
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)', border: 'none', cursor: 'pointer',
              textDecoration: 'none', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F0F5FF'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              Go Apex <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* ── Trust strip ── */}
        <div style={{ textAlign: 'center', marginTop: 52, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <span>✓ No credit card required &nbsp;·&nbsp; ✓ Cancel anytime &nbsp;·&nbsp; ✓ INR billing &nbsp;·&nbsp; ✓ GST invoice included</span>
        </div>

      </main>
    </div>
  );
}

function FeatureItem({ text, inverted }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
        background: inverted ? 'rgba(255,255,255,0.2)' : '#EFF6FF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Check size={11} strokeWidth={3} color={inverted ? '#fff' : 'var(--primary)'} />
      </div>
      <span style={{ fontSize: '0.875rem', color: inverted ? 'rgba(255,255,255,0.9)' : 'var(--text)', lineHeight: 1.5 }}>
        {text}
      </span>
    </li>
  );
}
