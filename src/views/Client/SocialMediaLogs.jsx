import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useMatch, useLocation } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { AppContext } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { createPortal } from 'react-dom';
import { Share2, ShoppingCart, Tag, AlertCircle, CheckCircle, Search, Shield, ChevronRight, ExternalLink, Eye, SlidersHorizontal } from 'lucide-react';
import { supabase } from '../../supabase';
import facebookLogo from '../../assets/facebook.png';
import chatgptLogo from '../../assets/chatgpt.jpeg';
import claudeLogo from '../../assets/claude.jpeg';
import netflixLogo from '../../assets/netflix.jpeg';
import spotifyLogo from '../../assets/spotify.jpeg';
import surfsharkLogo from '../../assets/surfshark.jpeg';
import youtubeLogo from '../../assets/youtube.jpeg';
import whatsappLogo from '../../assets/whatsapp.jpg';
import xLogo from '../../assets/x.jpg';
import appleLogo from '../../assets/apple.png';
import gmxLogo from '../../assets/gmx.png';
import xproxyLogo from '../../assets/xproxy.jpg';
import robloxLogo from '../../assets/roblox.jpg';
import yandexLogo from '../../assets/yandex.png';
import amazonLogo from '../../assets/amazon.jpg';

const ProductImage = ({ src, alt, category, height = '120px', borderRadius = '8px' }) => {
  const [error, setError] = useState(false);
  
  const getGradient = (cat) => {
    const c = cat?.toLowerCase() || '';
    if (c.includes('facebook') || c.includes('fb')) return 'linear-gradient(135deg, #1877F2 0%, #00f2fe 100%)';
    if (c.includes('instagram') || c.includes('ig')) return 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCAF45 100%)';
    if (c.includes('tiktok') || c.includes('tt')) return 'linear-gradient(135deg, #010101 0%, #EE1D52 50%, #69C9D0 100%)';
    if (c.includes('twitter') || c.includes('x')) return 'linear-gradient(135deg, #000000 0%, #333333 100%)';
    if (c.includes('linkedin') || c.includes('link')) return 'linear-gradient(135deg, #0A66C2 0%, #00f2fe 100%)';
    if (c.includes('gmail') || c.includes('google')) return 'linear-gradient(135deg, #EA4335 0%, #FBBC05 100%)';
    if (c.includes('snapchat')) return 'linear-gradient(135deg, #FFFC00 0%, #f1c40f 100%)';
    if (c.includes('whatsapp') || c.includes('wa')) return 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)';
    if (c.includes('apple')) return 'linear-gradient(135deg, #555555 0%, #000000 100%)';
    return 'linear-gradient(135deg, var(--color-violet) 0%, var(--color-pink) 100%)';
  };

  const getPlatformIcon = (cat) => {
    const c = cat?.toLowerCase() || '';
    if (c.includes('facebook') || c.includes('fb')) return '📘';
    if (c.includes('instagram') || c.includes('ig')) return '📸';
    if (c.includes('tiktok') || c.includes('tt')) return '🎵';
    if (c.includes('twitter') || c.includes('x')) return '✖️';
    if (c.includes('linkedin') || c.includes('link')) return '💼';
    if (c.includes('gmail') || c.includes('google')) return '📧';
    if (c.includes('snapchat')) return '👻';
    if (c.includes('whatsapp') || c.includes('wa')) return '💬';
    if (c.includes('apple')) return '🍎';
    return '📱';
  };

  const getFallbackImage = (cat, name) => {
    const c = cat?.toLowerCase() || '';
    const n = name?.toLowerCase() || '';
    
    // Local overrides
    if (c.includes('netflix')) return netflixLogo;
    if (c.includes('spotify')) return spotifyLogo;
    if (c.includes('youtube') || c.includes('yt')) return youtubeLogo;
    if (c.includes('surfshark')) return surfsharkLogo;
    if (n.includes('claude')) return claudeLogo;
    if (n.includes('chatgpt') || n.includes('gpt')) return chatgptLogo;
    if (c.includes('whatsapp') || c.includes('wa')) return whatsappLogo;
    if (c.includes('twitter') || c.includes('x ')) return xLogo;
    if (c.includes('apple')) return appleLogo;
    if (c.includes('gmx')) return gmxLogo;
    if (c.includes('proxy')) return xproxyLogo;
    if (c.includes('roblox')) return robloxLogo;
    if (c.includes('yandex')) return yandexLogo;
    if (c.includes('amazon')) return amazonLogo;

    // Premium brand SVGs from online Simple Icons CDN
    const simpleIconsMap = [
      { key: 'facebook', slug: 'facebook', bg: '1877F2' },
      { key: 'instagram', slug: 'instagram', bg: 'E1306C' },
      { key: 'tiktok', slug: 'tiktok', bg: '010101' },
      { key: 'telegram', slug: 'telegram', bg: '0088cc' },
      { key: 'whatsapp', slug: 'whatsapp', bg: '25D366' },
      { key: 'snapchat', slug: 'snapchat', bg: 'FFFC00', color: '000' },
      { key: 'linkedin', slug: 'linkedin', bg: '0A66C2' },
      { key: 'gmail', slug: 'gmail', bg: 'EA4335' },
      { key: 'google', slug: 'google', bg: '4285F4' },
      { key: 'outlook', slug: 'microsoftoutlook', bg: '0078D4' },
      { key: 'yahoo', slug: 'yahoo', bg: '6001d2' },
      { key: 'apple', slug: 'apple', bg: '000000' },
      { key: 'discord', slug: 'discord', bg: '5865F2' },
      { key: 'github', slug: 'github', bg: '181717' },
      { key: 'twitch', slug: 'twitch', bg: '9146FF' },
      { key: 'amazon', slug: 'amazon', bg: 'FF9900', color: '000' },
      { key: 'binance', slug: 'binance', bg: 'F0B90B', color: '000' },
      { key: 'cashapp', slug: 'cashapp', bg: '00D632' },
      { key: 'trustpilot', slug: 'trustpilot', bg: '00B67A' },
      { key: 'yelp', slug: 'yelp', bg: 'D32323' },
      { key: 'steam', slug: 'steam', bg: '171a21' },
      { key: 'playstation', slug: 'playstation', bg: '003087' },
      { key: 'etsy', slug: 'etsy', bg: 'F56400' },
      { key: 'threads', slug: 'threads', bg: '000000' },
      { key: 'bluesky', slug: 'bluesky', bg: '0085ff' },
      { key: 'bumble', slug: 'bumble', bg: 'FFCB37', color: '000' },
      { key: 'reddit', slug: 'reddit', bg: 'FF4500' },
      { key: 'roblox', slug: 'roblox', bg: '000000' },
      { key: 'badoo', slug: 'badoo', bg: '7C50F6' },
      { key: 'proton', slug: 'protonmail', bg: '6d4aff' },
      { key: 'quora', slug: 'quora', bg: 'B92B27' },
      { key: 'tumblr', slug: 'tumblr', bg: '36465D' },
      { key: 'yandex', slug: 'yandex', bg: 'FC3F1D' },
      { key: 'zoho', slug: 'zoho', bg: '002D62' },
      { key: 'craigslist', slug: 'craigslist', bg: '5C0099' },
      { key: 'windows', slug: 'windows', bg: '0078D6' }
    ];

    const match = simpleIconsMap.find(item => c.includes(item.key) || n.includes(item.key));
    if (match) {
      const textColor = match.color || 'fff';
      return `https://cdn.simpleicons.org/${match.slug}/${textColor}/${match.bg}`;
    }

    return null;
  };

  const fallbackImg = getFallbackImage(category, alt);

  if (fallbackImg) {
    const isOnlineSvg = typeof fallbackImg === 'string' && fallbackImg.includes('simpleicons.org');
    const parts = isOnlineSvg ? fallbackImg.split('/') : [];
    const bgColorHex = isOnlineSvg && parts.length > 0 ? `#${parts[parts.length - 1]}` : 'transparent';

    return (
      <div style={{ 
        width: '100%', 
        height, 
        borderRadius, 
        overflow: 'hidden', 
        marginBottom: '12px', 
        background: isOnlineSvg ? bgColorHex : 'rgba(255,255,255,0.02)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img 
          src={fallbackImg} 
          alt={alt} 
          style={{ 
            width: isOnlineSvg ? '50%' : '100%', 
            height: isOnlineSvg ? '50%' : '100%', 
            objectFit: isOnlineSvg ? 'contain' : 'cover' 
          }} 
        />
      </div>
    );
  }

  if (error || !src) {
    return (
      <div style={{ 
        width: '100%', 
        height, 
        borderRadius, 
        background: getGradient(category), 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: height === '200px' ? '48px' : '32px',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
        marginBottom: '12px',
        opacity: 0.85
      }}>
        {getPlatformIcon(category)}
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height, borderRadius, overflow: 'hidden', marginBottom: '12px', background: 'rgba(255,255,255,0.02)' }}>
      <img 
        src={src} 
        alt={alt} 
        onError={() => setError(true)} 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
      />
    </div>
  );
};

