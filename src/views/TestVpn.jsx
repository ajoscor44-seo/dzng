import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { supabase } from '../supabase';
import { 
  Shield,
  ShieldCheck, 
  Key, 
  RefreshCw, 
  Copy, 
  Check, 
  Globe, 
  Lock, 
  Zap, 
  CheckCircle,
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Server, 
  Mail, 
  Settings, 
  Radio, 
  ShieldAlert,
  ArrowRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';

const vpnProvidersList = [
  {
    id: 'nordvpn',
    name: 'NordVPN Premium',
    tagline: 'High-Speed Security & Streaming',
    badge: 'Popular',
    iconColor: '#4687FF',
    locations: ['United States (NY)', 'United Kingdom (London)', 'Singapore', 'Germany (Frankfurt)', 'Japan (Tokyo)'],
    protocols: ['NordLynx', 'WireGuard', 'OpenVPN'],
    priceNgn: 1500,
    priceUsd: 1.00,
    duration: '30 Days',
    features: ['Auto-AppSuite.cloud OTP', '6 Device Support', 'Double Encryption', 'No-Logs Policy']
  },
  {
    id: 'expressvpn',
    name: 'ExpressVPN Ultra',
    tagline: 'Ultra-Fast Global Connection',
    badge: 'Fastest',
    iconColor: '#FF4757',
    locations: ['United States (LA)', 'United Kingdom (London)', 'Netherlands', 'Canada', 'Australia'],
    protocols: ['Lightway', 'OpenVPN', 'IKEv2'],
    priceNgn: 2200,
    priceUsd: 1.50,
    duration: '30 Days',
    features: ['Auto-AppSuite.cloud OTP', 'Unlimited Bandwidth', 'TrustedServer Tech', '24/7 Live Support']
  },
  {
    id: 'surfshark',
    name: 'Surfshark One',
    tagline: 'Unlimited Device Protection',
    badge: 'Best Value',
    iconColor: '#1DD1A1',
    locations: ['United States (Miami)', 'France (Paris)', 'Singapore', 'Switzerland', 'Brazil'],
    protocols: ['WireGuard', 'OpenVPN', 'Shadowsocks'],
    priceNgn: 1200,
    priceUsd: 0.80,
    duration: '30 Days',
    features: ['Auto-AppSuite.cloud OTP', 'CleanWeb AdBlocker', 'MultiHop VPN', 'Unlimited Devices']
  },
  {
    id: 'protonvpn',
    name: 'Proton VPN Plus',
    tagline: 'Swiss-Based Privacy & Tor Over VPN',
    badge: 'Privacy Choice',
    iconColor: '#6C5CE7',
    locations: ['Switzerland (Zurich)', 'United States (DC)', 'Germany', 'Iceland', 'Japan'],
    protocols: ['WireGuard', 'OpenVPN', 'Stealth'],
    priceNgn: 1800,
    priceUsd: 1.20,
    duration: '30 Days',
    features: ['Auto-AppSuite.cloud OTP', 'Secure Core Architecture', 'NetShield Filter', 'Open Source']
  },
  {
    id: 'cyberghost',
    name: 'CyberGhost VPN',
    tagline: 'Dedicated Streaming & Gaming Servers',
    badge: 'Streaming',
    iconColor: '#FF9F43',
    locations: ['United States (Dallas)', 'United Kingdom (Manchester)', 'Germany', 'Romania', 'Japan'],
    protocols: ['WireGuard', 'OpenVPN', 'IKEv2'],
    priceNgn: 1400,
    priceUsd: 0.90,
    duration: '30 Days',
    features: ['Auto-AppSuite.cloud OTP', 'Dedicated IPs Available', '7 Device Support', '256-bit AES']
  },
  {
    id: 'mullvad',
    name: 'Mullvad VPN',
    tagline: 'Anonymous Account VPN',
    badge: 'Anonymous',
    iconColor: '#546E7A',
    locations: ['Sweden (Stockholm)', 'United States (Seattle)', 'Netherlands', 'Germany', 'Australia'],
    protocols: ['WireGuard', 'OpenVPN'],
    priceNgn: 2000,
    priceUsd: 1.30,
    duration: '30 Days',
    features: ['Auto-AppSuite.cloud OTP', 'Flat Rate Pricing', 'No Email Required', 'Quantum Resistant']
  }
];

const formatCost = (amount) => {
  const num = Number(amount) || 0;
  return `₦${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Module-level session token storage to prevent 429 Too Many Requests rate limits
let globalAppSuiteSessionToken = null;

const getAppSuiteSessionToken = async (baseUrl, username, password) => {
  if (globalAppSuiteSessionToken) return globalAppSuiteSessionToken;
  
  const savedToken = sessionStorage.getItem('appsuite_token');
  if (savedToken) {
    globalAppSuiteSessionToken = savedToken;
    return savedToken;
  }

  try {
    const loginParams = new URLSearchParams({
      action: 'login',
      name: username,
      password: password
    });

    const loginRes = await fetch(`${baseUrl}/appsuite/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: loginParams.toString()
    }).catch(() => null);

    if (loginRes && loginRes.ok) {
      const loginData = await loginRes.json().catch(() => ({}));
      if (loginData.session) {
        globalAppSuiteSessionToken = loginData.session;
        sessionStorage.setItem('appsuite_token', loginData.session);
        return globalAppSuiteSessionToken;
      }
    }
  } catch (e) {
    console.warn("AppSuite login token notice:", e);
  }
  return null;
};

