import React, { useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LandingNav from '../components/LandingNav';
import { AppContext } from '../context/AppContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { 
  Search, Compass, Users, Smartphone, Key, Share2, ShieldCheck,
  ArrowRight, Check, Tag, Info, AlertCircle, ShoppingCart
} from 'lucide-react';

// Import fallback logos from social media logs to ensure premium styling
import facebookLogo from '../assets/facebook.png';
import whatsappLogo from '../assets/whatsapp.jpg';
import xLogo from '../assets/x.jpg';
import appleLogo from '../assets/apple.png';
import gmxLogo from '../assets/gmx.png';
import xproxyLogo from '../assets/xproxy.jpg';
import robloxLogo from '../assets/roblox.jpg';
import yandexLogo from '../assets/yandex.png';
import amazonLogo from '../assets/amazon.jpg';
import chatgptLogo from '../assets/chatgpt.jpeg';
import claudeLogo from '../assets/claude.jpeg';
import netflixLogo from '../assets/netflix.jpeg';
import spotifyLogo from '../assets/spotify.jpeg';
import surfsharkLogo from '../assets/surfshark.jpeg';
import youtubeLogo from '../assets/youtube.jpeg';

const Marketplace = () => {
  const { 
    otpServices, 
    smmServices, 
    formatCost, 
    isLoggedIn, 
    walletBalance,
    fetchSocialMediaLogs 
  } = useContext(AppContext);

  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterPlatform, setFilterPlatform] = useState('All');
  const [filterInStock, setFilterInStock] = useState(false);
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');

  // Live Activity notifications list
  const activityList = useMemo(() => [
    { user: 'Chinedu from Lagos', action: 'purchased WhatsApp Verification' },
    { user: 'Fatima from Abuja', action: 'purchased Gmail Account Log' },
    { user: 'Tunde from Ibadan', action: 'purchased Telegram OTP Code' },
    { user: 'Blessing from Port Harcourt', action: 'purchased Instagram Log' },
    { user: 'Kola from Enugu', action: 'purchased Netflix Verification OTP' },
    { user: 'Sarah from UK', action: 'purchased TikTok OTP Code' },
    { user: 'John from Lagos', action: 'purchased ChatGPT Pro API Log' },
  ], []);

  const [currentActivityIdx, setCurrentActivityIdx] = useState(0);
  const [showActivity, setShowActivity] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowActivity(false);
      setTimeout(() => {
        setCurrentActivityIdx(prev => (prev + 1) % activityList.length);
        setShowActivity(true);
      }, 500);
    }, 10000);
    return () => clearInterval(interval);
  }, [activityList]);

  // Reset page when category or search query or filters update
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, filterPlatform, filterInStock, filterMinPrice, filterMaxPrice]);

  // Load Social Logs
  useEffect(() => {
    const loadLogs = async () => {
      setLogsLoading(true);
      try {
        const res = await fetchSocialMediaLogs();
        if (res.success) {
          setLogs(res.data);
        }
      } catch (e) {
        console.error("Failed to load logs inside marketplace:", e);
      }
      setLogsLoading(false);
    };
    loadLogs();
  }, []);

  const categories = [
    { id: 'All', label: 'All Services', icon: '🌐' },
    { id: 'logs', label: 'Social Logs', icon: '🔑' },
    { id: 'otp', label: 'SMS Verification', icon: '💬' },
    { id: 'smm', label: 'SMM Campaign', icon: '📈' }
  ];

  // Map products to a unified data structure
  const allProducts = useMemo(() => {
    const items = [];

    // 1. Social Logs (Preferred - put at the top of mapping list)
    logs.forEach(log => {
      const isOut = (log.stock !== undefined && log.stock <= 0);
      items.push({
        id: log.id || log.slug,
        name: log.name,
        category: 'Social Logs',
        type: 'logs',
        price: log.priceNgn,
        priceFormatted: formatCost(log.priceNgn),
        badge: isOut ? 'Sold Out' : 'Verified Log',
        isSoldOut: isOut,
        features: [
          `Category: ${log.category || 'General'}`,
          `Stock: ${log.stock !== undefined ? log.stock : 'Available'}`,
          log.description || 'Pre-created social account log'
        ],
        meta: 'Per Account',
        logCategory: log.category
      });
    });

    // 2. OTP Services
    otpServices.forEach(otp => {
      items.push({
        id: otp.id,
        name: `${otp.name} SMS Verification`,
        category: 'SMS Verification',
        type: 'otp',
        price: otp.priceNgn,
        priceFormatted: formatCost(otp.priceNgn),
        badge: 'Temp Number',
        features: [
          'Non-VOIP Physical SIM',
          'Fast Code Delivery',
          'Success-Only Charges',
          'Re-verify option available'
        ],
        iconEmoji: otp.emoji || '💬',
        meta: 'Per Code'
      });
    });

    // 3. SMM Services
    smmServices.forEach(smm => {
      items.push({
        id: smm.id,
        name: smm.name,
        category: 'SMM Campaign',
        type: 'smm',
        price: smm.pricePerThousandNgn,
        priceFormatted: `${formatCost(smm.pricePerThousandNgn)}`,
        badge: 'Social Growth',
        features: [
          `Min Order: ${smm.min || 100}`,
          `Max Order: ${(smm.max || 100000).toLocaleString()}`,
          smm.description || 'Boost followers, views, likes instantly'
        ],
        platform: smm.platform,
        meta: 'Per 1,000 units'
      });
    });

    return items;
  }, [otpServices, smmServices, logs, formatCost]);

  // Search and Category filter logic
  const filteredProducts = useMemo(() => {
    // Helper to score products: popular + cheaper ones first (FB, WhatsApp, Gmail etc.)
    const getProductScore = (p) => {
      let score = 0;
      const name = p.name.toLowerCase();
      
      // 1. Popularity Bonus (what people want)
      if (name.includes('facebook') || name.includes('fb') || name.includes('whatsapp') || name.includes('wa') || name.includes('gmail') || name.includes('google') || name.includes('openai') || name.includes('chatgpt') || name.includes('telegram')) {
        score += 100;
      } else if (name.includes('instagram') || name.includes('ig') || name.includes('tiktok') || name.includes('tt') || name.includes('twitter') || name.includes('x /') || name.includes(' x ')) {
        score += 60;
      }
      
      // 2. Cheapness Boost (cheaper ones first)
      score -= (p.price / 150);
      
      // 3. Log Preference Boost
      if (p.type === 'logs') {
        score += 30;
      }

      return score;
    };

    // Filter by search query and advanced filters first
    const matched = allProducts.filter(item => {
      // 1. Search text filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesQuery = item.name.toLowerCase().includes(query) || 
                             item.category.toLowerCase().includes(query) ||
                             (item.platform && item.platform.toLowerCase().includes(query));
        if (!matchesQuery) return false;
      }

      // 2. Platform filter
      if (filterPlatform !== 'All') {
        const plat = filterPlatform.toLowerCase();
        const name = item.name.toLowerCase();
        const platformField = (item.platform || '').toLowerCase();
        const categoryField = (item.logCategory || '').toLowerCase();
        if (!name.includes(plat) && !platformField.includes(plat) && !categoryField.includes(plat)) {
          return false;
        }
      }

      // 3. In Stock Only filter
      if (filterInStock && item.isSoldOut) {
        return false;
      }

      // 4. Min Price filter
      if (filterMinPrice.trim() !== '') {
        const min = parseFloat(filterMinPrice);
        if (!isNaN(min) && item.price < min) {
          return false;
        }
      }

      // 5. Max Price filter
      if (filterMaxPrice.trim() !== '') {
        const max = parseFloat(filterMaxPrice);
        if (!isNaN(max) && item.price > max) {
          return false;
        }
      }

      return true;
    });

    if (activeCategory !== 'All') {
      // Filter by category and sort by product score
      return matched
        .filter(item => item.type === activeCategory)
        .sort((a, b) => getProductScore(b) - getProductScore(a));
    }

    // For "All" tab, mix them together using a 3 logs : 1 OTP : 1 SMM ratio
    // Sort each group internally by their score first
    const logsList = matched.filter(p => p.type === 'logs').sort((a, b) => getProductScore(b) - getProductScore(a));
    const otpList = matched.filter(p => p.type === 'otp').sort((a, b) => getProductScore(b) - getProductScore(a));
    const smmList = matched.filter(p => p.type === 'smm').sort((a, b) => getProductScore(b) - getProductScore(a));

    const mixed = [];
    let logIdx = 0, otpIdx = 0, smmIdx = 0;

    while (
      logIdx < logsList.length || 
      otpIdx < otpList.length || 
      smmIdx < smmList.length
    ) {
      // Add up to 3 logs
      for (let i = 0; i < 3 && logIdx < logsList.length; i++) {
        mixed.push(logsList[logIdx++]);
      }
      // Add 1 OTP
      if (otpIdx < otpList.length) {
        mixed.push(otpList[otpIdx++]);
      }
      // Add 1 SMM
      if (smmIdx < smmList.length) {
        mixed.push(smmList[smmIdx++]);
      }
    }

    return mixed;
  }, [allProducts, activeCategory, searchQuery, filterPlatform, filterInStock, filterMinPrice, filterMaxPrice]);

  const ITEMS_PER_PAGE = 100;
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleBuyClick = (item) => {
    let targetPath = '';
    let targetState = null;

    if (item.type === 'smm') {
      targetPath = `/dashboard/smm/buy/${item.id}`;
    } else if (item.type === 'logs') {
      targetPath = `/dashboard/social/buy/${item.id}`;
    } else if (item.type === 'otp') {
      targetPath = '/dashboard/otp';
      targetState = { preselectedService: item.id };
    }

    if (!isLoggedIn) {
      navigate('/login', { 
        state: { 
          from: { 
            pathname: targetPath, 
            state: targetState 
          } 
        } 
      });
      return;
    }

    navigate(targetPath, { state: targetState });
  };

  const getProductLogo = (type, name, logCategory, platform) => {
    const text = `${name} ${logCategory || ''} ${platform || ''}`.toLowerCase();
    
    // Split text into standalone words for precise matching of short acronyms
    const tokens = text.split(/[\s\-|:|._|()\[\]]+/);
    const hasWord = (w) => tokens.includes(w);
    
    // Instagram/IG is highest priority to prevent "Gmail Verified" from triggering the Google logo
    if (text.includes('instagram') || hasWord('ig')) {
      return (
        <svg viewBox="0 0 24 24" style={{ width: '65%', height: '65%', flexShrink: 0 }}>
          <defs>
            <radialGradient id="ig-grad-mkt" cx="20%" cy="100%" r="150%">
              <stop offset="0%" stopColor="#fdf497"/>
              <stop offset="5%" stopColor="#fdf497"/>
              <stop offset="45%" stopColor="#fd5949"/>
              <stop offset="60%" stopColor="#d6249f"/>
              <stop offset="90%" stopColor="#285AEB"/>
            </radialGradient>
          </defs>
          <circle cx="12" cy="12" r="12" fill="url(#ig-grad-mkt)"/>
          <path d="M12 7.7a4.3 4.3 0 1 0 4.3 4.3A4.3 4.3 0 0 0 12 7.7Zm0 7.14a2.84 2.84 0 1 1 2.84-2.84A2.84 2.84 0 0 1 12 14.84Zm4.7-6.9a1.02 1.02 0 1 1-1.02-1.02A1.02 1.02 0 0 1 16.7 7.94ZM12 5.5c2.11 0 2.36.01 3.2.05a4.37 4.37 0 0 1 1.47.27 2.62 2.62 0 0 1 1.5 1.5 4.37 4.37 0 0 1 .27 1.47c.04.83.05 1.08.05 3.2s-.01 2.36-.05 3.2a4.37 4.37 0 0 1-.27 1.47 2.62 2.62 0 0 1-1.5 1.5 4.37 4.37 0 0 1-1.47.27c-.83.04-1.08.05-3.2.05s-2.36-.01-3.2-.05a4.37 4.37 0 0 1-1.47-.27 2.62 2.62 0 0 1-1.5-1.5 4.37 4.37 0 0 1-.27-1.47c-.04-.83-.05-1.08-.05-3.2s.01-2.36.05-3.2a4.37 4.37 0 0 1 .27-1.47 2.62 2.62 0 0 1 1.5-1.5 4.37 4.37 0 0 1 1.47-.27c.83-.04 1.08-.05 3.2-.05Z" fill="#FFF"/>
        </svg>
      );
    }

    // Check specific companies
    if (text.includes('facebook') || hasWord('fb')) return <img src={facebookLogo} alt="Facebook" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />;
    if (text.includes('whatsapp') || hasWord('wa')) return <img src={whatsappLogo} alt="WhatsApp" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />;
    if (text.includes('twitter') || text.includes(' x ') || text.includes('x /') || text === 'x' || text.startsWith('x ')) return <img src={xLogo} alt="X" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />;
    if (text.includes('apple')) return <img src={appleLogo} alt="Apple" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />;
    if (text.includes('gmx')) return <img src={gmxLogo} alt="GMX" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />;
    if (text.includes('proxy') || text.includes('xproxy')) return <img src={xproxyLogo} alt="XProxy" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />;
    if (text.includes('roblox')) return <img src={robloxLogo} alt="Roblox" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />;
    if (text.includes('yandex')) return <img src={yandexLogo} alt="Yandex" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />;
    if (text.includes('amazon')) return <img src={amazonLogo} alt="Amazon" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />;
    if (text.includes('chatgpt') || text.includes('openai') || hasWord('gpt')) return <img src={chatgptLogo} alt="ChatGPT" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />;
    if (text.includes('claude') || text.includes('anthropic')) return <img src={claudeLogo} alt="Claude" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />;
    if (text.includes('netflix')) return <img src={netflixLogo} alt="Netflix" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />;
    if (text.includes('spotify')) return <img src={spotifyLogo} alt="Spotify" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />;
    if (text.includes('surfshark')) return <img src={surfsharkLogo} alt="Surfshark" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />;
    if (text.includes('youtube')) return <img src={youtubeLogo} alt="YouTube" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />;
    
    // Fallback inline SVGs for Google, Telegram, TikTok
    if (text.includes('google') || text.includes('gmail') || text.includes('g-mail')) {
      return (
        <svg viewBox="0 0 24 24" style={{ width: '65%', height: '65%', flexShrink: 0 }}>
          <path d="M17.64 12.2c0-.63-.06-1.25-.16-1.84H12v3.49h3.17c-.14.72-.56 1.33-1.17 1.74v2.27h2.89c1.69-1.56 2.67-3.86 2.67-6.66Z" fill="#4285F4"/>
          <path d="M12 18c1.62 0 2.98-.54 3.97-1.46l-2.89-2.27c-.8.54-1.82.87-2.97.87-2.28 0-4.21-1.54-4.9-3.61H2.18v2.34C3.89 16.92 7.7 18 12 18Z" fill="#34A853"/>
          <path d="M7.1 11.53a3.61 3.61 0 0 1 0-2.3v-2.34H2.18a6.04 6.04 0 0 0 0 5.68l4.92-2.34c.18-.54.18-1.14 0-1.7Z" fill="#FBBC05"/>
          <path d="M12 6.75c.88 0 1.67.3 2.3.9l2.6-2.6A5.92 5.92 0 0 0 12 3.25C7.7 3.25 3.89 4.33 2.18 7.37l4.92 2.34C7.79 8.1 9.72 6.75 12 6.75Z" fill="#EA4335"/>
        </svg>
      );
    }
    if (text.includes('telegram') || hasWord('tg')) {
      return (
        <svg viewBox="0 0 24 24" style={{ width: '65%', height: '65%', flexShrink: 0 }}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.24-5.54 3.65-.52.36-.97.53-1.34.52-.41-.01-1.21-.23-1.8-.42-.72-.24-1.29-.36-1.24-.76.03-.21.32-.42.87-.64 3.42-1.49 5.7-2.48 6.84-2.97 3.27-1.4 3.95-1.64 4.39-1.65.1 0 .32.02.46.14.12.1.15.24.17.34.02.09.03.27.01.44z" fill="#0088cc"/>
        </svg>
      );
    }
    if (text.includes('tiktok') || hasWord('tt')) {
      return (
        <svg viewBox="0 0 24 24" style={{ width: '65%', height: '65%', flexShrink: 0 }}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.8 7.38c-.7-.09-1.37-.32-1.97-.68v4.86c0 2.31-1.87 4.2-4.18 4.2A4.19 4.19 0 0 1 6.3 13.56c0-2.31 1.88-4.2 4.19-4.2.24 0 .47.02.7.06v1.9c-.22-.05-.45-.08-.7-.08-1.27 0-2.3 1.03-2.3 2.3 0 1.28 1.03 2.3 2.3 2.3 1.28 0 2.3-1.03 2.3-2.3V5.5h1.9c.1 1.15.89 2.08 1.95 2.38v1.5z" fill="#010101"/>
        </svg>
      );
    }

    // Default icon based on type
    if (type === 'logs') return <span style={{ fontSize: '22px' }}>🔑</span>;
    if (type === 'otp') return <span style={{ fontSize: '22px' }}>💬</span>;
    if (type === 'smm') return <span style={{ fontSize: '22px' }}>📈</span>;
    return <span style={{ fontSize: '22px' }}>⭐</span>;
  };

  const getStockCount = (p) => {
    if (p.type === 'logs') {
      const stockFeat = p.features.find(f => f.includes('Stock:'));
      if (stockFeat) {
        return stockFeat.replace('Stock:', '').trim();
      }
    }
    const hash = String(p.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const simulatedStock = 300 + (hash % 2900);
    return `${simulatedStock.toLocaleString()} Available`;
  };

  const getSuccessRate = (p) => {
    const hash = String(p.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rate = 94 + (hash % 6); // 94% - 99%
    return `${rate}% Success Rate`;
  };

  const recentDeliveries = useMemo(() => [
    { name: 'WhatsApp Number', region: 'USA', time: '1m ago' },
    { name: 'Gmail Account', region: 'USA', time: '3m ago' },
    { name: 'Telegram Number', region: 'Canada', time: '5m ago' },
    { name: 'Facebook Account Log', region: 'Nigeria', time: '8m ago' },
    { name: 'OpenAI ChatGPT Log', region: 'Global', time: '11m ago' },
    { name: 'Instagram Followers Boost', region: 'HQ', time: '14m ago' }
  ], []);

  return (
    <div className="landing-container animate-slide-in" style={{ background: 'var(--bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Announcement Bar for Recent Deliveries */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderBottom: '1px solid var(--border-color)',
        padding: '6px 12px',
        fontSize: '11px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        scrollbarWidth: 'none',
        width: '100%',
        flexShrink: 0
      }}>
        <span style={{ fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '6px', height: '6px', background: 'var(--color-green)', borderRadius: '50%' }}></span>
          Recent Deliveries:
        </span>
        {recentDeliveries.map((d, i) => (
           <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
             ✓ {d.name} - {d.region} <span style={{ color: 'var(--text-muted)', fontSize: '9px', marginLeft: '2px' }}>{d.time}</span>
             {i < recentDeliveries.length - 1 && <span style={{ color: 'var(--border-color)', marginLeft: '8px' }}>•</span>}
           </span>
        ))}
      </div>

      <LandingNav />

      {/* Compact Hero Header */}
      <section className="landing-hero" style={{ padding: isMobile ? '24px 20px 10px' : '36px 20px 15px', textAlign: 'center' }}>
        <h1 className="landing-title" style={{ fontSize: isMobile ? '24px' : '32px', lineHeight: '1.2', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Discount Digital Services Shop
        </h1>

        {/* Compressed Trust Bar inline row */}
        <p style={{ margin: '0 auto 16px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
          Instant Delivery • Auto Replacement • 24/7 Support • Thousands of Orders
        </p>

        {/* Search Bar */}
        <div style={{ position: 'relative', maxWidth: '560px', margin: '0 auto 4px', width: '100%' }}>
          <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
          <input
            type="text"
            placeholder="Search all services, platforms, accounts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 50px',
              borderRadius: '8px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
              fontFamily: 'var(--font-sans)'
            }}
          />
        </div>

        {/* Advanced Filters Row */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          justifyContent: 'center', 
          flexWrap: 'wrap', 
          maxWidth: '750px', 
          margin: '0 auto 16px',
          alignItems: 'center',
          fontSize: '12px'
        }}>
          {/* Platform Select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Platform:</span>
            <select 
              value={filterPlatform} 
              onChange={e => setFilterPlatform(e.target.value)}
              style={{ 
                padding: '6px 10px', 
                borderRadius: '6px', 
                background: 'var(--bg-input)', 
                border: '1px solid var(--border-color)', 
                color: 'var(--text-primary)',
                outline: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontWeight: '600'
              }}
            >
              <option value="All">All Platforms</option>
              <option value="Facebook">Facebook</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Google">Google / Gmail</option>
              <option value="OpenAI">OpenAI / ChatGPT</option>
              <option value="Telegram">Telegram</option>
              <option value="TikTok">TikTok</option>
              <option value="Instagram">Instagram</option>
              <option value="Twitter">Twitter / X</option>
              <option value="Spotify">Spotify</option>
            </select>
          </div>

          {/* Price Range */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Price:</span>
            <input 
              type="number" 
              placeholder="Min ₦" 
              value={filterMinPrice}
              onChange={e => setFilterMinPrice(e.target.value)}
              style={{ 
                width: '85px', 
                padding: '6px 8px', 
                borderRadius: '6px', 
                background: 'var(--bg-input)', 
                border: '1px solid var(--border-color)', 
                color: 'var(--text-primary)',
                outline: 'none',
                fontFamily: 'var(--font-sans)'
              }}
            />
            <span style={{ color: 'var(--text-muted)' }}>-</span>
            <input 
              type="number" 
              placeholder="Max ₦" 
              value={filterMaxPrice}
              onChange={e => setFilterMaxPrice(e.target.value)}
              style={{ 
                width: '85px', 
                padding: '6px 8px', 
                borderRadius: '6px', 
                background: 'var(--bg-input)', 
                border: '1px solid var(--border-color)', 
                color: 'var(--text-primary)',
                outline: 'none',
                fontFamily: 'var(--font-sans)'
              }}
            />
          </div>

          {/* In Stock Checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <input 
              type="checkbox" 
              checked={filterInStock}
              onChange={e => setFilterInStock(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontWeight: '600' }}>In Stock Only</span>
          </label>
        </div>

        {/* Category Chips */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '800px', margin: '0 auto 4px' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '99px',
                border: '1px solid ' + (activeCategory === cat.id ? 'var(--color-turquoise)' : 'var(--border-color)'),
                background: activeCategory === cat.id ? 'var(--color-turquoise)' : 'var(--bg-btn-secondary)',
                color: activeCategory === cat.id ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Grid Content */}
      <section style={{ flex: 1, padding: '0 20px 80px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        {logsLoading && filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="spinner-loader" style={{ width: '40px', height: '40px', borderTopColor: 'var(--color-turquoise)', margin: '0 auto 16px' }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Syncing marketplace products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
            <AlertCircle size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h4 style={{ margin: '0 0 8px', fontSize: '18px' }}>No products found</h4>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Try adjusting your search criteria or choosing a different category.</p>
          </div>
        ) : (
          <div className="subs-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
            {paginatedProducts.map((p, idx) => (
              <div 
                key={`${p.type}-${p.id}-${idx}`} 
                className="glass-panel interactive sub-card glowing-cyan"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  height: '100%',
                  padding: isMobile ? '16px' : '24px',
                  borderRadius: '12px'
                }}
              >
                <div>
                  {/* Card Header */}
                  <div className="sub-header" style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="sub-icon" style={{ 
                      width: '44px',
                      height: '44px',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--bg-main)',
                      borderRadius: '8px',
                      flexShrink: 0
                    }}>
                      {getProductLogo(p.type, p.name, p.logCategory, p.platform)}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span className="badge" style={{ 
                        fontSize: '9px', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        background: 'rgba(72, 58, 172, 0.08)',
                        color: 'var(--color-turquoise)',
                        textTransform: 'uppercase',
                        fontWeight: '700',
                        display: 'inline-block',
                        marginBottom: '4px'
                      }}>
                        {p.badge}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', lineHeight: '1.4' }} title={p.name}>
                        {p.name}
                      </h4>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '14px 0 8px' }}>
                    <span style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                      {p.priceFormatted}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>/ {p.meta}</span>
                  </div>

                  {/* Metadata Indicators Row (Stock, Delivery, Success Rate) */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px', fontSize: '11px', fontWeight: '600' }}>
                    <span style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                      📦 {getStockCount(p)}
                    </span>
                    <span style={{ background: 'rgba(52, 199, 89, 0.08)', border: '1px solid rgba(52, 199, 89, 0.15)', padding: '4px 8px', borderRadius: '4px', color: '#34c759' }}>
                      ⚡ Auto Delivery
                    </span>
                    <span style={{ background: 'rgba(0, 242, 254, 0.08)', border: '1px solid rgba(0, 242, 254, 0.15)', padding: '4px 8px', borderRadius: '4px', color: 'var(--color-turquoise)' }}>
                      ⭐ {getSuccessRate(p)}
                    </span>
                  </div>

                  {/* Features */}
                  <ul className="sub-details" style={{ margin: '16px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {p.features.slice(0, 3).map((feat, i) => (
                      <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', alignItems: 'flex-start', lineHeight: '1.4' }}>
                        <Check size={14} style={{ color: 'var(--color-green)', flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  className={`btn ${p.isSoldOut ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ width: '100%', marginTop: '20px', background: p.isSoldOut ? 'rgba(255,255,255,0.02)' : 'var(--color-turquoise)', border: 'none', color: '#fff' }}
                  onClick={() => handleBuyClick(p)}
                  disabled={p.isSoldOut}
                >
                  {p.isSoldOut ? 'Sold Out' : 'Purchase / Configure'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '40px' }}>
            <button 
              className="btn btn-secondary" 
              disabled={currentPage === 1} 
              onClick={() => {
                setCurrentPage(p => p - 1);
                window.scrollTo({ top: 100, behavior: 'smooth' });
              }}
              style={{ 
                padding: '8px 16px', 
                fontSize: '13px', 
                border: '1px solid var(--border-color)', 
                background: 'var(--bg-btn-secondary)', 
                color: 'var(--text-primary)', 
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer', 
                borderRadius: '6px',
                opacity: currentPage === 1 ? 0.4 : 1
              }}
            >
              Previous
            </button>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button 
              className="btn btn-secondary" 
              disabled={currentPage === totalPages} 
              onClick={() => {
                setCurrentPage(p => p + 1);
                window.scrollTo({ top: 100, behavior: 'smooth' });
              }}
              style={{ 
                padding: '8px 16px', 
                fontSize: '13px', 
                border: '1px solid var(--border-color)', 
                background: 'var(--bg-btn-secondary)', 
                color: 'var(--text-primary)', 
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', 
                borderRadius: '6px',
                opacity: currentPage === totalPages ? 0.4 : 1
              }}
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* FAQ Section */}
      <section style={{ maxWidth: '800px', margin: '0 auto 80px', padding: '0 20px', width: '100%' }}>
        <h3 style={{ fontSize: '24px', textAlign: 'center', marginBottom: '24px', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>Frequently Asked Questions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { q: 'How fast is delivery?', a: 'Instant after payment. All our accounts, virtual numbers, and social growth boosts are dispatched automatically in under 30 seconds.' },
            { q: 'What if a product doesn\'t work?', a: 'All purchases are covered under our guaranteed replacement policy. If any account log or OTP verification fails, simply request a refund or auto-replacement inside the client portal.' },
            { q: 'Which countries are available?', a: 'We offer virtual numbers and eSIM routes across 85+ countries. Navigate category filters or search for specific countries (USA, UK, Canada, Nigeria, etc.) to view current stock.' }
          ].map((item, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.01)' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '15px', color: 'var(--text-primary)', fontWeight: '700' }}>❓ {item.q}</h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" style={{ borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.1)', paddingBottom: isMobile ? '80px' : '0' }}>
        <div className="landing-footer-content" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '32px 20px', flexWrap: 'wrap', gap: '20px' }}>
          <div className="landing-footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={24} style={{ color: 'var(--color-turquoise)' }} />
            <span style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>discountzar.ng</span>
          </div>
          <div className="landing-footer-links" style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
            <span onClick={() => navigate('/about')} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>About Us</span>
            <span onClick={() => navigate('/contact')} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Contact Us</span>
            <span onClick={() => navigate('/terms')} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Terms of Service</span>
            <span onClick={() => navigate('/privacy')} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Privacy Policy</span>
          </div>
        </div>
        <div className="landing-footer-copyright" style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', paddingBottom: '24px' }}>
          © 2026 discountzar.ng. Built as a premium high-fidelity service prototype. All rights reserved.
        </div>
      </footer>

      {/* Sticky Mobile CTA */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(10, 8, 20, 0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid var(--border-color)',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1000,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wallet Balance</span>
            <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-turquoise)', fontFamily: 'var(--mono)' }}>{formatCost(walletBalance || 0)}</span>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ padding: '8px 16px', fontSize: '13px', background: 'var(--color-turquoise)', border: 'none', color: '#fff', fontWeight: '700', borderRadius: '4px', cursor: 'pointer' }}
            onClick={() => navigate('/dashboard/wallet')}
          >
            Fund Wallet
          </button>
        </div>
      )}

      {/* Floating Live Activity Toast */}
      {showActivity && (
        <div style={{
          position: 'fixed',
          top: isMobile ? '80px' : '100px',
          left: '24px',
          background: 'rgba(10, 8, 20, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 242, 254, 0.25)',
          padding: '10px 16px',
          borderRadius: '30px',
          fontSize: '12px',
          fontWeight: '600',
          color: 'var(--color-turquoise)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 999,
          boxShadow: '0 4px 20px rgba(0, 242, 254, 0.15)',
          pointerEvents: 'none'
        }}>
          <span className="live-dot" style={{ width: '8px', height: '8px', background: '#34c759', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #34c759' }}></span>
          <span>{activityList[currentActivityIdx].user} {activityList[currentActivityIdx].action}</span>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
