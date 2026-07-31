import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { supabase } from '../supabase';
import posthog from '../posthog';
import { Compass, Mail, Lock, User, Phone, CheckSquare, Square, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import loginSocialImg from '../assets/login_social.jpg';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const { isLoggedIn, isAuthLoading } = useContext(AppContext);

  useEffect(() => {
    if (!isAuthLoading && isLoggedIn) {
      navigate(from, { replace: true });
    }
  }, [isLoggedIn, isAuthLoading, navigate, from]);

  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred during Google authentication.');
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    // Validations
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!isForgotPassword && password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (isForgotPassword) {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dashboard`,
      });
      setLoading(false);
      if (error) {
        setErrorMsg(error.message);
      } else {
        posthog.capture('password_reset_requested');
        setErrorMsg('Password reset link sent! Check your email.');
      }
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (!username.trim() || username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
        setErrorMsg('Please enter a valid username (alphanumeric and underscores only, min 3 chars).');
        return;
      }
      if (!phoneNumber.trim()) {
        setErrorMsg('Please enter your phone number.');
        return;
      }
      if (!agreeTerms) {
        setErrorMsg('You must agree to the Terms of Service.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        posthog.capture('user_logged_in');
        setLoading(false);
        navigate(from, { replace: true });
      } else {
        // Normalize phone number to 11 digits (e.g. 08012345678)
        let normalizedPhone = phoneNumber.replace(/\D/g, '');
        if (normalizedPhone.startsWith('234') && normalizedPhone.length === 13) {
          normalizedPhone = '0' + normalizedPhone.substring(3);
        }
        if (normalizedPhone.length === 10 && !normalizedPhone.startsWith('0')) {
          normalizedPhone = '0' + normalizedPhone;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              username: username,
              phone: normalizedPhone
            }
          }
        });

        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        posthog.capture('user_registered');
        setLoading(false);
        if (data?.session) {
          navigate(from, { replace: true });
        } else {
          setErrorMsg('Registration successful! Please check your email for the confirmation link.');
          // Switch to login tab so they can sign in after verifying
          setIsLogin(true);
        }
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred during authentication.');
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      display: 'flex',
      background: 'var(--bg-main)',
      position: 'relative'
    }}>
      <style>{`
        @media (max-width: 900px) {
          .login-image-panel {
            display: none !important;
          }
        }
      `}</style>

      {/* Back to Home Trigger */}
      <button 
        className="btn btn-secondary" 
        onClick={() => navigate('/')} 
        style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', alignItems: 'center', gap: '6px', zIndex: 10, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
      >
        <ArrowLeft size={16} />
        Back to Home
      </button>

      {/* Left Side: Premium Image Panel (Hidden on Mobile) */}
      <div className="login-image-panel" style={{ 
        flex: 1.2, 
        position: 'relative', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '60px',
        borderRight: '1px solid rgba(255,255,255,0.05)'
      }}>
        {/* Background Image with Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${loginSocialImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.65) contrast(1.05)'
        }} />
        
        {/* Overlay gradient */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to top, rgba(15, 10, 25, 0.95) 0%, rgba(15, 10, 25, 0.3) 100%)',
          zIndex: 1
        }} />

        {/* Text Overlay */}
        <div style={{ zIndex: 2, position: 'relative', maxWidth: '480px', textAlign: 'left' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginBottom: '16px', lineHeight: '1.2', fontFamily: 'var(--font-heading)' }}>
            Instant Access to Premium Accounts & Services
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
            Deploy bulk logs, SMM panel campaigns, e-SIM travel bundles, and virtual phone numbers in one unified console dashboard.
          </p>
        </div>
      </div>

      {/* Right Side: Form Panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        zIndex: 2
      }}>
        {/* Auth Main Card */}
        <div className="glass-panel" style={{ 
          width: '100%', 
          maxWidth: '460px', 
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-glow)'
      }}>
        
        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={32} style={{ color: 'var(--color-turquoise)' }} />
            <span style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-turquoise)', letterSpacing: '-0.03em' }}>discountzar.ng</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
            {isLogin ? 'Access your digital services dashboard console' : 'Create an account to deploy instant digital assets'}
          </p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px' }}>
          <button 
            onClick={() => { setIsLogin(true); setIsForgotPassword(false); setErrorMsg(''); }}
            style={{ 
              flex: 1, 
              padding: '12px 0', 
              background: 'none', 
              border: 'none', 
              borderBottom: isLogin ? '2px solid var(--color-turquoise)' : '2px solid transparent',
              color: isLogin ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '15px'
            }}
          >
            Log In
          </button>
          <button 
            onClick={() => { setIsLogin(false); setIsForgotPassword(false); setErrorMsg(''); }}
            style={{ 
              flex: 1, 
              padding: '12px 0', 
              background: 'none', 
              border: 'none', 
              borderBottom: !isLogin ? '2px solid var(--color-turquoise)' : '2px solid transparent',
              color: !isLogin ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '15px'
            }}
          >
            Register
          </button>
        </div>

        {/* OAuth Dividers & Social Buttons (Placed at the top) */}
        {!isForgotPassword && (
          <>
            <button 
              type="button" 
              onClick={handleGoogleLogin} 
              className="btn btn-secondary hover-lift" 
              style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px' }}
            >
              <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Continue with Google</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0', gap: '10px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            </div>
          </>
        )}

        {/* Auth Error Banner */}
        {errorMsg && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '12px', 
            background: 'rgba(255, 59, 48, 0.15)', 
            border: '1px solid rgba(255, 59, 48, 0.3)', 
            borderRadius: '8px', 
            color: 'var(--color-danger)', 
            fontSize: '13px' 
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {!isLogin && !isForgotPassword && (
            <>
              <div>
                <label className="form-label" htmlFor="auth-name">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-secondary)' }} />
                  <input
                    id="auth-name"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '44px' }}
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="auth-username">Username</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-secondary)' }} />
                  <input
                    id="auth-username"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '44px' }}
                    placeholder="johndoe_99"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="auth-phone">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-secondary)' }} />
                  <input
                    id="auth-phone"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '44px' }}
                    placeholder="+234 80 1234 5678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="form-label" htmlFor="auth-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-secondary)' }} />
              <input
                id="auth-email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {!isForgotPassword && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="auth-pass" style={{ marginBottom: 0 }}>Password</label>
                {isLogin && (
                  <span 
                    style={{ fontSize: '12px', color: 'var(--color-turquoise)', cursor: 'pointer' }}
                    onClick={() => setIsForgotPassword(true)}
                  >
                    Forgot Password?
                  </span>
                )}
              </div>
              <div style={{ position: 'relative', marginTop: '8px' }}>
                <Lock size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-secondary)' }} />
                <input
                  id="auth-pass"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  style={{ paddingLeft: '44px', paddingRight: '44px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div 
                  style={{ position: 'absolute', right: '16px', top: '16px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </div>
              </div>
            </div>
          )}

          {/* Checkboxes */}
          {!isForgotPassword && (
            isLogin ? (
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => setRememberMe(!rememberMe)}
              >
                {rememberMe ? (
                  <CheckSquare size={18} style={{ color: 'var(--color-turquoise)' }} />
                ) : (
                  <Square size={18} style={{ color: 'var(--text-secondary)' }} />
                )}
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Remember my device</span>
              </div>
            ) : (
              <div 
                style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => setAgreeTerms(!agreeTerms)}
              >
                {agreeTerms ? (
                  <CheckSquare size={18} style={{ color: 'var(--color-turquoise)', flexShrink: 0, marginTop: '2px' }} />
                ) : (
                  <Square size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0, marginTop: '2px' }} />
                )}
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  I agree to the discountzar.ng <span onClick={() => navigate('/terms')} style={{ cursor: 'pointer', color: 'var(--color-turquoise)' }}>Terms</span> and <span onClick={() => navigate('/privacy')} style={{ cursor: 'pointer', color: 'var(--color-turquoise)' }}>Privacy</span> policy.
                </span>
              </div>
            )
          )}

          {/* Submit */}
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ padding: '14px', width: '100%', display: 'flex', justifyContent: 'center', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : isForgotPassword ? 'Send Reset Link' : isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle Option Link */}
        <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          {isLogin ? (
            <span>
              Don't have an account?{' '}
              <strong 
                onClick={() => { setIsLogin(false); setIsForgotPassword(false); setErrorMsg(''); }}
                style={{ color: 'var(--color-turquoise)', cursor: 'pointer' }}
              >
                Register here
              </strong>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <strong 
                onClick={() => { setIsLogin(true); setIsForgotPassword(false); setErrorMsg(''); }}
                style={{ color: 'var(--color-turquoise)', cursor: 'pointer' }}
              >
                Log In
              </strong>
            </span>
          )}
        </div>

      </div>
      </div>
    </div>
  );
};

export default Auth;