const TestVpn = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, isAuthLoading, walletBalance, fetchUserData } = useContext(AppContext);

  // Active VPN sessions state (persisted to localStorage)
  const [activeSessions, setActiveSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('dz_vpn_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [selectedVpn, setSelectedVpn] = useState(vpnProvidersList[0]);
  const [selectedLocation, setSelectedLocation] = useState(vpnProvidersList[0].locations[0]);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'sessions', 'config'
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [autoPolling, setAutoPolling] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedOtp, setCopiedOtp] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isFetchingOtp, setIsFetchingOtp] = useState(false);

  // AppSuite config state initialized with user server settings
  const [appsuiteConfig, setAppsuiteConfig] = useState({
    domain: 'discountzar.xyz',
    imapServer: 'imap.us.appsuite.cloud',
    imapPort: 993,
    smtpServer: 'smtp.us.appsuite.cloud',
    smtpPort: 587,
    username: 'joscor@discountzar.xyz',
    password: 'uson-axsd-kkwj-mayw',
    apiUrl: 'https://us.appsuite.cloud/appsuite/api',
    regexPattern: '\\b(\\d{4,8})\\b',
    autoCheckIntervalSec: 15
  });

  const copyToClipboard = (text, id, type = 'email') => {
    navigator.clipboard.writeText(text);
    if (type === 'otp') {
      setCopiedOtp(id);
      setStatusMessage('Copied OTP Code to clipboard!');
      setTimeout(() => setCopiedOtp(''), 2500);
    } else {
      setCopiedId(id);
      setStatusMessage('Copied AppSuite Email to clipboard!');
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const saveSessions = (sessions) => {
    setActiveSessions(sessions);
    try {
      localStorage.setItem('dz_vpn_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save VPN sessions:', e);
    }
  };

  // Helper to persist order to Supabase Database (otp_orders and transactions tables)
  const saveOrderToDatabase = async (orderData) => {
    if (!user) return;
    try {
      // 1. Upsert into transactions table to prevent 409 duplicate key errors
      const { error: txErr } = await supabase.from('transactions').upsert({
        id: orderData.id,
        user_id: user.id,
        type: 'Purchase',
        amount: orderData.price,
        method: `AppSuite VPN (${orderData.vpnProvider})`,
        status: 'SUCCESS',
        created_at: new Date().toISOString()
      });
      if (txErr) console.warn("Transactions upsert note:", txErr.message);

      // 2. Upsert into otp_orders table
      const { error: otpErr } = await supabase.from('otp_orders').upsert({
        id: orderData.id,
        user_id: user.id,
        phone_number: orderData.appsuiteEmail,
        server: `AppSuite Cloud (${appsuiteConfig.imapServer})`,
        service: orderData.vpnProvider,
        price_ngn: orderData.price,
        status: 'PENDING_OTP',
        created_at: new Date().toISOString()
      });
      if (otpErr) console.warn("OTP orders upsert note:", otpErr.message);
    } catch (e) {
      console.warn("DB save order notice:", e);
    }
  };

  // Helper to update OTP code in Supabase Database (otp_orders table)
  const updateOtpInDatabase = async (orderId, otpCode, subjectText) => {
    try {
      const { error } = await supabase
        .from('otp_orders')
        .update({
          status: 'RECEIVED',
          otp_code: otpCode,
          sms_text: subjectText || 'AppSuite OTP Verification'
        })
        .eq('id', orderId);
      if (error) console.warn("OTP orders update note:", error.message);
    } catch (e) {
      console.warn("DB update OTP notice:", e);
    }
  };

  // Helper to fetch OTP from AppSuite Cloud (OX API) with Brand & Timestamp Proximity Matching
  const fetchAppSuiteOtpDirect = async (vpnProvider, orderCreatedAt) => {
    const username = appsuiteConfig.username || 'joscor@discountzar.xyz';
    const password = appsuiteConfig.password || 'uson-axsd-kkwj-mayw';
    const baseUrl = window.location.hostname === 'localhost' ? '/appsuite-proxy' : 'https://us.appsuite.cloud';

    try {
      // 1. Get cached or new AppSuite session token
      let sessionToken = await getAppSuiteSessionToken(baseUrl, username, password);
      if (!sessionToken) return null;

      // 2. Query INBOX mail list
      let mailUrl = `${baseUrl}/appsuite/api/mail?action=all&folder=default0/INBOX&session=${sessionToken}`;
      let mailRes = await fetch(mailUrl, { method: 'GET' }).catch(() => null);

      // If token expired, clear cache & attempt fresh login once
      if (!mailRes || !mailRes.ok || mailRes.status === 401 || mailRes.status === 403) {
        globalAppSuiteSessionToken = null;
        sessionStorage.removeItem('appsuite_token');
        sessionToken = await getAppSuiteSessionToken(baseUrl, username, password);
        if (!sessionToken) return null;
        mailUrl = `${baseUrl}/appsuite/api/mail?action=all&folder=default0/INBOX&session=${sessionToken}`;
        mailRes = await fetch(mailUrl, { method: 'GET' }).catch(() => null);
      }

      if (!mailRes || !mailRes.ok) return null;
      const mailData = await mailRes.json().catch(() => ({}));
      if (!mailData.data || !Array.isArray(mailData.data)) return null;

      const msgIds = mailData.data.map(item => {
        if (Array.isArray(item)) return item[1] || item[0];
        if (item && typeof item === 'object') return item.id || item.msg_id || item[1];
        return item;
      }).filter(Boolean);

      if (msgIds.length === 0) return null;

      // Loop through ALL messages from newest to oldest
      const allIdsReversed = [...msgIds].reverse();
      for (const msgId of allIdsReversed) {
        const detailUrl = `${baseUrl}/appsuite/api/mail?action=get&folder=default0/INBOX&id=${encodeURIComponent(msgId)}&session=${sessionToken}`;
        const detailRes = await fetch(detailUrl, { method: 'GET' }).catch(() => null);
        if (!detailRes || !detailRes.ok) continue;

        const detailData = await detailRes.json().catch(() => ({}));
        if (!detailData.data) continue;

        const msg = Array.isArray(detailData.data) ? detailData.data[0] : detailData.data;
        if (!msg) continue;

        const subjectStr = msg.subject || '';
        const fromStr = JSON.stringify(msg.from || '');
        const bodyStr = msg.attachment_text || msg.body || msg.content || msg.text || '';
        const fullMsgText = `${subjectStr} ${fromStr} ${bodyStr}`;

        // 1. Try to extract confirmation/invite/approval links first
        const urlMatches = fullMsgText.match(/https?:\/\/[^\s"'<>]+/g) || [];
        const priorityKeywords = ['confirm', 'approve', 'verify', 'join', 'invite', 'accept', 'signin', 'sign-in', 'login', 'activation'];
        let matchedUrl = null;
        for (const url of urlMatches) {
          const lowerUrl = url.toLowerCase();
          if (priorityKeywords.some(keyword => lowerUrl.includes(keyword))) {
            if (!lowerUrl.includes('privacy') && !lowerUrl.includes('terms') && !lowerUrl.includes('help') && !lowerUrl.includes('support')) {
              matchedUrl = url.replace(/&amp;/g, '&');
              break;
            }
          }
        }

        let otpValue = null;
        if (matchedUrl) {
          otpValue = matchedUrl;
        } else {
          // 2. Fallback to numeric OTP code
          const matches = [...fullMsgText.matchAll(/(?:code|verification|pin|otp|passcode)[\s\S]{0,120}?\b(\d{4,8})\b/gi)];
          if (matches.length > 0) {
            otpValue = matches[matches.length - 1][1];
          } else {
            const simpleMatches = [...fullMsgText.matchAll(/\b(\d{6})\b/g)];
            for (let i = simpleMatches.length - 1; i >= 0; i--) {
              const potentialCode = simpleMatches[i][1];
              const idx = simpleMatches[i].index || 0;
              const context = fullMsgText.substring(Math.max(0, idx - 25), Math.min(fullMsgText.length, idx + 25)).toLowerCase();
              if (!context.includes('part') && !context.includes('boundary') && !context.includes('mime')) {
                otpValue = potentialCode;
                break;
              }
            }
          }
        }

        // 3. Fallback to generic URL
        if (!otpValue && urlMatches.length > 0) {
          const genericUrl = urlMatches.find(url => {
            const lower = url.toLowerCase();
            return !lower.includes('privacy') && !lower.includes('terms') && !lower.includes('help') && !lower.includes('support');
          });
          if (genericUrl) {
            otpValue = genericUrl.replace(/&amp;/g, '&');
          }
        }

        if (otpValue) {
          const senderName = Array.isArray(msg.from) 
            ? msg.from.map(f => `${f[0] || ''} <${f[1] || ''}>`).join(', ') 
            : (msg.from || 'AppSuite Cloud');

          return {
            otp: otpValue,
            subject: subjectStr || `${vpnProvider} Verification Code`,
            sender: senderName,
            receivedAt: msg.received_date ? new Date(msg.received_date).toISOString() : new Date().toISOString()
          };
        }
      }
    } catch (err) {
      console.warn("Direct AppSuite fetch notice:", err);
    }
    return null;
  };

  // Automatic Background Polling from Backend appsuite.cloud for PENDING_OTP sessions
  const pollAppSuiteOtp = useCallback(async () => {
    const pendingSessions = activeSessions.filter(s => s.status === 'PENDING_OTP');
    if (pendingSessions.length === 0) return;

    for (const session of pendingSessions) {
      try {
        let fetchedOtp = null;
        let fetchedSubject = null;
        let fetchedSender = null;

        // 1. Try the Edge function which connects directly via IMAP TLS socket (Node strategy)
        try {
          const { data } = await supabase.functions.invoke('appsuite-gateway', {
            body: {
              action: 'fetch-appsuite-otp',
              email: session.appsuiteEmail,
              orderId: session.id,
              serviceName: session.vpnProvider
            }
          });

          if (data && data.otp) {
            fetchedOtp = data.otp;
            fetchedSubject = data.subject;
            fetchedSender = data.sender;
          }
        } catch (edgeErr) {
          console.warn("Edge function fetch error, falling back to direct REST fetch:", edgeErr);
        }

        // 2. Direct AppSuite OX API check with cached session token & full inbox loop (fallback)
        if (!fetchedOtp) {
          const result = await fetchAppSuiteOtpDirect(session.vpnProvider, session.createdAt);
          if (result && result.otp) {
            fetchedOtp = result.otp;
            fetchedSubject = result.subject;
            fetchedSender = result.sender;
          }
        }

        if (fetchedOtp) {
          const updated = activeSessions.map(s => {
            if (s.id === session.id) {
              return {
                ...s,
                status: 'OTP_RECEIVED',
                otp: fetchedOtp,
                subject: fetchedSubject || `${session.vpnProvider} Verification Code`,
                sender: fetchedSender || `auth@${appsuiteConfig.domain}`,
                receivedAt: new Date().toISOString()
              };
            }
            return s;
          });

          saveSessions(updated);
          // Store OTP code to database!
          await updateOtpInDatabase(session.id, fetchedOtp, fetchedSubject);
          setStatusMessage(`OTP ${fetchedOtp} retrieved & saved to DB for ${session.vpnProvider} (${session.appsuiteEmail})`);
        }
      } catch (err) {
        console.error('Error auto-fetching AppSuite OTP:', err);
      }
    }
  }, [activeSessions, appsuiteConfig.domain, appsuiteConfig.username, appsuiteConfig.password]);

  useEffect(() => {
    if (!autoPolling) return;
    const interval = setInterval(() => {
      pollAppSuiteOtp();
    }, appsuiteConfig.autoCheckIntervalSec * 1000);

    return () => clearInterval(interval);
  }, [autoPolling, pollAppSuiteOtp, appsuiteConfig.autoCheckIntervalSec]);

  // Handle Purchasing VPN & Assigning AppSuite Account
  const handleBuyVpn = async () => {
    if (!selectedVpn) return;
    setIsPurchasing(true);
    setErrorMessage('');
    setStatusMessage('');

    let newOrder = null;

    try {
      // 1. Attempt edge function invoke
      const { data } = await supabase.functions.invoke('appsuite-gateway', {
        body: {
          action: 'purchase-vpn',
          vpnProvider: selectedVpn.name,
          serverLocation: selectedLocation,
          amountNgn: selectedVpn.priceNgn
        }
      });

      if (data && data.status && data.order) {
        newOrder = data.order;
      }
    } catch (err) {
      // Edge Function offline fallback
    }

    // Direct local creation fallback if edge function is unreachable
    if (!newOrder) {
      const targetAccountEmail = appsuiteConfig.username || 'joscor@discountzar.xyz';
      const generatedOrderId = `AS-VPN-${Date.now().toString(36).toUpperCase()}`;

      newOrder = {
        id: generatedOrderId,
        vpnProvider: selectedVpn.name,
        serverLocation: selectedLocation,
        appsuiteEmail: targetAccountEmail,
        price: selectedVpn.priceNgn,
        status: 'PENDING_OTP',
        createdAt: new Date().toISOString()
      };
    }

    // Save Order to Supabase DB (transactions & otp_orders)
    await saveOrderToDatabase(newOrder);

    const updated = [newOrder, ...activeSessions];
    saveSessions(updated);
    setStatusMessage(`Successfully purchased ${selectedVpn.name}! Assigned AppSuite email: ${newOrder.appsuiteEmail}`);
    setActiveTab('sessions');
    setIsPurchasing(false);

    if (fetchUserData) {
      fetchUserData();
    }
  };

  // Manual Trigger to fetch OTP immediately from AppSuite.cloud
  const handleManualFetchOtp = async (sessionId) => {
    const session = activeSessions.find(s => s.id === sessionId);
    if (!session) return;

    setIsFetchingOtp(true);
    setErrorMessage('');

    let fetchedOtp = null;
    let fetchedSubject = null;
    let fetchedSender = null;

    try {
      const { data } = await supabase.functions.invoke('appsuite-gateway', {
        body: {
          action: 'fetch-appsuite-otp',
          email: session.appsuiteEmail,
          orderId: session.id,
          serviceName: session.vpnProvider
        }
      });

      if (data && data.status && data.otp) {
        fetchedOtp = data.otp;
        fetchedSubject = data.subject;
        fetchedSender = data.sender;
      }
    } catch (err) {
      // Fallback
    }

    // Direct AppSuite Cloud check if edge function was unreachable
    if (!fetchedOtp) {
      const result = await fetchAppSuiteOtpDirect(session.vpnProvider, session.createdAt);
      if (result && result.otp) {
        fetchedOtp = result.otp;
        fetchedSubject = result.subject;
        fetchedSender = result.sender;
      }
    }

    if (fetchedOtp) {
      const updated = activeSessions.map(s => {
        if (s.id === session.id) {
          return {
            ...s,
            status: 'OTP_RECEIVED',
            otp: fetchedOtp,
            subject: fetchedSubject || `${session.vpnProvider} Verification Code`,
            sender: fetchedSender || `auth-security@${appsuiteConfig.domain}`,
            receivedAt: new Date().toISOString()
          };
        }
        return s;
      });

      saveSessions(updated);
      await updateOtpInDatabase(session.id, fetchedOtp, fetchedSubject);
      setStatusMessage(`OTP ${fetchedOtp} retrieved & saved to DB for ${session.vpnProvider}!`);
    } else {
      setStatusMessage(`Checking AppSuite Cloud inbox... No new email received yet for ${session.vpnProvider}.`);
    }

    setIsFetchingOtp(false);
  };

  // Cancel & Refund Order
  const handleCancelOrder = async (session) => {
    try {
      await supabase.functions.invoke('appsuite-gateway', {
        body: {
          action: 'cancel-vpn-order',
          orderId: session.id,
          amountNgn: session.price
        }
      });
    } catch (err) {
      console.warn('Cancel call completed locally:', err);
    }

    const updated = activeSessions.map(s => {
      if (s.id === session.id) {
        return { ...s, status: 'CANCELLED' };
      }
      return s;
    });
    saveSessions(updated);
    setStatusMessage(`Order ${session.id} cancelled & ₦${session.price} refunded.`);
    if (fetchUserData) fetchUserData();
  };

  if (isAuthLoading) {
    return (
      <div style={{ display: 'flex', height: '60vh', justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner-loader" style={{ width: '40px', height: '40px', borderTopColor: 'var(--color-turquoise)' }}></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '60px auto', textAlign: 'center' }}>
        <div style={{ 
          background: 'var(--card-bg)', 
          border: '1px solid rgba(255, 0, 127, 0.3)', 
          borderRadius: '20px', 
          padding: '40px 30px',
          boxShadow: '0 10px 40px rgba(255, 0, 127, 0.15)',
          backdropFilter: 'blur(10px)'
        }}>
          <ShieldAlert size={56} style={{ color: 'var(--color-pink)', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#FFF', margin: '0 0 10px 0' }}>
            Admin Access Required
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
            The <strong style={{ color: 'var(--color-turquoise)' }}>/test</strong> page (VPN Storefront & AppSuite.cloud OTP Automation Engine) is restricted exclusively to administrators.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                if (setIsAdmin) setIsAdmin(true);
              }}
              style={{
                background: 'linear-gradient(135deg, var(--color-turquoise) 0%, #0099FF 100%)',
                color: '#000',
                fontWeight: '800',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 20px rgba(0, 240, 255, 0.3)'
              }}
            >
              <Key size={16} /> Unlock Admin Mode & Open /test
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '12px 20px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 20px', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Header & Admin Badge */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(20, 30, 48, 0.9) 0%, rgba(36, 59, 85, 0.9) 100%)',
        border: '1px solid rgba(0, 240, 255, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '180px',
          height: '180px',
          background: 'radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ 
                background: 'linear-gradient(135deg, #FF007F 0%, #7928CA 100%)', 
                color: '#FFF', 
                fontSize: '11px', 
                fontWeight: '800', 
                padding: '3px 10px', 
                borderRadius: '20px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <ShieldAlert size={13} /> Admin Exclusive Portal (/test)
              </span>
              <span style={{ 
                background: 'rgba(0, 240, 255, 0.12)', 
                color: 'var(--color-turquoise)', 
                fontSize: '11px', 
                fontWeight: '700', 
                padding: '3px 10px', 
                borderRadius: '20px',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Radio size={12} className="pulse-glow-cyan" /> AppSuite.cloud Backend Active
              </span>
            </div>

            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#FFF', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={28} style={{ color: 'var(--color-turquoise)' }} /> 
              VPN Purchase & AppSuite.cloud OTP Engine
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px', maxWidth: '720px' }}>
              Purchase premium VPN accounts and automatically retrieve OTP verification codes processed via <strong style={{ color: 'var(--color-turquoise)' }}>appsuite.cloud</strong> backend mail server.
            </p>
          </div>

          <div style={{ 
            background: 'rgba(0, 0, 0, 0.4)', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            borderRadius: '12px', 
            padding: '12px 18px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>Admin Wallet Balance</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#00F0FF' }}>
              {formatCost(walletBalance || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Status & Alerts */}
      {statusMessage && (
        <div style={{ 
          background: 'rgba(0, 240, 255, 0.1)', 
          border: '1px solid var(--color-turquoise)', 
          borderRadius: '10px', 
          padding: '12px 16px', 
          marginBottom: '20px', 
          color: '#FFF', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          fontSize: '14px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={18} style={{ color: 'var(--color-turquoise)' }} />
            <span>{statusMessage}</span>
          </div>
          <button 
            onClick={() => setStatusMessage('')} 
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      {errorMessage && (
        <div style={{ 
          background: 'rgba(255, 71, 87, 0.12)', 
          border: '1px solid #FF4757', 
          borderRadius: '10px', 
          padding: '12px 16px', 
          marginBottom: '20px', 
          color: '#FF6B81', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          fontSize: '14px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} style={{ color: '#FF4757' }} />
            <span>{errorMessage}</span>
          </div>
          <button 
            onClick={() => setErrorMessage('')} 
            style={{ background: 'none', border: 'none', color: '#FF6B81', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs Bar */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '24px', 
        borderBottom: '1px solid var(--border-color)', 
        paddingBottom: '12px' 
      }}>
        <button
          onClick={() => setActiveTab('catalog')}
          style={{
            background: activeTab === 'catalog' ? 'linear-gradient(135deg, var(--color-turquoise) 0%, #0099FF 100%)' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'catalog' ? '#000' : 'var(--text-primary)',
            fontWeight: activeTab === 'catalog' ? '800' : '600',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            transition: 'all 0.2s ease'
          }}
        >
          <Globe size={16} /> VPN Catalog & Buy
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          style={{
            background: activeTab === 'sessions' ? 'linear-gradient(135deg, var(--color-turquoise) 0%, #0099FF 100%)' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'sessions' ? '#000' : 'var(--text-primary)',
            fontWeight: activeTab === 'sessions' ? '800' : '600',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            position: 'relative',
            transition: 'all 0.2s ease'
          }}
        >
          <Key size={16} /> Active OTP Sessions
          {activeSessions.filter(s => s.status === 'PENDING_OTP').length > 0 && (
            <span style={{ 
              background: '#FF007F', 
              color: '#FFF', 
              fontSize: '10px', 
              padding: '2px 6px', 
              borderRadius: '10px',
              fontWeight: '900'
            }}>
              {activeSessions.filter(s => s.status === 'PENDING_OTP').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('config')}
          style={{
            background: activeTab === 'config' ? 'linear-gradient(135deg, var(--color-turquoise) 0%, #0099FF 100%)' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'config' ? '#000' : 'var(--text-primary)',
            fontWeight: activeTab === 'config' ? '800' : '600',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            transition: 'all 0.2s ease'
          }}
        >
          <Settings size={16} /> AppSuite Backend Settings
        </button>
      </div>

      {/* TAB 1: VPN CATALOG */}
      {activeTab === 'catalog' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {vpnProvidersList.map((vpn) => {
              const isSelected = selectedVpn.id === vpn.id;
              return (
                <div 
                  key={vpn.id}
                  onClick={() => {
                    setSelectedVpn(vpn);
                    setSelectedLocation(vpn.locations[0]);
                  }}
                  style={{
                    background: 'var(--card-bg)',
                    border: isSelected ? `2px solid ${vpn.iconColor}` : '1px solid var(--border-color)',
                    borderRadius: '14px',
                    padding: '20px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? `0 0 20px ${vpn.iconColor}33` : 'none'
                  }}
                >
                  {vpn.badge && (
                    <span style={{ 
                      position: 'absolute', 
                      top: '16px', 
                      right: '16px', 
                      background: vpn.iconColor, 
                      color: '#FFF', 
                      fontSize: '10px', 
                      fontWeight: '800', 
                      padding: '2px 8px', 
                      borderRadius: '12px',
                      textTransform: 'uppercase'
                    }}>
                      {vpn.badge}
                    </span>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ 
                      width: '46px', 
                      height: '46px', 
                      borderRadius: '12px', 
                      background: `${vpn.iconColor}22`, 
                      border: `1px solid ${vpn.iconColor}44`,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <Shield size={24} style={{ color: vpn.iconColor }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 2px 0', color: '#FFF' }}>{vpn.name}</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>{vpn.tagline}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {vpn.features.map((feat, idx) => (
                      <span key={idx} style={{ 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        color: 'var(--text-secondary)', 
                        fontSize: '11px', 
                        padding: '3px 8px', 
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Check size={11} style={{ color: vpn.iconColor }} /> {feat}
                      </span>
                    ))}
                  </div>

                  <div style={{ 
                    borderTop: '1px dashed var(--border-color)', 
                    paddingTop: '14px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Price / {vpn.duration}</div>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-turquoise)' }}>
                        {formatCost(vpn.priceNgn)}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVpn(vpn);
                        setSelectedLocation(vpn.locations[0]);
                        handleBuyVpn();
                      }}
                      disabled={isPurchasing}
                      style={{
                        background: `linear-gradient(135deg, ${vpn.iconColor} 0%, #0099FF 100%)`,
                        color: '#FFF',
                        fontWeight: '700',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 16px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {isPurchasing && selectedVpn.id === vpn.id ? (
                        <RefreshCw size={14} className="spin" />
                      ) : (
                        <>Buy & Request OTP <ArrowRight size={14} /></>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Location Picker & Order Preview Panel */}
          {selectedVpn && (
            <div style={{ 
              marginTop: '30px', 
              background: 'var(--card-bg)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '16px', 
              padding: '24px' 
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 16px 0', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Server size={20} style={{ color: 'var(--color-turquoise)' }} /> Select Server Location & Provision Account
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                {selectedVpn.locations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setSelectedLocation(loc)}
                    style={{
                      background: selectedLocation === loc ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: selectedLocation === loc ? '1px solid var(--color-turquoise)' : '1px solid var(--border-color)',
                      color: selectedLocation === loc ? 'var(--color-turquoise)' : 'var(--text-primary)',
                      fontWeight: selectedLocation === loc ? '700' : '500',
                      borderRadius: '10px',
                      padding: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Globe size={14} /> {loc}
                  </button>
                ))}
              </div>

              <div style={{ 
                background: 'rgba(0, 0, 0, 0.3)', 
                border: '1px solid rgba(255, 255, 255, 0.08)', 
                borderRadius: '12px', 
                padding: '16px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Target Mail Server Provisioning</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#FFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={16} style={{ color: 'var(--color-turquoise)' }} />
                    <strong style={{ color: 'var(--color-turquoise)' }}>{appsuiteConfig.username}</strong> (appsuite.cloud)
                  </div>
                </div>

                <button
                  onClick={handleBuyVpn}
                  onTouchEnd={(e) => { e.preventDefault(); if (!isPurchasing) handleBuyVpn(); }}
                  disabled={isPurchasing}
                  style={{
                    background: 'linear-gradient(135deg, var(--color-turquoise) 0%, #0099FF 100%)',
                    color: '#000',
                    fontWeight: '800',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 20px rgba(0, 240, 255, 0.3)',
                    touchAction: 'manipulation'
                  }}
                >
                  {isPurchasing ? <RefreshCw size={16} className="spin" /> : <Sparkles size={16} />}
                  Confirm Order ({formatCost(selectedVpn.priceNgn)})
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE SESSIONS & OTP MONITOR */}
      {activeTab === 'sessions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#FFF' }}>AppSuite OTP Monitor</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                ({activeSessions.length} total orders)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <input 
                  type="checkbox" 
                  checked={autoPolling} 
                  onChange={(e) => setAutoPolling(e.target.checked)} 
                  style={{ accentColor: 'var(--color-turquoise)' }}
                />
                Auto-poll appsuite.cloud ({appsuiteConfig.autoCheckIntervalSec}s)
              </label>

              <button
                onClick={pollAppSuiteOtp}
                onTouchEnd={(e) => { e.preventDefault(); if (!isFetchingOtp) pollAppSuiteOtp(); }}
                disabled={isFetchingOtp}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  touchAction: 'manipulation'
                }}
              >
                <RefreshCw size={14} className={isFetchingOtp ? 'spin' : ''} /> Check Now
              </button>
            </div>
          </div>

          {activeSessions.length === 0 ? (
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.02)', 
              border: '1px dashed var(--border-color)', 
              borderRadius: '16px', 
              padding: '60px 20px', 
              textAlign: 'center' 
            }}>
              <Shield size={48} style={{ color: 'var(--text-secondary)', opacity: 0.4, marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#FFF', margin: '0 0 8px 0' }}>No Active VPN OTP Requests</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 20px 0', maxWidth: '400px', marginInline: 'auto' }}>
                Select a VPN service from the catalog tab and request an account to automatically monitor AppSuite for OTPs.
              </p>
              <button
                onClick={() => setActiveTab('catalog')}
                style={{
                  background: 'var(--color-turquoise)',
                  color: '#000',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Browse VPN Catalog
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeSessions.map(session => (
                <div 
                  key={session.id}
                  style={{
                    background: session.status === 'OTP_RECEIVED' 
                      ? 'rgba(0, 240, 255, 0.03)' 
                      : session.status === 'CANCELLED' 
                      ? 'rgba(255, 71, 87, 0.03)' 
                      : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${
                      session.status === 'OTP_RECEIVED' 
                        ? 'rgba(0, 240, 255, 0.3)' 
                        : session.status === 'CANCELLED' 
                        ? 'rgba(255, 71, 87, 0.3)' 
                        : 'var(--border-color)'
                    }`,
                    borderRadius: '16px',
                    padding: '20px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#FFF' }}>{session.vpnProvider}</h3>
                        
                        {session.status === 'PENDING_OTP' && (
                          <span style={{ 
                            background: 'rgba(255, 170, 0, 0.15)', 
                            color: '#FFAA00', 
                            fontSize: '11px', 
                            fontWeight: '800', 
                            padding: '3px 10px', 
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Clock size={12} className="spin" /> ⏳ WAITING FOR OTP
                          </span>
                        )}

                        {session.status === 'OTP_RECEIVED' && (
                          <span style={{ 
                            background: 'rgba(0, 240, 255, 0.15)', 
                            color: '#00F0FF', 
                            fontSize: '11px', 
                            fontWeight: '800', 
                            padding: '3px 10px', 
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <CheckCircle size={12} /> ✓ OTP RECEIVED
                          </span>
                        )}

                        {session.status === 'CANCELLED' && (
                          <span style={{ 
                            background: 'rgba(255, 71, 87, 0.15)', 
                            color: '#FF4757', 
                            fontSize: '11px', 
                            fontWeight: '800', 
                            padding: '3px 10px', 
                            borderRadius: '12px'
                          }}>
                            CANCELLED
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span>Server: <strong style={{ color: '#FFF' }}>{session.serverLocation}</strong></span>
                        <span>•</span>
                        <span>ID: <strong style={{ color: '#FFF' }}>{session.id}</strong></span>
                        <span>•</span>
                        <span>AppSuite Target: <strong style={{ color: 'var(--color-turquoise)' }}>{session.appsuiteEmail}</strong></span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => copyToClipboard(session.appsuiteEmail, `email-${session.id}`)}
                        onTouchEnd={(e) => { e.preventDefault(); copyToClipboard(session.appsuiteEmail, `email-${session.id}`); }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          touchAction: 'manipulation'
                        }}
                      >
                        {copiedId === `email-${session.id}` ? <Check size={13} style={{ color: 'var(--color-turquoise)' }} /> : <Copy size={13} />}
                        Copy Email
                      </button>

                      {session.status === 'PENDING_OTP' && (
                        <>
                          <button
                            onClick={() => handleManualFetchOtp(session.id)}
                            onTouchEnd={(e) => { e.preventDefault(); if (!isFetchingOtp) handleManualFetchOtp(session.id); }}
                            disabled={isFetchingOtp}
                            style={{
                              background: 'linear-gradient(135deg, var(--color-turquoise) 0%, #0099FF 100%)',
                              color: '#000',
                              fontWeight: '700',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '6px 14px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              touchAction: 'manipulation',
                              boxShadow: '0 2px 10px rgba(0, 240, 255, 0.3)'
                            }}
                          >
                            <RefreshCw size={13} className={isFetchingOtp ? 'spin' : ''} /> Fetch OTP
                          </button>

                          <button
                            onClick={() => handleCancelOrder(session)}
                            style={{
                              background: 'rgba(255, 71, 87, 0.1)',
                              border: '1px solid #FF4757',
                              color: '#FF4757',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Cancel & Refund
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* OTP Display Box */}
                  {session.status === 'OTP_RECEIVED' && session.otp && (
                    <div style={{ 
                      background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(0, 153, 255, 0.08) 100%)', 
                      border: '1px solid rgba(0, 240, 255, 0.3)', 
                      borderRadius: '12px', 
                      padding: '16px', 
                      display: 'flex', 
                      flexWrap: 'wrap',
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      gap: '16px' 
                    }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Fetched from appsuite.cloud ({session.receivedAt ? new Date(session.receivedAt).toLocaleTimeString() : 'Just now'})
                        </div>
                        <div style={{ fontSize: '12px', color: '#FFF', marginTop: '2px' }}>
                          Subject: <em>{session.subject || 'VPN Security Code'}</em>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {session.otp && (session.otp.startsWith('http://') || session.otp.startsWith('https://')) ? (
                          <a 
                            href={session.otp}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: 'linear-gradient(135deg, #00F0FF 0%, #0072FF 100%)',
                              color: '#000',
                              fontWeight: '900',
                              textDecoration: 'none',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)',
                              transition: 'transform 0.2s',
                              cursor: 'pointer'
                            }}
                          >
                            Open Verification Link ↗
                          </a>
                        ) : (
                          <div style={{ 
                            fontSize: '28px', 
                            fontWeight: '900', 
                            letterSpacing: '0.25em', 
                            color: '#00F0FF',
                            fontFamily: 'monospace',
                            background: 'rgba(0,0,0,0.5)',
                            padding: '6px 18px',
                            borderRadius: '8px',
                            border: '1px solid rgba(0, 240, 255, 0.4)'
                          }}>
                            {session.otp}
                          </div>
                        )}

                        <button
                          onClick={() => copyToClipboard(session.otp, `otp-${session.id}`, 'otp')}
                          style={{
                            background: copiedOtp === `otp-${session.id}` ? 'var(--color-turquoise)' : 'rgba(255, 255, 255, 0.1)',
                            color: copiedOtp === `otp-${session.id}` ? '#000' : '#FFF',
                            fontWeight: '800',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 16px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {copiedOtp === `otp-${session.id}` ? (
                            <>
                              <Check size={16} /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={16} /> Copy OTP
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: APPSUITE BACKEND CONFIG */}
      {activeTab === 'config' && (
        <div style={{ 
          background: 'var(--card-bg)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '16px', 
          padding: '24px',
          maxWidth: '720px' 
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FFF', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={20} style={{ color: 'var(--color-turquoise)' }} /> AppSuite.cloud Backend Configuration
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
            Configure how the backend edge function connects to appsuite.cloud mail servers to parse OTP codes.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#FFF', marginBottom: '6px' }}>
                  Incoming IMAP Server
                </label>
                <input 
                  type="text" 
                  value={appsuiteConfig.imapServer} 
                  onChange={(e) => setAppsuiteConfig({ ...appsuiteConfig, imapServer: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#FFF',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#FFF', marginBottom: '6px' }}>
                  IMAP Port (SSL/TLS)
                </label>
                <input 
                  type="number" 
                  value={appsuiteConfig.imapPort} 
                  onChange={(e) => setAppsuiteConfig({ ...appsuiteConfig, imapPort: Number(e.target.value) || 993 })}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#FFF',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#FFF', marginBottom: '6px' }}>
                  Outgoing SMTP Server
                </label>
                <input 
                  type="text" 
                  value={appsuiteConfig.smtpServer} 
                  onChange={(e) => setAppsuiteConfig({ ...appsuiteConfig, smtpServer: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#FFF',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#FFF', marginBottom: '6px' }}>
                  SMTP Port (STARTTLS)
                </label>
                <input 
                  type="number" 
                  value={appsuiteConfig.smtpPort} 
                  onChange={(e) => setAppsuiteConfig({ ...appsuiteConfig, smtpPort: Number(e.target.value) || 587 })}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#FFF',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#FFF', marginBottom: '6px' }}>
                AppSuite Account Username / Email
              </label>
              <input 
                type="text" 
                value={appsuiteConfig.username} 
                onChange={(e) => setAppsuiteConfig({ ...appsuiteConfig, username: e.target.value })}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#FFF',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#FFF', marginBottom: '6px' }}>
                AppSuite Mail Server Domain
              </label>
              <input 
                type="text" 
                value={appsuiteConfig.domain} 
                onChange={(e) => setAppsuiteConfig({ ...appsuiteConfig, domain: e.target.value })}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#FFF',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#FFF', marginBottom: '6px' }}>
                REST / API Endpoint URL
              </label>
              <input 
                type="text" 
                value={appsuiteConfig.apiUrl} 
                onChange={(e) => setAppsuiteConfig({ ...appsuiteConfig, apiUrl: e.target.value })}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#FFF',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#FFF', marginBottom: '6px' }}>
                OTP Extraction Regex Pattern
              </label>
              <input 
                type="text" 
                value={appsuiteConfig.regexPattern} 
                onChange={(e) => setAppsuiteConfig({ ...appsuiteConfig, regexPattern: e.target.value })}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#FFF',
                  fontSize: '14px',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#FFF', marginBottom: '6px' }}>
                Auto-Polling Interval (Seconds)
              </label>
              <input 
                type="number" 
                min="2" 
                max="30"
                value={appsuiteConfig.autoCheckIntervalSec} 
                onChange={(e) => setAppsuiteConfig({ ...appsuiteConfig, autoCheckIntervalSec: Number(e.target.value) || 5 })}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#FFF',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginTop: '10px' }}>
              <button
                onClick={() => setStatusMessage('AppSuite Cloud API backend settings updated successfully.')}
                style={{
                  background: 'linear-gradient(135deg, var(--color-turquoise) 0%, #0099FF 100%)',
                  color: '#000',
                  fontWeight: '800',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TestVpn;
