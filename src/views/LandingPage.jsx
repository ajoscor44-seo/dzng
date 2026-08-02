import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNav from '../components/LandingNav';
import { AppContext } from '../context/AppContext';
import { 
  Compass, 
  Smartphone, 
  Key, 
  RefreshCw, 
  Share2, 
  Zap, 
  Users, 
  ArrowRight,
  Sun,
  Moon,
  HelpCircle,
  Check,
  Layers
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { formatCost, theme, toggleTheme, isLoggedIn, logoutUser, user, dbIsAdmin } = useContext(AppContext);

  const features = [
    {
      title: 'Shared Accounts Marketplace',
      desc: 'Buy shared family slots for premium services like Netflix, Spotify, Claude Pro, ChatGPT Plus, YouTube, and VPNs in local currency.',
      icon: Users,
      action: 'subs',
      color: 'var(--color-violet)'
    },
    {
      title: 'Global eSIM Travel Profiles',
      desc: 'Get instantly provisioned eSIM data profiles for over 85 countries. Install automatically with a scanned QR code or SM-DP+ code.',
      icon: Smartphone,
      action: 'esim',
      color: 'var(--color-turquoise)'
    },
    {
      title: 'One-Time OTP Verifications',
      desc: 'Verify accounts with real physical non-VOIP SIMs. Instantly receive verification codes for WhatsApp, Google, Telegram, and more.',
      icon: Key,
      action: 'otp',
      color: 'var(--color-pink)'
    },
    {
      title: 'Re-buy & Reuse Numbers',
      desc: 'Re-verify accounts or get additional codes. Request simulated re-rent sessions on any previously purchased numbers.',
      icon: RefreshCw,
      action: 'reuse',
      color: 'var(--color-amber)'
    },
    {
      title: 'SMM panel reseller core',
      desc: 'Grow your social media profiles on Instagram, TikTok, YouTube, and Telegram. High speed and lifetime refill services available.',
      icon: Share2,
      action: 'smm',
      color: 'var(--color-green)'
    }
  ];

  return (
    <div className="landing-container">
      {/* Navigation */}
      <LandingNav />

      {/* Hero Section */}
      <section className="landing-hero hero-subtle-gradient animate-slide-in" style={{ minHeight: '700px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 20px', borderBottom: '1px solid var(--border-color)', width: '100%', maxWidth: 'none', margin: '0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', textAlign: 'center', width: '100%' }}>
          <div className="hero-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-turquoise)', background: 'rgba(72, 58, 172, 0.05)', border: '1px solid rgba(72, 58, 172, 0.1)', padding: '6px 16px', borderRadius: '4px', marginBottom: '32px' }}>
            <Zap size={14} />
            <span style={{ fontSize: '12px', letterSpacing: '0.15em', fontWeight: '700', textTransform: 'uppercase', fontFamily: 'var(--font-label)' }}>All-In-One Digital Services Hub</span>
          </div>
          <h1 className="landing-title" style={{ fontSize: '56px', lineHeight: '1.2', fontWeight: '800', fontFamily: 'var(--font-heading)', marginBottom: '24px', color: 'var(--text-primary)' }}>
            Buy SMS Numbers, Accounts & Digital Products Instantly
          </h1>
          <p className="landing-desc" style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto 40px', lineHeight: '1.7', fontFamily: 'var(--font-sans)', fontWeight: '600' }}>
            Auto Delivery • Fast Support • Affordable Pricing
          </p>
          <div className="hero-buttons" style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '80px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '15px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-turquoise)', border: 'none', color: '#fff', fontWeight: '700', cursor: 'pointer' }} onClick={() => navigate('/marketplace')}>
              Browse Products <ArrowRight size={18} style={{ marginLeft: '4px' }} />
            </button>
            <button className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '15px', borderRadius: '4px', background: 'var(--bg-btn-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: '700', cursor: 'pointer' }} onClick={() => navigate('/dashboard/wallet')}>
              Fund Wallet
            </button>
          </div>

          {/* Integrated Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '32px', maxWidth: '800px', margin: '0 auto', borderTop: '1px solid var(--border-color)', paddingTop: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-turquoise)', fontFamily: 'var(--font-heading)' }}>52,000+</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '6px', fontFamily: 'var(--font-label)' }}>Orders Completed</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-turquoise)', fontFamily: 'var(--font-heading)' }}>12,000+</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '6px', fontFamily: 'var(--font-label)' }}>Happy Customers</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-turquoise)', fontFamily: 'var(--font-heading)' }}>150+</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '6px', fontFamily: 'var(--font-label)' }}>Countries Served</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-turquoise)', fontFamily: 'var(--font-heading)' }}>⚡ Instant</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '6px', fontFamily: 'var(--font-label)' }}>Auto Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Service Suite Section */}
      <section style={{ padding: '96px 20px', background: 'var(--bg-main)' }} id="services">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '36px', marginBottom: '16px', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Explore Our Suite of Digital Tools
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
              Instant setup, transparent pricing, and comprehensive APIs tailored for digital entrepreneurs.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={idx} 
                  className="editorial-card" 
                  style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '32px', borderRadius: '4px' }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '4px', background: 'var(--bg-btn-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-turquoise)', marginBottom: '24px' }}>
                    <Icon size={24} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                    {feat.title}
                    {feat.action === 'esim' && !dbIsAdmin && (
                      <span style={{ fontSize: '10px', background: 'rgba(72, 58, 172, 0.08)', color: 'var(--color-turquoise)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: '700', fontFamily: 'var(--font-label)' }}>
                        Coming Soon
                      </span>
                    )}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '32px', flexGrow: 1 }}>
                    {feat.desc}
                  </p>
                  <div 
                    style={{ color: 'var(--color-turquoise)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: 'var(--font-label)' }}
                    onClick={() => {
                      if (feat.action === 'subs') {
                        navigate('/marketplace');
                      } else {
                        navigate(`/dashboard/${feat.action}`);
                      }
                    }}
                  >
                    Configure Service <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                  </div>
                </div>
              );
            })}

            {/* Featured Image */}
            <div className="editorial-card" style={{ position: 'relative', minHeight: '300px', borderRadius: '4px', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(72, 58, 172, 0.25)', mixBlendMode: 'multiply', zIndex: 1 }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '32px', zIndex: 2, width: '100%', background: 'linear-gradient(to top, rgba(10, 9, 14, 0.9) 0%, rgba(10, 9, 14, 0) 100%)' }}>
                <p style={{ color: '#ffffff', fontSize: '18px', fontWeight: '700', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>Advanced Management</p>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0, fontFamily: 'var(--font-sans)' }}>Unified control panel for all digital assets.</p>
              </div>
              <div style={{ position: 'absolute', inset: 0, backgroundPosition: 'center', backgroundSize: 'cover', backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBXDV8UV-VGiZlRMH_MdLKd6n2r9Gbmw99MratWL3sfcwUX4DiYbfFtYTmk74Zz1DOhKprPnAbWTCot_RLteVGK2HHmPGTdoqxp_eQldJ9vMeOxl46nBgx9ZTRpCDiwOTP1aAS-Rf0GHDkx7Gd6RKbSeXhumLncJNGwbesTPbNAaRERXx0WWNcBk191yt-CCpeICDuwvt19_c2N7uoz2yAcJl48xk39EFB2rLby0e_aj-79yTgKxreh')` }} />
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section style={{ padding: '96px 20px', background: 'var(--bg-btn-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }} id="process">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '36px', marginBottom: '16px', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Seamless 4-Step Process
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
              No physical complications or manual sign-off delays. Experience automated provisioning.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
            <div className="editorial-step-card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '16px', right: '20px', fontSize: '56px', fontWeight: '800', fontStyle: 'italic', opacity: 0.1, color: 'var(--color-turquoise)', fontFamily: 'var(--font-heading)' }}>1</div>
              <div style={{ width: '48px', height: '48px', borderRadius: '4px', background: 'rgba(72, 58, 172, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Layers size={22} style={{ color: 'var(--color-turquoise)' }} />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>Fund Wallet</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
                Deposit funds instantly using secure automated transfers or Tether (USDT).
              </p>
            </div>

            <div className="editorial-step-card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '16px', right: '20px', fontSize: '56px', fontWeight: '800', fontStyle: 'italic', opacity: 0.1, color: 'var(--color-turquoise)', fontFamily: 'var(--font-heading)' }}>2</div>
              <div style={{ width: '48px', height: '48px', borderRadius: '4px', background: 'rgba(72, 58, 172, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Layers size={22} style={{ color: 'var(--color-turquoise)' }} />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>Choose Service</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
                Select from our catalog of global services and eSIM profiles.
              </p>
            </div>

            <div className="editorial-step-card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '16px', right: '20px', fontSize: '56px', fontWeight: '800', fontStyle: 'italic', opacity: 0.1, color: 'var(--color-turquoise)', fontFamily: 'var(--font-heading)' }}>3</div>
              <div style={{ width: '48px', height: '48px', borderRadius: '4px', background: 'rgba(72, 58, 172, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Layers size={22} style={{ color: 'var(--color-turquoise)' }} />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>Instant Delivery</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
                Our backend automates provisioning for immediate access.
              </p>
            </div>

            <div className="editorial-step-card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '16px', right: '20px', fontSize: '56px', fontWeight: '800', fontStyle: 'italic', opacity: 0.1, color: 'var(--color-turquoise)', fontFamily: 'var(--font-heading)' }}>4</div>
              <div style={{ width: '48px', height: '48px', borderRadius: '4px', background: 'rgba(72, 58, 172, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Layers size={22} style={{ color: 'var(--color-turquoise)' }} />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>Manage Telemetry</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
                Utilize the Client Console to monitor usage and track campaigns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Engineered for High-Performance */}
      <section style={{ padding: '96px 20px', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }} id="features">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '64px', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '36px', lineHeight: '1.2', marginBottom: '24px', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                Engineered For <br />
                <span style={{ color: 'var(--color-turquoise)', fontStyle: 'italic' }}>High-Performance</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '40px' }}>
                A custom infrastructure built to replace legacy digital vending with high reliability. We've optimized every layer of the transaction flow.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ color: 'var(--color-turquoise)', flexShrink: 0, paddingTop: '2px' }}>
                    <Check size={18} />
                  </div>
                  <div>
                    <h5 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>Physical SIM Routing</h5>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>Real hardware pools ensure 100% verification success.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ color: 'var(--color-turquoise)', flexShrink: 0, paddingTop: '2px' }}>
                    <Check size={18} />
                  </div>
                  <div>
                    <h5 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>Zero-Roaming eSIM</h5>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>Local profiles avoiding expensive charges with 5G speed.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ color: 'var(--color-turquoise)', flexShrink: 0, paddingTop: '2px' }}>
                    <Check size={18} />
                  </div>
                  <div>
                    <h5 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>Reseller-Grade SMM</h5>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>Direct API backbones providing high-quality engagement.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ color: 'var(--color-turquoise)', flexShrink: 0, paddingTop: '2px' }}>
                    <Check size={18} />
                  </div>
                  <div>
                    <h5 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>Instant Dual-Billing</h5>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>Switch seamlessly between Naira and USD with ease.</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="editorial-card" style={{ padding: '8px', borderRadius: '4px' }}>
                <div style={{ overflow: 'hidden', borderRadius: '2px' }}>
                  <img 
                    style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', filter: 'grayscale(100%)', transition: 'all 0.5s ease' }} 
                    onMouseOver={e => e.currentTarget.style.filter = 'grayscale(0%)'}
                    onMouseOut={e => e.currentTarget.style.filter = 'grayscale(100%)'}
                    alt="Technical high-tech circuit board" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmqRh-EmWlmBzOVlBTtydseqB-CtvVlFFmflEoTpSlmx1-FL5sw-eTb79f5n3cTNdmvo2QxHMLyIU3QSWBMsIF-2mYBFEfHyF0k1JA6rHMx8iTqDp1WT4kc93NiO7l7SgL5ubD2tsdDkWK3nL6OgHyzCZ9OwuzKbAn4-hLElEfQWW5ZeWV54bWu6U8QYrwrtpL60ZtLo1wylo9SAJZkWEiyHfWgnMooFr2EkN75w8Ha4QT7TYZcIg"
                  />
                </div>
                <div style={{ marginTop: '16px', padding: '16px', borderTop: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>99.9% Infrastructure Uptime</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>Global CDN and distributed API architecture for reliability.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section style={{ padding: '96px 20px', background: 'var(--bg-btn-secondary)' }} id="faq">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '36px', marginBottom: '16px', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
              Expert answers to common queries about our digital asset ecosystem.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <details className="editorial-faq-card" style={{ cursor: 'pointer' }}>
              <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', listStyle: 'none', fontWeight: '700', fontSize: '16px', color: 'var(--text-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <HelpCircle size={20} style={{ color: 'var(--color-turquoise)', flexShrink: 0 }} />
                  <span>Are the shared premium accounts safe to use?</span>
                </div>
                <span className="material-symbols-outlined" style={{ transition: 'transform 0.3s ease' }}>expand_more</span>
              </summary>
              <div style={{ padding: '0 24px 24px 24px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Yes, absolutely. All accounts are family slots managed by our automated system. You receive a unique screen credential and password. To prevent disruptions, credentials must not be shared outside your allocated screen slot.
              </div>
            </details>

            <details className="editorial-faq-card" style={{ cursor: 'pointer' }}>
              <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', listStyle: 'none', fontWeight: '700', fontSize: '16px', color: 'var(--text-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <HelpCircle size={20} style={{ color: 'var(--color-turquoise)', flexShrink: 0 }} />
                  <span>What happens if a temporary number doesn't receive an OTP?</span>
                </div>
                <span className="material-symbols-outlined" style={{ transition: 'transform 0.3s ease' }}>expand_more</span>
              </summary>
              <div style={{ padding: '0 24px 24px 24px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Our system operates under a strict success-only guarantee. If a temporary number does not receive an SMS code within its window, the system automatically cancels the request and issues a full refund directly to your wallet balance.
              </div>
            </details>

            <details className="editorial-faq-card" style={{ cursor: 'pointer' }}>
              <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', listStyle: 'none', fontWeight: '700', fontSize: '16px', color: 'var(--text-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <HelpCircle size={20} style={{ color: 'var(--color-turquoise)', flexShrink: 0 }} />
                  <span>How do I install my travel eSIM?</span>
                </div>
                <span className="material-symbols-outlined" style={{ transition: 'transform 0.3s ease' }}>expand_more</span>
              </summary>
              <div style={{ padding: '0 24px 24px 24px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Once purchased, your installation QR code and manual details display in your dashboard under E-Sims. Scan the code in your phone settings while connected to Wi-Fi.
              </div>
            </details>

            <details className="editorial-faq-card" style={{ cursor: 'pointer' }}>
              <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', listStyle: 'none', fontWeight: '700', fontSize: '16px', color: 'var(--text-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <HelpCircle size={20} style={{ color: 'var(--color-turquoise)', flexShrink: 0 }} />
                  <span>Are the SMM boost reseller services instant?</span>
                </div>
                <span className="material-symbols-outlined" style={{ transition: 'transform 0.3s ease' }}>expand_more</span>
              </summary>
              <div style={{ padding: '0 24px 24px 24px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Yes, most SMM reseller orders trigger instantly. High-volume requests queue and process progressively. Monitor progress via the order tracker in your dashboard.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Ready to Scale Section */}
      <section style={{ padding: '96px 20px', background: 'var(--bg-main)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ background: 'var(--gradient-primary)', borderRadius: '4px', padding: '80px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-glow)' }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <h2 style={{ fontSize: '42px', color: '#ffffff', marginBottom: '24px', fontFamily: 'var(--font-heading)', lineHeight: '1.2' }}>Ready to Scale Your <br />Digital Presence?</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '18px', maxWidth: '600px', margin: '0 auto 48px', lineHeight: '1.6' }}>Join over 100,000+ users trusting discountzar.ng for reliable and affordable digital assets.</p>
              <button className="btn" style={{ padding: '16px 40px', background: '#ffffff', color: 'var(--color-turquoise)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '13px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'var(--font-label)' }} onClick={() => navigate('/login')}>
                Get Started Now
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ background: '#0a090e', padding: '80px 20px 40px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px', maxWidth: '1200px', margin: '0 auto' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <img src="/logo.png" alt="ZAR Logo" style={{ width: '56px', height: '56px', objectFit: 'contain', borderRadius: '10px', flexShrink: 0 }} />
            </div>
            <p style={{ fontSize: '13px', lineHeight: '1.6', margin: '0 0 24px 0', color: '#94a3b8', fontFamily: 'var(--font-sans)' }}>
              Premium digital gateway providing instant access to global services, communication tools, and social growth assets.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '24px', fontFamily: 'var(--font-label)' }}>Product</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <li><span style={{ cursor: 'pointer', color: '#94a3b8', transition: 'color 0.2s ease' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'} onClick={() => navigate('/dashboard/subs')}>Shared Accounts</span></li>
              <li><span style={{ cursor: 'pointer', color: '#94a3b8', transition: 'color 0.2s ease' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'} onClick={() => navigate('/dashboard/esim')}>Global eSIM</span></li>
              <li><span style={{ cursor: 'pointer', color: '#94a3b8', transition: 'color 0.2s ease' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'} onClick={() => navigate('/dashboard/otp')}>SMS OTP</span></li>
              <li><span style={{ cursor: 'pointer', color: '#94a3b8', transition: 'color 0.2s ease' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'} onClick={() => navigate('/dashboard/smm')}>SMM Panel</span></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '24px', fontFamily: 'var(--font-label)' }}>Support</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <li><span style={{ cursor: 'pointer', color: '#94a3b8', transition: 'color 0.2s ease' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'} onClick={() => navigate('/dashboard/support')}>Help Center</span></li>
              <li><span style={{ cursor: 'pointer', color: '#94a3b8', transition: 'color 0.2s ease' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'} onClick={() => navigate('/dashboard/api')}>API Documentation</span></li>
              <li><span style={{ cursor: 'pointer', color: '#94a3b8', transition: 'color 0.2s ease' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'} onClick={() => navigate('/terms')}>Refund Policy</span></li>
              <li><span style={{ cursor: 'pointer', color: '#94a3b8', transition: 'color 0.2s ease' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'} onClick={() => navigate('/dashboard/support')}>Support Ticket</span></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '24px', fontFamily: 'var(--font-label)' }}>Legal</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <li><span style={{ cursor: 'pointer', color: '#94a3b8', transition: 'color 0.2s ease' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'} onClick={() => navigate('/terms')}>Terms of Service</span></li>
              <li><span style={{ cursor: 'pointer', color: '#94a3b8', transition: 'color 0.2s ease' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'} onClick={() => navigate('/privacy')}>Privacy Policy</span></li>
            </ul>
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '80px auto 0', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', fontSize: '11px', color: '#71717a' }}>
          © 2026 discountzar.ng. Built as a premium high-fidelity service prototype. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

const LiveDemoSimulator = () => {
  const [activeTab, setActiveTab] = useState('otp');
  const [step, setStep] = useState(0);
  const [followerCount, setFollowerCount] = useState(14250);

  // Handle step increments based on activeTab
  useEffect(() => {
    setStep(0);
    setFollowerCount(14250);
  }, [activeTab]);

  useEffect(() => {
    let interval = null;
    
    if (activeTab === 'otp') {
      interval = setInterval(() => {
        setStep(curr => {
          if (curr >= 5) return 0;
          return curr + 1;
        });
      }, 2500);
    } else if (activeTab === 'esim') {
      interval = setInterval(() => {
        setStep(curr => {
          if (curr >= 3) return 0;
          return curr + 1;
        });
      }, 3000);
    } else if (activeTab === 'smm') {
      interval = setInterval(() => {
        setStep(curr => {
          if (curr >= 3) return 0;
          return curr + 1;
        });
      }, 3500);
    }

    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'smm' && step === 2) {
      let count = 14250;
      const target = 15250;
      const countInterval = setInterval(() => {
        count += 50;
        if (count >= target) {
          setFollowerCount(target);
          clearInterval(countInterval);
        } else {
          setFollowerCount(count);
        }
      }, 100);
      return () => clearInterval(countInterval);
    } else {
      setFollowerCount(14250);
    }
  }, [activeTab, step]);

  const tabs = [
    { id: 'otp', label: 'OTP Verifications', desc: 'Secure real SIM routing', icon: Key, color: 'var(--color-pink)' },
    { id: 'esim', label: 'eSIM Setup', desc: 'QR code profile scanning', icon: Smartphone, color: 'var(--color-turquoise)' },
    { id: 'smm', label: 'SMM Campaign', desc: 'Real-time metrics delivery', icon: Share2, color: 'var(--color-green)' }
  ];

  return (
    <div className="glass-panel animate-slide-in" style={{
      padding: '24px',
      marginTop: '40px',
      border: '1px solid var(--border-color)',
      background: 'var(--bg-card)',
      boxShadow: 'var(--shadow-glow)'
    }}>
      <h3 style={{
        fontSize: '22px',
        marginBottom: '6px',
        fontFamily: 'var(--font-heading)',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <Zap size={18} style={{ color: 'var(--color-turquoise)' }} />
        See It in Action
      </h3>
      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '14px',
        textAlign: 'center',
        maxWidth: '500px',
        margin: '0 auto 28px',
        lineHeight: '1.5'
      }}>
        Select a tool below to watch a simulated micro-animation of our automated delivery loops.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        alignItems: 'center'
      }}>
        {/* Left: Tab Selectors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tabs.map(t => {
            const active = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => { setActiveTab(t.id); setStep(0); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px',
                  borderRadius: '12px',
                  border: `1px solid ${active ? t.color : 'var(--border-color)'}`,
                  background: active ? `rgba(${t.id === 'otp' ? '255, 0, 127' : t.id === 'esim' ? '0, 242, 254' : '0, 255, 135'}, 0.06)` : 'var(--bg-btn-secondary)',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  background: `rgba(${t.id === 'otp' ? '255, 0, 127' : t.id === 'esim' ? '0, 242, 254' : '0, 255, 135'}, 0.1)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: t.color
                }}>
                  <Icon size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px' }}>{t.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Device Viewport Mockup */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          height: '280px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
        }}>
          {/* Glowing background highlights */}
          <div style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            filter: 'blur(50px)',
            opacity: 0.12,
            background: activeTab === 'otp' ? 'var(--color-pink)' : activeTab === 'esim' ? 'var(--color-turquoise)' : 'var(--color-green)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
          }} />

          {/* OTP SIMULATION */}
          {activeTab === 'otp' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
              {step === 0 && (
                <>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Service: WhatsApp (US Number)</div>
                  <div style={{ width: '80%', padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center', fontSize: '13px' }}>
                    Click button to query SIM pool
                  </div>
                  <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px', background: 'var(--color-pink)' }}>
                    Acquire Virtual SIM
                  </button>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="spinner-loader" style={{ width: '32px', height: '32px', border: '3px solid rgba(255, 0, 127, 0.2)', borderTopColor: 'var(--color-pink)' }} />
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Connecting SMS Gateway...</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Searching for available physical US numbers</div>
                </>
              )}

              {step === 2 && (
                <>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Allocated: <strong style={{ color: 'var(--text-primary)' }}>+1 (312) 584-9021</strong></div>
                  <div style={{ width: '90%', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', textAlign: 'center', fontSize: '12px' }}>
                    <div className="blink-loader" style={{ color: 'var(--color-amber)', fontWeight: '600' }}>Waiting for SMS Code...</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>Timeout in: 14m 58s</div>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>SIM Inbox: +1 (312) 584-9021</div>
                  <div className="animate-slide-in" style={{
                    width: '95%',
                    padding: '12px',
                    background: 'rgba(255, 0, 127, 0.08)',
                    border: '1px solid rgba(255, 0, 127, 0.2)',
                    borderRadius: '10px',
                    fontSize: '12px',
                    lineHeight: '1.45',
                    position: 'relative'
                  }}>
                    <strong style={{ color: 'var(--color-pink)' }}>WhatsApp Code Received!</strong>
                    <div style={{ color: 'var(--text-primary)', marginTop: '4px' }}>Your verification code: <strong style={{ color: 'var(--color-green)', fontSize: '14px' }}>482-905</strong>. Do not share.</div>
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Autofilling verification boxes...</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['4', '8', '2', '9', '0', '5'].map((char, i) => (
                      <div key={i} style={{
                        width: '32px',
                        height: '36px',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid var(--color-turquoise)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        color: 'var(--color-turquoise)',
                        fontSize: '16px'
                      }}>
                        {char}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {step === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }} className="animate-slide-in">
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(0, 255, 135, 0.1)',
                    border: '2px solid var(--color-green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-green)'
                  }}>
                    <Check size={24} />
                  </div>
                  <div style={{ fontWeight: '700', color: 'var(--color-green)', fontSize: '15px' }}>Verification Successful!</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>WhatsApp activated on US number.</div>
                </div>
              )}
            </div>
          )}

          {/* ESIM SIMULATION */}
          {activeTab === 'esim' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
              {step === 0 && (
                <>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Global eSIM (Europe 10GB Plan)</div>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: '#fff',
                    padding: '6px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-color)'
                  }}>
                    <svg viewBox="0 0 24 24" width="68" height="68">
                      <path d="M0 0h9v9H0V0zm1 1v7h7V1H1zm11 11h9v9h-9v-9zm1 1v7h7v-7h-7zM0 15h9v9H0v-9zm1 1v7h7v-7H1zm14-15h9v9h-9V0zm1 1v7h7V1h-7zm0 11h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm2-2h2v2h-2v-2z" fill="#06040b" />
                    </svg>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Scan QR with phone cellular settings</div>
                </>
              )}

              {step === 1 && (
                <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: '#fff',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg viewBox="0 0 24 24" width="74" height="74">
                      <path d="M0 0h9v9H0V0zm1 1v7h7V1H1zm11 11h9v9h-9v-9zm1 1v7h7v-7h-7zM0 15h9v9H0v-9zm1 1v7h7v-7H1zm14-15h9v9h-9V0zm1 1v7h7V1h-7zm0 11h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm2-2h2v2h-2v-2z" fill="#06040b" />
                    </svg>
                  </div>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'var(--color-turquoise)',
                    boxShadow: '0 0 8px var(--color-turquoise)',
                    top: '20%',
                    animation: 'scanLaser 1.5s infinite ease-in-out'
                  }} />
                  <style>{`
                    @keyframes scanLaser {
                      0%, 100% { top: 10%; }
                      50% { top: 90%; }
                    }
                  `}</style>
                </div>
              )}

              {step === 2 && (
                <>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>eSIM Profile Installation...</div>
                  <div style={{ width: '80%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <div style={{ height: '100%', background: 'var(--color-turquoise)', borderRadius: '99px', animation: 'loadProgress 2s forwards' }} />
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Provisioning 10GB Data Plan (EU network)</div>
                  <style>{`
                    @keyframes loadProgress {
                      0% { width: 0%; }
                      100% { width: 100%; }
                    }
                  `}</style>
                </>
              )}

              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }} className="animate-slide-in">
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(0, 242, 254, 0.1)',
                    border: '2px solid var(--color-turquoise)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-turquoise)'
                  }}>
                    <Check size={24} />
                  </div>
                  <div style={{ fontWeight: '700', color: 'var(--color-turquoise)', fontSize: '15px' }}>eSIM Installed!</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-green)' }}>
                    <span>Global carrier active</span>
                    <strong>5G [|||||]</strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SMM SIMULATION */}
          {activeTab === 'smm' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
              {step === 0 && (
                <>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Boost: Instagram Followers</div>
                  <div style={{
                    width: '90%',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '12px'
                  }}>
                    <div>Link: <strong style={{ color: 'var(--text-primary)' }}>instagram.com/mybrand</strong></div>
                    <div>Quantity: <strong style={{ color: 'var(--text-primary)' }}>1,000</strong></div>
                  </div>
                  <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px', background: 'var(--color-green)', color: '#000', fontWeight: '700' }}>
                    Launch Boost Campaign
                  </button>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="spinner-loader" style={{ width: '32px', height: '32px', border: '3px solid rgba(0, 255, 135, 0.2)', borderTopColor: 'var(--color-green)' }} />
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Initializing campaign queue...</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Wallet deduction: -₦3,000.00</div>
                </>
              )}

              {step === 2 && (
                <>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>SMM Campaign In Progress</div>
                  <div style={{
                    width: '95%',
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target Page</div>
                      <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>@mybrand</strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Live Followers</div>
                      <strong style={{ fontSize: '18px', color: 'var(--color-green)', fontFamily: 'var(--font-heading)' }}>
                        {followerCount.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Drip-feeding at standard algorithm-safe rate</div>
                </>
              )}

              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }} className="animate-slide-in">
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'rgba(0, 255, 135, 0.1)',
                    border: '2px solid var(--color-green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-green)'
                  }}>
                    <Check size={22} />
                  </div>
                  <div style={{ fontWeight: '700', color: 'var(--color-green)', fontSize: '15px' }}>Campaign Finalized!</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total: <strong style={{ color: 'var(--text-primary)' }}>1,000 followers</strong> successfully provisioned.</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
