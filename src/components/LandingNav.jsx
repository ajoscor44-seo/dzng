import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Compass, Menu, X, Sun, Moon, LogOut } from 'lucide-react';

const LandingNav = () => {
  const { isLoggedIn, logoutUser, user, theme, toggleTheme, dbIsAdmin } = useContext(AppContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (tab) => {
    if (tab === 'landing') navigate('/');
    else if (tab === 'auth') navigate('/login');
    else if (tab === 'overview') navigate('/dashboard');
    else navigate(`/dashboard/${tab}`);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="landing-nav-left">
        <div className="landing-brand" onClick={() => handleNavClick('landing')} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <img src="/logo.png" alt="ZAR Logo" style={{ width: '44px', height: '44px', objectFit: 'contain', borderRadius: '8px', flexShrink: 0 }} />
        </div>
      </div>

      {/* Middle Navigation Menu Links */}
      <div className="landing-nav-links" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
        <a href="#services" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: '600', transition: 'color 0.2s ease', fontFamily: 'var(--font-label)', textTransform: 'uppercase', letterSpacing: '0.05em' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Services</a>
        <a href="#process" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: '600', transition: 'color 0.2s ease', fontFamily: 'var(--font-label)', textTransform: 'uppercase', letterSpacing: '0.05em' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Process</a>
        <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: '600', transition: 'color 0.2s ease', fontFamily: 'var(--font-label)', textTransform: 'uppercase', letterSpacing: '0.05em' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Features</a>
        <a href="#faq" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: '600', transition: 'color 0.2s ease', fontFamily: 'var(--font-label)', textTransform: 'uppercase', letterSpacing: '0.05em' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>FAQ</a>
        <span onClick={() => navigate('/marketplace')} style={{ color: 'var(--color-pink)', cursor: 'pointer', fontSize: '14px', fontWeight: '700', fontFamily: 'var(--font-label)', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = 0.8} onMouseOut={e => e.currentTarget.style.opacity = 1}>⭐ Marketplace</span>
      </div>

      <div className="landing-nav-right">
        {/* Theme Toggle Button */}
        <button 
          className="btn btn-secondary" 
          onClick={toggleTheme}
          style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={18} style={{ color: 'var(--color-pink)' }} /> : <Sun size={18} style={{ color: 'var(--color-turquoise)' }} />}
        </button>

        {isLoggedIn ? (
          <>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Hi, {user ? (user.email ? user.email.split('@')[0] : 'User') : 'User'}
            </span>
            <button className="btn btn-secondary" onClick={() => handleNavClick('overview')}>Go to Dashboard</button>
            <button className="btn btn-primary" onClick={handleLogout}>Log Out</button>
          </>
        ) : (
          <>
            <button className="btn btn-primary" onClick={() => handleNavClick('auth')}>Log In / Register</button>
          </>
        )}
      </div>

      {/* Hamburger Toggle Button (visible <= 768px) */}
      <button 
        className="mobile-menu-btn" 
        onClick={() => setMenuOpen(!menuOpen)}
        title="Toggle Menu"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Dropdown Menu Card */}
      {menuOpen && (
        <div className="landing-mobile-menu">
          <div className="landing-mobile-menu-links">
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Services</div>
            <span onClick={() => handleNavClick('otp')} style={{ color: 'var(--text-primary)', fontWeight: '600' }}>💬 SMS OTP Verification</span>
            <span onClick={() => handleNavClick('esim')} style={{ color: 'var(--text-primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📶 eSIM Travel Profiles
              {!dbIsAdmin && (
                <span style={{ fontSize: '9px', background: 'var(--border-color)', color: 'var(--text-secondary)', padding: '2px 4px', borderRadius: '4px', textTransform: 'uppercase' }}>Coming Soon</span>
              )}
            </span>
            <span onClick={() => handleNavClick('smm')} style={{ color: 'var(--text-primary)', fontWeight: '600' }}>📈 SMM Panel Reseller</span>
            <span onClick={() => { navigate('/marketplace'); setMenuOpen(false); }} style={{ color: 'var(--color-pink)', fontWeight: '700' }}>⭐ Premium Accounts Shop</span>
          </div>

          <div className="landing-mobile-menu-actions">
            {/* Theme Toggle Button */}
            <button 
              className="btn btn-secondary" 
              onClick={toggleTheme}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
            >
              {theme === 'light' ? (
                <>
                  <Moon size={16} style={{ color: 'var(--color-pink)' }} />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun size={16} style={{ color: 'var(--color-turquoise)' }} />
                  <span>Light Mode</span>
                </>
              )}
            </button>

            {isLoggedIn ? (
              <>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', margin: '4px 0' }}>
                  Logged in as: <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong>
                </div>
                <button className="btn btn-secondary" style={{ width: '100%', padding: '12px' }} onClick={() => handleNavClick('overview')}>
                  Go to Dashboard
                </button>
                <button className="btn btn-primary" style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-primary" style={{ width: '100%', padding: '12px' }} onClick={() => handleNavClick('auth')}>
                  Log In / Register
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNav;
