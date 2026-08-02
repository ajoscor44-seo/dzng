import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import {
  CreditCard, Smartphone, Key, RefreshCw, Share2, User, ShieldCheck,
  Clock, TrendingUp, Zap, ClipboardList, ArrowRight, Copy, Check, ShoppingBag
} from 'lucide-react';

const DashboardOverview = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext) || {};
  const {
    walletBalance = 0,
    activeOtps = [],
    rentedNumbers = [],
    activeEsims = [],
    smmOrders = [],
    transactions = [],
    formatCost = (v) => v,
  } = context;

  const isMobile = useIsMobile();

  const [copiedId, setCopiedId] = useState(null);
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const recentOtps = activeOtps.slice(0, 5);

  const activeEsimsCount = activeEsims.filter(e => e?.status === 'ACTIVE').length;
  const pendingSmmCount = smmOrders.filter(o => o?.status === 'In Progress').length;
  const recentTransactions = transactions.slice(0, isMobile ? 3 : 4);

  const stats = [
    { label: 'Balance', value: formatCost(walletBalance), icon: CreditCard, color: 'var(--color-turquoise)', bg: 'rgba(72, 58, 172, 0.08)', tab: 'wallet' },
    { label: 'eSIMs', value: activeEsimsCount, icon: Smartphone, color: 'var(--color-violet)', bg: 'rgba(51, 102, 204, 0.08)', tab: 'esim' },
    { label: 'Reuse Num', value: activeOtps.length, icon: RefreshCw, color: 'var(--color-amber)', bg: 'rgba(220, 198, 97, 0.08)', tab: 'reuse' },
    { label: 'SMM', value: smmOrders.length, icon: Share2, color: 'var(--color-green)', bg: 'rgba(16, 185, 129, 0.08)', tab: 'smm' },
  ];

  const quickLinks = [
    { label: 'Accounts', icon: User, tab: 'social' },
    { label: 'Social Logs', icon: ShieldCheck, tab: 'social' },
    { label: 'OTP Code', icon: Key, tab: 'otp' },
    { label: 'Marketplace', icon: ShoppingBag, url: '/marketplace' },
    { label: 'SMM', icon: Share2, tab: 'smm' },
    { label: 'Orders', icon: ClipboardList, tab: 'orders' },
  ];

  /* ── Mobile Layout ── */
  if (isMobile) {
    return (
      <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Balance Hero Card */}
        <div
          onClick={() => navigate('/dashboard/wallet')}
          style={{
            background: 'linear-gradient(135deg, rgba(0,242,254,0.18) 0%, rgba(127,0,255,0.18) 100%)',
            border: '1px solid rgba(0,242,254,0.25)',
            borderRadius: 20,
            padding: '24px 20px',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(0,242,254,0.07)' }} />
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            💳 Wallet Balance
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-turquoise)', letterSpacing: '-0.02em' }}>
            {formatCost(walletBalance)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            Tap to fund <ArrowRight size={12} />
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {stats.slice(1).map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                onClick={() => navigate(`/dashboard/${s.tab}`)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 14,
                  padding: '14px 10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', color: s.color }}>
                  <Icon size={18} />
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-heading)', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontWeight: 600 }}>{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Quick Launch – 3×2 grid */}
        <div className="glass-panel" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} style={{ color: 'var(--color-turquoise)' }} />
            Quick Launch
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {quickLinks.map((ql, i) => {
              const Icon = ql.icon;
              return (
                <button
                  key={i}
                  onClick={() => ql.ext ? window.open(ql.url, '_blank') : navigate(ql.url || `/dashboard/${ql.tab}`)}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 12,
                    padding: '12px 6px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    color: 'var(--text-primary)',
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon size={20} style={{ color: 'var(--color-turquoise)' }} />
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{ql.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="glass-panel" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CreditCard size={14} style={{ color: 'var(--color-pink)' }} />
              Recent Activity
            </div>
            <button
              onClick={() => navigate('/dashboard/orders')}
              style={{ background: 'none', border: 'none', color: 'var(--color-turquoise)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              See All <ArrowRight size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>No transactions yet</div>
            ) : recentTransactions.map(tx => (
              <div key={tx.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', borderRadius: 10,
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{tx.method}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{tx.date}</div>
                </div>
                <div style={{
                  fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-heading)',
                  color: tx.type === 'Deposit' || tx.type === 'Refund' ? 'var(--color-green)' : 'var(--text-primary)'
                }}>
                  {tx.type === 'Deposit' || tx.type === 'Refund' ? '+' : '−'}{formatCost(tx.amountNgn)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent SMS Verifications */}
        <div className="glass-panel" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Key size={14} style={{ color: 'var(--color-turquoise)' }} />
              Recent OTP Verifications
            </div>
            <button
              onClick={() => navigate('/dashboard/otp')}
              style={{ background: 'none', border: 'none', color: 'var(--color-turquoise)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Get New Code <ArrowRight size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentOtps.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>No OTP orders yet</div>
            ) : recentOtps.map(otp => (
              <div key={otp.id} style={{
                padding: '12px', borderRadius: 12,
                background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)',
                display: 'flex', flexDirection: 'column', gap: 8
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '14px' }}>{otp.flag || '🏳️'}</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{otp.service}</span>
                  </div>
                  <span className={`badge ${
                    otp.status === 'COMPLETED' ? 'badge-success' : 
                    otp.status === 'PENDING' ? 'badge-warning' : 'badge-danger'
                  }`} style={{ fontSize: '9px' }}>
                    {otp.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
                    {otp.phoneNumber}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {otp.otpCode ? (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 8, 
                        background: 'rgba(0, 255, 135, 0.08)', 
                        border: '1px dashed var(--color-green)', 
                        padding: '2px 8px', 
                        borderRadius: '6px' 
                      }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: '800', color: 'var(--color-green)' }}>
                          {otp.otpCode}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(otp.otpCode, otp.id);
                          }}
                          style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-green)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Copy Code"
                        >
                          {copiedId === otp.id ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {otp.status === 'PENDING' ? 'Waiting for SMS...' : 'No code'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>


      </div>
    );
  }

  /* ── Desktop Layout ── */
  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Dashboard Overview Header */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>Dashboard Overview</h2>
        <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '15px', margin: 0, fontFamily: 'var(--font-sans)' }}>
          Welcome back. Your digital archives are current.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Column: Main Functionality */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Top Stats Bento Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={idx} 
                  onClick={() => navigate(`/dashboard/${stat.tab}`)}
                  style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.25s ease' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseOut={e => e.currentTarget.style.background = 'var(--bg-card)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <Icon size={20} style={{ color: stat.color }} />
                    <span style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontFamily: 'var(--font-label)' }}>{stat.label}</span>
                  </div>
                  <p style={{ fontSize: '22px', fontWeight: '700', margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Quick Launch Terminal */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-amber)', fontSize: '20px' }}>bolt</span>
              <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Quick Launch Terminal</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {quickLinks.map((ql, i) => {
                const Icon = ql.icon;
                const iconColors = [
                  { text: 'var(--color-turquoise)', bg: 'rgba(72, 58, 172, 0.08)' },
                  { text: 'var(--color-pink)', bg: 'rgba(255, 59, 48, 0.08)' },
                  { text: 'var(--color-amber)', bg: 'rgba(220, 198, 97, 0.08)' },
                  { text: 'var(--color-turquoise)', bg: 'rgba(72, 58, 172, 0.08)' },
                  { text: 'var(--color-green)', bg: 'rgba(16, 185, 129, 0.08)' },
                  { text: 'var(--color-pink)', bg: 'rgba(255, 59, 48, 0.08)' }
                ];
                const col = iconColors[i % iconColors.length];

                return (
                  <button
                    key={i}
                    onClick={() => ql.ext ? window.open(ql.url, '_blank') : navigate(ql.url || `/dashboard/${ql.tab}`)}
                    style={{ background: 'var(--bg-card)', padding: '24px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.25s ease' }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = 'var(--bg-card-hover)';
                      e.currentTarget.querySelector('.icon-circle').style.transform = 'scale(1.1)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = 'var(--bg-card)';
                      e.currentTarget.querySelector('.icon-circle').style.transform = 'scale(1)';
                    }}
                  >
                    <div 
                      className="icon-circle"
                      style={{ width: '48px', height: '48px', borderRadius: '50%', background: col.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: col.text, transition: 'transform 0.25s ease' }}
                    >
                      <Icon size={22} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-label)' }}>
                      {ql.label === 'Accounts' ? 'Accounts Shop' : ql.label === 'OTP Code' ? 'Get OTP Code' : ql.label === 'Orders' ? 'Order History' : ql.label === 'SMM' ? 'SMM Boost' : ql.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent OTP Table Section */}
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-turquoise)', fontSize: '20px' }}>key</span>
                <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Recent OTP Verifications</h3>
              </div>
              <button 
                onClick={() => navigate('/dashboard/otp')}
                className="btn btn-secondary" 
                style={{ padding: '6px 14px', fontSize: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', borderRadius: '8px', cursor: 'pointer' }}
              >
                Get New Code
              </button>
            </div>

            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Phone Number</th>
                    <th>Country</th>
                    <th>Status</th>
                    <th>Verification Code</th>
                    <th>SMS Message</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOtps.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-secondary)' }}>
                        No OTP verifications found.
                      </td>
                    </tr>
                  ) : (
                    recentOtps.map((otp) => (
                      <tr key={otp.id}>
                        <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{otp.service}</td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>{otp.phoneNumber}</td>
                        <td>
                          <span style={{ marginRight: '6px' }}>{otp.flag}</span>
                          <span>{otp.country}</span>
                        </td>
                        <td>
                          <span className={`badge ${
                            otp.status === 'COMPLETED' ? 'badge-success' : 
                            otp.status === 'PENDING' ? 'badge-warning' : 'badge-danger'
                          }`} style={{ fontSize: '9px' }}>
                            {otp.status}
                          </span>
                        </td>
                        <td>
                          {otp.otpCode ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 255, 135, 0.08)', border: '1px dashed var(--color-green)', padding: '2px 8px', borderRadius: '6px' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: '800', color: 'var(--color-green)' }}>{otp.otpCode}</span>
                              <button
                                onClick={() => handleCopy(otp.otpCode, otp.id)}
                                style={{ background: 'none', border: 'none', color: 'var(--color-green)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                                title="Copy Code"
                              >
                                {copiedId === otp.id ? <Check size={12} /> : <Copy size={12} />}
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                              {otp.status === 'PENDING' ? 'Waiting for SMS...' : '—'}
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={otp.smsText || ''}>
                          {otp.smsText || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </td>
                        <td style={{ fontSize: '12px' }}>{otp.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Recent Transactions Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '32px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '380px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-amber)', fontSize: '20px' }}>history</span>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Recent Transactions</h3>
              </div>
              <span 
                onClick={() => navigate('/dashboard/orders')}
                style={{ color: 'var(--color-turquoise)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', fontFamily: 'var(--font-label)' }}
              >
                View All
              </span>
            </div>

            <div className="no-scrollbar" style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingRight: '4px' }}>
              {recentTransactions.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>No transactions recorded.</div>
              ) : (
                recentTransactions.map(tx => {
                  const isPositive = tx.type === 'Deposit' || tx.type === 'Refund';
                  return (
                    <div key={tx.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-label)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                          {tx.method}
                        </h4>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: isPositive ? 'var(--color-green)' : 'var(--color-pink)', fontFamily: 'var(--font-heading)' }}>
                          {isPositive ? '+' : '-'}{formatCost(tx.amountNgn)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tx.date}</span>
                        <span 
                          className="badge" 
                          style={{ 
                            fontSize: '9px', 
                            padding: '2px 8px', 
                            borderRadius: '4px',
                            background: isPositive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 59, 48, 0.08)',
                            color: isPositive ? 'var(--color-green)' : 'var(--color-pink)',
                            border: '1px solid ' + (isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 59, 48, 0.15)')
                          }}
                        >
                          {tx.type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', background: 'var(--bg-main)', borderRadius: '8px' }}>
                <div className="pulse-glow-cyan" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-green)' }} />
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-label)' }}>
                  Server Status: <span style={{ color: 'var(--color-green)', fontWeight: '700', textTransform: 'uppercase' }}>Live</span>
                </p>
              </div>
            </div>

          </div>

          {/* Developer API Gateway Card */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '32px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-turquoise)', fontSize: '20px' }}>terminal</span>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Developer API Gateway</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', fontFamily: 'var(--font-label)' }}>Secret API Key</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '8px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-secondary)' }}>sk_live_zar_••••••••e42f</span>
                  <button 
                    onClick={() => handleCopy('sk_live_zar_483aac9aef902e482f7d3a01ce42f', 'apikey')}
                    style={{ background: 'none', border: 'none', color: 'var(--color-turquoise)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                    title="Copy API Key"
                  >
                    {copiedId === 'apikey' ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', fontFamily: 'var(--font-label)' }}>Endpoint Performance</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Virtual SMS API</span>
                    <span style={{ color: 'var(--color-green)', fontWeight: '600' }}>99.9% Uptime</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>eSIM Provisioning</span>
                    <span style={{ color: 'var(--color-green)', fontWeight: '600' }}>100% Operational</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>SMM Panel Gateway</span>
                    <span style={{ color: 'var(--color-green)', fontWeight: '600' }}>99.8% Online</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/dashboard/api')}
              className="btn btn-secondary" 
              style={{ padding: '10px 16px', fontSize: '13px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', width: '100%' }}
            >
              Access API Documentation
            </button>
          </div>

        </aside>

      </div>
    </div>
  );
};

export default DashboardOverview;