const SocialMediaLogs = () => {
  const { fetchSocialMediaLogs, buySocialMediaLog, formatCost, currency, fetchSocialMediaLogDetail, isLoggedIn } = useContext(AppContext);
  const isMobile = useIsMobile();
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Advanced filters state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [ageFilter, setAgeFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [priceSort, setPriceSort] = useState('default');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const buyMatch = useMatch('/dashboard/social/buy/:id');
  const selectedLogId = buyMatch?.params?.id;
  const selectedLog = selectedLogId ? logs.find(l => String(l.slug) === String(selectedLogId) || String(l.id) === String(selectedLogId)) : null;
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);
  const [previewModalLog, setPreviewModalLog] = useState(null);

  const [detailedDescription, setDetailedDescription] = useState('');
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    if (selectedLogId && logs.length > 0) {
      const log = logs.find(l => String(l.slug) === String(selectedLogId) || String(l.id) === String(selectedLogId));
      if (log) {
        loadLogDetail(log.slug);
      }
    } else {
      setDetailedDescription('');
    }
  }, [selectedLogId, logs]);

  const loadLogDetail = async (slug) => {
    setDetailsLoading(true);
    setDetailedDescription('');
    const res = await fetchSocialMediaLogDetail(slug);
    if (res.success) {
      setDetailedDescription(res.description);
    } else {
      console.warn("Failed to load details:", res.msg);
      const log = logs.find(l => String(l.slug) === String(slug) || String(l.id) === String(slug));
      if (log) {
        setDetailedDescription(log.description);
      }
    }
    setDetailsLoading(false);
  };

  const loadLogs = async () => {
    setLoading(true);
    const res = await fetchSocialMediaLogs();
    if (res.success) {
      setLogs(res.data);
      setError(null);
    } else {
      setError(res.msg);
    }
    setLoading(false);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setAgeFilter('All');
    setCountryFilter('All');
    setStockFilter('All');
    setPriceSort('default');
    setPriceMin('');
    setPriceMax('');
  };

  const categories = React.useMemo(() => {
    const set = new Set(
      logs
        .map(l => l.category?.trim())
        .filter(Boolean)
    );
    const uniqueCats = [...set];

    // Popular priority keywords - Facebook, Instagram, TikTok, WhatsApp etc. come first
    const priorityKeywords = [
      'facebook', 
      'instagram', 
      'tiktok', 
      'whatsapp', 
      'telegram', 
      'gmail', 
      'google voice', 
      'snapchat', 
      'twitter', 
      'x', 
      'linkedin', 
      'netflix', 
      'spotify', 
      'discord', 
      'apple'
    ];

    uniqueCats.sort((a, b) => {
      const lowA = a.toLowerCase();
      const lowB = b.toLowerCase();

      const idxA = priorityKeywords.findIndex(kw => lowA.includes(kw));
      const idxB = priorityKeywords.findIndex(kw => lowB.includes(kw));

      if (idxA !== -1 && idxB !== -1) {
        return idxA - idxB;
      }
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;

      return lowA.localeCompare(lowB);
    });

    return ['All', ...uniqueCats];
  }, [logs]);

  const filteredLogs = logs.filter(l => {
    const cat = l.category?.trim() || 'General';
    const name = l.name || '';
    const desc = l.description || '';
    const fullName = `${name} ${desc} ${cat}`.toLowerCase();

    // 1. Category Filter
    if (activeCategory && activeCategory !== 'All' && cat.toLowerCase() !== activeCategory.toLowerCase()) return false;
    
    // 2. Search Filter (loops through title/name only as requested)
    if (searchQuery && !name.toLowerCase().includes(searchQuery.toLowerCase().trim())) return false;

    // 3. Age Filter
    if (ageFilter === 'Aged') {
      if (!fullName.includes('aged') && !fullName.includes('cổ')) return false;
    } else if (ageFilter === 'Fresh') {
      if (!fullName.includes('fresh') && !fullName.includes('mới') && !fullName.includes('new')) return false;
    }

    // 4. Country Filter
    if (countryFilter === 'USA') {
      if (!fullName.includes('usa') && !fullName.includes(' us ') && !fullName.includes('united states')) return false;
    } else if (countryFilter === 'UK') {
      if (!fullName.includes('uk') && !fullName.includes('united kingdom')) return false;
    } else if (countryFilter === 'Global/Mixed') {
      if (!fullName.includes('global') && !fullName.includes('mixed') && !fullName.includes('all country')) return false;
    } else if (countryFilter === 'Other') {
      const matchesMain = fullName.includes('usa') || fullName.includes(' us ') || fullName.includes('united states') || 
                          fullName.includes('uk') || fullName.includes('united kingdom') ||
                          fullName.includes('global') || fullName.includes('mixed');
      if (matchesMain) return false;
    }

    // 5. Stock Filter
    if (stockFilter === 'In Stock' && l.stock <= 0) return false;

    // 6. Price Range Filters
    const finalPrice = l.priceNgn || 0;
    if (priceMin !== '' && finalPrice < Number(priceMin)) return false;
    if (priceMax !== '' && finalPrice > Number(priceMax)) return false;

    return true;
  }).sort((a, b) => {
    if (priceSort === 'price_asc') {
      return (a.priceNgn || 0) - (b.priceNgn || 0);
    }
    if (priceSort === 'price_desc') {
      return (b.priceNgn || 0) - (a.priceNgn || 0);
    }
    
    const getScore = (log) => {
      let score = 0;
      const text = `${log.name || ''} ${log.category || ''}`.toLowerCase();
      if (text.includes('usa') || text.includes(' us ')) score += 10;
      if (text.includes('aged')) score += 5;
      if (text.includes('verified') || text.includes('official')) score += 5;
      if (text.includes('facebook') || text.includes('instagram')) score += 2;
      return score;
    };
    return getScore(b) - getScore(a);
  });

  console.log("DEBUG activeCategory:", activeCategory, "searchQuery:", searchQuery, "filteredLogs count:", filteredLogs.length, "logs count:", logs.length);
  console.log("DEBUG filteredLogs first 5 items JSON:", JSON.stringify(filteredLogs.slice(0, 5).map(l => ({ name: l.name, category: l.category }))));

  const handleBuy = async (e) => {
    e.preventDefault();
    if (!selectedLog) return;
    
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location } });
      return;
    }
    
    setPurchaseLoading(true);
    // Cost calculation in NGN
    const totalCost = selectedLog.priceNgn * purchaseQuantity;
    
    const res = await buySocialMediaLog(selectedLog.id, selectedLog.name, purchaseQuantity, totalCost);
    setPurchaseLoading(false);
    
    if (res.success) {
      setPurchaseSuccess(res.order);
    } else {
      alert("Purchase failed: " + res.msg);
    }
  };

  const closePurchaseModal = () => {
    navigate('/dashboard/social');
    setPurchaseQuantity(1);
    setPurchaseSuccess(null);
  };

  const getPlatformIcon = (category) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('facebook') || cat.includes('fb')) return '📘';
    if (cat.includes('instagram') || cat.includes('ig')) return '📸';
    if (cat.includes('tiktok') || cat.includes('tt')) return '🎵';
    if (cat.includes('twitter') || cat.includes('x')) return '✖️';
    if (cat.includes('linkedin') || cat.includes('link')) return '💼';
    if (cat.includes('gmail') || cat.includes('google')) return '📧';
    if (cat.includes('snapchat')) return '👻';
    if (cat.includes('whatsapp') || cat.includes('wa')) return '💬';
    if (cat.includes('apple')) return '🍎';
    return '📱';
  };

  if (selectedLog && buyMatch) {
    const renderCheckoutCard = () => {
      return purchaseSuccess ? (
        <div className="glass-panel pulse-glow-cyan" style={{ padding: '32px 24px', textAlign: 'center', background: 'rgba(59, 183, 94, 0.05)', border: '1px solid rgba(59, 183, 94, 0.2)' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(59, 183, 94, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle size={32} color="var(--color-green)" />
          </div>
          <h2 style={{ margin: '0 0 10px', fontSize: '24px' }}>Purchase Successful!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            Your social media account details are ready. Please save them securely.
          </p>
          
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', textAlign: 'left', marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 16px', color: '#ab47fc', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Credentials</h4>
            
            {(() => {
              const details = purchaseSuccess.account_details;
              if (!details || (typeof details === 'object' && Object.keys(details).length === 0)) {
                return <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Order is being processed. Check your order history for delivery updates.</div>;
              }
              if (Array.isArray(details)) {
                return details.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: idx < details.length - 1 ? '16px' : '0', paddingBottom: idx < details.length - 1 ? '16px' : '0', borderBottom: idx < details.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    {item.item_number && <div style={{ fontSize: '11px', color: '#ab47fc', marginBottom: '8px', fontWeight: 'bold' }}>Item #{item.item_number}</div>}
                    {Object.entries(item).filter(([k]) => k !== 'item_number').map(([key, value]) => (
                      <div key={key} style={{ marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <code style={{ fontSize: '14px', color: '#fff', background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '6px', flex: 1, fontFamily: 'var(--mono)', wordBreak: 'break-all' }}>
                            {String(value || 'N/A')}
                          </code>
                        </div>
                      </div>
                    ))}
                  </div>
                ));
              }
              if (details.status && details.status !== 'completed') {
                return <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Order status: <strong style={{ color: '#eab308' }}>{details.status}</strong>. Delivery details will be available shortly.</div>;
              }
              return Object.entries(details).filter(([k]) => k !== 'raw_response' && k !== 'status').map(([key, value]) => (
                <div key={key} style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <code style={{ fontSize: '14px', color: '#fff', background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '6px', flex: 1, fontFamily: 'var(--mono)', wordBreak: 'break-all' }}>
                      {String(value || 'N/A')}
                    </code>
                  </div>
                </div>
              ));
            })()}
            
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '8px', fontSize: '12px', color: '#eab308' }}>
              <AlertCircle size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
              We recommend changing the password and securing the account immediately.
            </div>
          </div>
          
          <button className="btn btn-primary" onClick={closePurchaseModal} style={{ width: '100%', background: '#ab47fc', color: '#fff', border: 'none' }}>Back to Accounts</button>
        </div>
      ) : (
        <div className="glass-panel" style={{ border: '1px solid rgba(171, 71, 252, 0.2)', borderRadius: '20px', padding: '24px', position: !isMobile ? 'sticky' : 'relative', top: !isMobile ? '24px' : 'auto' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: 'var(--text-primary)' }}>Order Summary</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Availability</span>
            {selectedLog.stock > 0 ? (
              <div style={{ fontSize: '13px', color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                <span style={{ width: '8px', height: '8px', background: 'var(--color-green)', borderRadius: '50%', display: 'inline-block' }}></span>
                In Stock ({selectedLog.stock})
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--color-red)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                <span style={{ width: '8px', height: '8px', background: 'var(--color-red)', borderRadius: '50%', display: 'inline-block' }}></span>
                Out of Stock
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Price per account</span>
            <span style={{ color: 'var(--text-primary)', fontSize: '16px', fontFamily: 'var(--mono)' }}>{formatCost(currency === 'NGN' ? selectedLog.priceNgn : selectedLog.priceUsd)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Quantity</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-input)', padding: '6px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <button 
                type="button" 
                onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                disabled={purchaseLoading || selectedLog.stock <= 0}
                style={{ width: '32px', height: '32px', background: 'var(--bg-btn-secondary)', border: 'none', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >-</button>
              <span style={{ fontSize: '16px', width: '24px', textAlign: 'center', fontFamily: 'var(--mono)', fontWeight: 'bold', color: 'var(--text-primary)' }}>{purchaseQuantity}</span>
              <button 
                type="button" 
                onClick={() => setPurchaseQuantity(Math.min(selectedLog.stock, purchaseQuantity + 1))}
                disabled={purchaseLoading || selectedLog.stock <= 0}
                style={{ width: '32px', height: '32px', background: 'var(--bg-btn-secondary)', border: 'none', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >+</button>
            </div>
          </div>
          
          <hr style={{ border: 'none', borderTop: '1px dashed rgba(255,255,255,0.1)', margin: '20px 0' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 'bold' }}>Total Cost</span>
            <span style={{ color: '#ab47fc', fontSize: '24px', fontWeight: 'bold', fontFamily: 'var(--mono)' }}>
              {formatCost((currency === 'NGN' ? selectedLog.priceNgn : selectedLog.priceUsd) * purchaseQuantity)}
            </span>
          </div>

          <button 
            className="btn btn-primary" 
            onClick={handleBuy} 
            disabled={purchaseLoading || selectedLog.stock <= 0}
            style={{ width: '100%', padding: '16px', fontSize: '16px', background: 'linear-gradient(90deg, #9333ea 0%, #ab47fc 100%)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '12px' }}
          >
            {purchaseLoading ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '3px', borderTopColor: '#fff' }}></div> : <><ShoppingCart size={18} /> Pay Securely</>}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <Shield size={12} style={{ display: 'inline', verticalAlign: 'text-top', marginRight: '4px' }} />
            Secure transaction via wallet balance
          </div>
        </div>
      );
    };

    return (
      <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
        <button 
          onClick={closePurchaseModal} 
          style={{ background: 'none', border: 'none', color: '#ab47fc', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: 0, fontSize: '14px', fontWeight: 'bold' }}
        >
          <div style={{ background: 'rgba(171,71,252,0.1)', borderRadius: '50%', padding: '6px' }}><ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /></div>
          Back to Accounts
        </button>

        <div className="glass-panel" style={{ padding: isMobile ? '24px 16px' : '40px', borderRadius: '24px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '32px' }}>
          
          {/* Left Column: Details */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ProductImage 
              src={selectedLog.image} 
              alt={selectedLog.name} 
              category={selectedLog.category} 
              height="200px" 
              borderRadius="16px" 
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '24px', background: 'rgba(255,255,255,0.05)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {getPlatformIcon(selectedLog.category)}
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#ab47fc', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>{selectedLog.category}</span>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ref: #{selectedLog.id}</div>
                </div>
              </div>
              
              <h1 style={{ fontSize: isMobile ? '24px' : '32px', margin: '0 0 16px 0', lineHeight: '1.3' }}>{selectedLog.name}</h1>
              
              {/* On mobile, render order summary / checkout card here, before the description! */}
              {isMobile && (
                <div style={{ marginBottom: '32px' }}>
                  {renderCheckoutCard()}
                </div>
              )}

              {detailsLoading ? (
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', marginTop: 12, padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                  <div className="skeleton-pulse" style={{ height: '16px', width: '80%', borderRadius: '4px' }} />
                  <div className="skeleton-pulse" style={{ height: '16px', width: '90%', borderRadius: '4px' }} />
                  <div className="skeleton-pulse" style={{ height: '16px', width: '70%', borderRadius: '4px' }} />
                  <div className="skeleton-pulse" style={{ height: '16px', width: '40%', borderRadius: '4px' }} />
                </div>
              ) : detailedDescription ? (
                <div className="social-log-html-content" style={{ marginTop: 12, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, wordBreak: 'break-word' }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(detailedDescription.replace(/color:\s*[^;"]+;?/gi, '').replace(/background(?:-color)?:\s*[^;"]+;?/gi, '')) }} />
              ) : (
                <div style={{ fontSize: '15px', color: 'var(--text-muted)' }}>No description available for this product.</div>
              )}
            </div>
          </div>

          {/* Right Column: Checkout Card (hidden on mobile since it's rendered inline above) */}
          {!isMobile && (
            <div style={{ width: '380px', flexShrink: 0 }}>
              {renderCheckoutCard()}
            </div>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel pulse-glow-purple" style={{ 
        background: 'linear-gradient(135deg, rgba(31, 13, 49, 0.9) 0%, rgba(18, 10, 34, 0.9) 100%)',
        border: '1px solid rgba(171, 71, 252, 0.25)', 
        padding: isMobile ? '24px 20px' : '36px', 
        borderRadius: '16px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? 16 : 0,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '600px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(171, 71, 252, 0.1)', border: '1px solid rgba(171, 71, 252, 0.2)', borderRadius: '20px', width: 'fit-content' }}>
            <Share2 size={14} color="#ab47fc" />
            <span style={{ fontSize: '12px', color: '#ab47fc', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Instant Delivery</span>
          </div>
          <h1 style={{ margin: 0, fontSize: isMobile ? '32px' : '42px', fontFamily: 'var(--font-heading)', background: 'linear-gradient(90deg, #ffffff 0%, #ab47fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800', lineHeight: '1.1' }}>
            Social Media Logs
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', margin: 0, lineHeight: '1.6' }}>
            Buy aged, verified, and high-quality social media accounts instantly. Delivered straight to your dashboard with 100% security.
          </p>
        </div>
        
        {/* Decorative Graphic */}
        {!isMobile && (
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(171,71,252,0.2) 0%, rgba(0,0,0,0) 70%)' }}></div>
            <Shield size={80} color="rgba(171, 71, 252, 0.8)" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', filter: 'drop-shadow(0 0 15px rgba(171, 71, 252, 0.5))' }} />
          </div>
        )}
      </div>

      {/* Controls: Search, Categories & Advanced Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Row 1: Search Input & Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search accounts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '44px', width: '100%', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
          
          <button 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="btn btn-secondary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 16px', 
              borderRadius: '12px',
              fontSize: '13px',
              border: `1px solid ${showAdvancedFilters ? '#ab47fc' : 'rgba(255,255,255,0.1)'}`,
              background: showAdvancedFilters ? 'rgba(171,71,252,0.15)' : 'rgba(255,255,255,0.02)',
              color: '#fff',
              whiteSpace: 'nowrap',
              height: '42px',
              cursor: 'pointer'
            }}
          >
            <SlidersHorizontal size={14} style={{ color: showAdvancedFilters ? '#ab47fc' : 'var(--text-secondary)' }} />
            <span>Filters</span>
          </button>

          {(searchQuery || activeCategory !== 'All' || ageFilter !== 'All' || countryFilter !== 'All' || stockFilter !== 'All' || priceSort !== 'default' || priceMin || priceMax) && (
            <button 
              onClick={handleClearFilters}
              className="btn btn-secondary"
              style={{ 
                padding: '10px 16px', 
                borderRadius: '12px',
                fontSize: '13px',
                color: 'var(--color-red)',
                border: '1px solid rgba(255, 59, 48, 0.15)',
                background: 'rgba(255, 59, 48, 0.05)',
                whiteSpace: 'nowrap',
                height: '42px',
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Row 2: Categories Carousel (Desktop) or Dropdown Selector (Mobile) */}
        {isMobile ? (
          <div style={{ width: '100%' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 'bold', textTransform: 'uppercase' }}>Select Category</label>
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="form-input"
              style={{ 
                width: '100%', 
                borderRadius: '12px', 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                color: '#fff', 
                padding: '10px',
                fontSize: '14px',
                outline: 'none',
                height: '42px',
                cursor: 'pointer'
              }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat} style={{ background: '#120a22', color: '#fff' }}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none', width: '100%' }} className="hide-scrollbar">
            {categories.map(cat => (
              <div
                key={cat}
                role="button"
                tabIndex={0}
                onClick={() => setActiveCategory(cat)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveCategory(cat); }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: `1px solid ${activeCategory === cat ? '#ab47fc' : 'rgba(255,255,255,0.1)'}`,
                  background: activeCategory === cat ? 'rgba(171,71,252,0.25)' : 'rgba(255,255,255,0.02)',
                  color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: activeCategory === cat ? '600' : '400',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  userSelect: 'none',
                  display: 'inline-block'
                }}
              >
                {cat}
              </div>
            ))}
          </div>
        )}

        {/* Row 3: Advanced Filters Grid (Collapsible) */}
        {showAdvancedFilters && (
          <div 
            className="glass-panel animate-slide-in" 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
              gap: '16px', 
              padding: '20px', 
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(15, 10, 25, 0.6)'
            }}
          >
            {/* Price Sorting */}
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 'bold', textTransform: 'uppercase' }}>Price Sort</label>
              <select 
                value={priceSort} 
                onChange={e => setPriceSort(e.target.value)} 
                className="form-input" 
                style={{ width: '100%', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px' }}
              >
                <option value="default" style={{ background: '#120a22', color: '#fff' }}>Recommended</option>
                <option value="price_asc" style={{ background: '#120a22', color: '#fff' }}>Price: Low to High</option>
                <option value="price_desc" style={{ background: '#120a22', color: '#fff' }}>Price: High to Low</option>
              </select>
            </div>

            {/* Account Age */}
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 'bold', textTransform: 'uppercase' }}>Account Age</label>
              <select 
                value={ageFilter} 
                onChange={e => setAgeFilter(e.target.value)} 
                className="form-input" 
                style={{ width: '100%', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px' }}
              >
                <option value="All" style={{ background: '#120a22', color: '#fff' }}>All Ages</option>
                <option value="Aged" style={{ background: '#120a22', color: '#fff' }}>Aged Accounts</option>
                <option value="Fresh" style={{ background: '#120a22', color: '#fff' }}>Fresh Accounts</option>
              </select>
            </div>

            {/* Region / Country */}
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 'bold', textTransform: 'uppercase' }}>Region/Country</label>
              <select 
                value={countryFilter} 
                onChange={e => setCountryFilter(e.target.value)} 
                className="form-input" 
                style={{ width: '100%', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px' }}
              >
                <option value="All" style={{ background: '#120a22', color: '#fff' }}>All Regions</option>
                <option value="USA" style={{ background: '#120a22', color: '#fff' }}>United States (USA)</option>
                <option value="UK" style={{ background: '#120a22', color: '#fff' }}>United Kingdom (UK)</option>
                <option value="Global/Mixed" style={{ background: '#120a22', color: '#fff' }}>Global / Mixed</option>
                <option value="Other" style={{ background: '#120a22', color: '#fff' }}>Other Countries</option>
              </select>
            </div>

            {/* Stock Availability */}
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 'bold', textTransform: 'uppercase' }}>Stock Status</label>
              <select 
                value={stockFilter} 
                onChange={e => setStockFilter(e.target.value)} 
                className="form-input" 
                style={{ width: '100%', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px' }}
              >
                <option value="All" style={{ background: '#120a22', color: '#fff' }}>All Status</option>
                <option value="In Stock" style={{ background: '#120a22', color: '#fff' }}>In Stock Only</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 'bold', textTransform: 'uppercase' }}>Price Range (NGN)</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={priceMin}
                  onChange={e => setPriceMin(e.target.value)}
                  className="form-input"
                  style={{ flex: 1, borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', fontSize: '12px', color: '#fff' }}
                />
                <span style={{ color: 'var(--text-muted)' }}>-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={priceMax}
                  onChange={e => setPriceMax(e.target.value)}
                  className="form-input"
                  style={{ flex: 1, borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', fontSize: '12px', color: '#fff' }}
                />
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px', gap: '16px', minHeight: '260px' }}>
              <div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <div className="skeleton-pulse" style={{ width: '40px', height: '40px', borderRadius: '10px' }}></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
                    <div className="skeleton-pulse" style={{ width: '60px', height: '10px', borderRadius: '4px' }}></div>
                    <div className="skeleton-pulse" style={{ width: '80px', height: '10px', borderRadius: '4px' }}></div>
                  </div>
                </div>
                <div className="skeleton-pulse" style={{ width: '100%', height: '14px', borderRadius: '4px', marginBottom: '8px' }}></div>
                <div className="skeleton-pulse" style={{ width: '80%', height: '14px', borderRadius: '4px', marginBottom: '12px' }}></div>
                <div className="skeleton-pulse" style={{ width: '100%', height: '40px', borderRadius: '8px' }}></div>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div className="skeleton-pulse" style={{ width: '60px', height: '24px', borderRadius: '4px' }}></div>
                 <div className="skeleton-pulse" style={{ width: '100px', height: '32px', borderRadius: '16px' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={24} color="var(--text-muted)" />
          </div>
          <h3 style={{ margin: 0, fontSize: '18px' }}>No accounts found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, maxWidth: '300px' }}>We couldn't find any accounts matching your current search or category filter.</p>
          <button className="btn btn-secondary" onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} style={{ marginTop: '8px' }}>Clear Filters</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredLogs.map((log, idx) => (
            <div key={`${log.id}-${log.name}-${idx}`} className="glass-panel hover-lift" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px', gap: '16px', position: 'relative', overflow: 'hidden' }}>
              
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(171,71,252,0.15) 0%, rgba(0,0,0,0) 70%)', zIndex: 0 }}></div>
              
              <div style={{ zIndex: 1 }}>
                <ProductImage 
                  src={log.image} 
                  alt={log.name} 
                  category={log.category} 
                  height="120px" 
                  borderRadius="8px" 
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '24px', background: 'rgba(255,255,255,0.05)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {getPlatformIcon(log.category)}
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#ab47fc', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>{log.category}</span>
                      {log.stock > 0 ? (
                        <div style={{ fontSize: '11px', color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <span style={{ width: '6px', height: '6px', background: 'var(--color-green)', borderRadius: '50%', display: 'inline-block' }}></span>
                          In Stock ({log.stock})
                        </div>
                      ) : (
                        <div style={{ fontSize: '11px', color: 'var(--color-red)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <span style={{ width: '6px', height: '6px', background: 'var(--color-red)', borderRadius: '50%', display: 'inline-block' }}></span>
                          Out of Stock
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPreviewModalLog(log); }}
                    title="Preview Product Details"
                    style={{
                      fontSize: '11px',
                      color: '#c084fc',
                      background: 'rgba(171, 71, 252, 0.15)',
                      border: '1px solid rgba(171, 71, 252, 0.3)',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    <Eye size={12} /> Preview
                  </button>
                </div>
                
                <h3 style={{ fontSize: '15px', lineHeight: '1.4', margin: '0 0 8px 0', fontWeight: '600' }}>{log.name}</h3>
                
                {log.description && (
                  <div 
                    className="social-log-html-content"
                    style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(log.description.replace(/color:\s*[^;"]+;?/gi, '').replace(/background(?:-color)?:\s*[^;"]+;?/gi, '')) }}
                  />
                )}
              </div>

              <div style={{ zIndex: 1, marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Price</span>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--mono)' }}>
                    {formatCost(currency === 'NGN' ? log.priceNgn : log.priceUsd)}
                  </div>
                </div>
                <button 
                  className="btn"
                  onClick={() => navigate('/dashboard/social/buy/' + log.id)}
                  disabled={log.stock <= 0}
                  style={{ 
                    background: log.stock > 0 ? 'rgba(171, 71, 252, 0.15)' : 'rgba(255,255,255,0.05)', 
                    color: log.stock > 0 ? '#ab47fc' : 'var(--text-muted)',
                    border: `1px solid ${log.stock > 0 ? 'rgba(171, 71, 252, 0.3)' : 'rgba(255,255,255,0.1)'}`,
                    padding: '8px 16px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: log.stock > 0 ? 1 : 0.5
                  }}
                >
                  <ShoppingCart size={14} />
                  View details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* In-App Product Preview Modal */}
      {previewModalLog && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setPreviewModalLog(null)}
        >
          <div 
            className="glass-panel" 
            style={{
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '24px',
              padding: isMobile ? '24px 20px' : '32px',
              background: '#120a22',
              border: '1px solid rgba(171, 71, 252, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button"
              onClick={() => setPreviewModalLog(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingRight: '40px' }}>
              <div style={{ fontSize: '28px', background: 'rgba(255,255,255,0.05)', width: '52px', height: '52px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                {getPlatformIcon(previewModalLog.category)}
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#ab47fc', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>{previewModalLog.category}</span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '18px', color: '#fff', lineHeight: '1.3' }}>{previewModalLog.name}</h2>
              </div>
            </div>

            {/* Stats Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Availability</span>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: previewModalLog.stock > 0 ? 'var(--color-green)' : 'var(--color-red)' }}>
                  {previewModalLog.stock > 0 ? `In Stock (${previewModalLog.stock})` : 'Out of Stock'}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Price</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#ab47fc', fontFamily: 'var(--mono)' }}>
                  {formatCost(currency === 'NGN' ? previewModalLog.priceNgn : previewModalLog.priceUsd)}
                </span>
              </div>
            </div>

            {/* Description Content */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#ab47fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Details & Specification</h4>
              {previewModalLog.description ? (
                <div 
                  className="social-log-html-content"
                  style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', wordBreak: 'break-word' }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(previewModalLog.description.replace(/color:\s*[^;"]+;?/gi, '').replace(/background(?:-color)?:\s*[^;"]+;?/gi, '')) }}
                />
              ) : (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No description provided for this product.</div>
              )}
            </div>

            {/* Embedded Verification / Inbox Link if present */}
            {(() => {
              const descMatch = previewModalLog.description ? previewModalLog.description.match(/https?:\/\/[^\s<"'\)\>\,\;\.]+/i) : null;
              if (descMatch) {
                return (
                  <a 
                    href={descMatch[0]} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      background: 'rgba(171,71,252,0.1)',
                      border: '1px solid rgba(171,71,252,0.3)',
                      borderRadius: '12px',
                      color: '#c084fc',
                      fontSize: '13px',
                      fontWeight: '600',
                      textDecoration: 'none'
                    }}
                  >
                    <ExternalLink size={16} /> Open Verification Tool: {descMatch[0]}
                  </a>
                );
              }
              return null;
            })()}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={() => setPreviewModalLog(null)}
                style={{ flex: 1, padding: '14px', borderRadius: '12px' }}
              >
                Close
              </button>
              <button 
                type="button"
                className="btn btn-primary" 
                disabled={previewModalLog.stock <= 0}
                onClick={() => {
                  const targetId = previewModalLog.id;
                  setPreviewModalLog(null);
                  navigate('/dashboard/social/buy/' + targetId);
                }}
                style={{ flex: 2, padding: '14px', borderRadius: '12px', background: 'linear-gradient(90deg, #9333ea 0%, #ab47fc 100%)', color: '#fff', border: 'none', fontWeight: 'bold' }}
              >
                Proceed to Buy
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SocialMediaLogs;
