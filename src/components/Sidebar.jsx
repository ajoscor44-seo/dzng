import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Key, 
  RefreshCw, 
  Smartphone, 
  Share2, 
  CreditCard, 
  Compass, 
  Settings, 
  LogOut,
  User,
  ShieldCheck,
  ClipboardList,
  MessageSquare,
  Code
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { isAdmin, setIsAdmin, dbIsAdmin, user, logoutUser } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract the active tab from the URL pathname (e.g. /dashboard/otp -> otp)
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts.length > 2 ? pathParts[2] : 'overview';

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'otp', label: 'SMS OTP (Temp)', icon: Key },
    { id: 'social', label: 'Social Media Logs', icon: ShieldCheck },
    { id: 'reuse', label: 'Reuse Number', icon: RefreshCw },
    { id: 'esim', label: 'eSIM Travel', icon: Smartphone },
    { id: 'smm', label: 'SMM Panel', icon: Share2 },
    { id: 'wallet', label: 'Wallet & Fund', icon: CreditCard },
    { id: 'orders', label: 'Order History', icon: ClipboardList },
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'api', label: 'Developer API', icon: Code },
    { id: 'support', label: 'Support Desk', icon: MessageSquare },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.id === 'api' && !isAdmin) return false;
    return true;
  });

  const handleNavClick = (tabId, external = false, url = '') => {
    if (external) {
      window.open(url, '_blank');
    } else {
      if (tabId === 'overview') navigate('/dashboard');
      else navigate(`/dashboard/${tabId}`);
    }
    setSidebarOpen(false); // Close sidebar on mobile
  };

  return (
    <>
      {/* Dimmed Overlay Background for Mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo sidebar-logo--hide-mobile-auth" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '32px 32px 20px', borderBottom: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="ZAR Logo" style={{ width: '64px', height: '64px', objectFit: 'contain', borderRadius: '12px', flexShrink: 0 }} />
          </div>
        </div>

        <ul className="sidebar-menu">

          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <li key={item.id} className="sidebar-item">
                <div
                  onClick={() => handleNavClick(item.id, item.external, item.url)}
                  className={`sidebar-link ${isSelected ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', textDecoration: 'none' }}
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isSelected ? '700' : '500', fontFamily: 'var(--font-label)' }}>{item.label}</span>
                    {item.id === 'subs' && (
                      <span style={{ 
                        fontSize: '7.5px', 
                        background: 'linear-gradient(135deg, var(--color-violet) 0%, var(--color-pink) 100%)', 
                        color: '#fff', 
                        padding: '1px 4px', 
                        borderRadius: '4px', 
                        fontWeight: '900',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        boxShadow: '0 0 6px rgba(255, 0, 127, 0.3)',
                        flexShrink: 0,
                        marginLeft: '4px'
                      }}>
                        discount zar
                      </span>
                    )}
                    {item.id === 'esim' && !dbIsAdmin && (
                      <span style={{ 
                        fontSize: '8px', 
                        background: 'rgba(255, 255, 255, 0.1)', 
                        color: 'var(--text-secondary)', 
                        padding: '2px 4px', 
                        borderRadius: '4px', 
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        flexShrink: 0,
                        marginLeft: '4px'
                      }}>
                        Coming Soon
                      </span>
                    )}
                  </span>
                </div>
              </li>
            );
          })}

          {isAdmin && (
            <>
              <div style={{ height: '1px', background: 'var(--border-color)', margin: '12px 0' }} />
              <li className="sidebar-item">
                <div
                  onClick={() => handleNavClick('admin')}
                  className={`sidebar-link pink ${activeTab === 'admin' ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }}
                >
                  <ShieldCheck size={18} style={{ color: 'var(--color-pink)' }} />
                  <span style={{ color: 'var(--color-pink)', fontWeight: '700', fontSize: '14px', fontFamily: 'var(--font-label)' }}>Admin Panel</span>
                </div>
              </li>
            </>
          )}
        </ul>

        <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <button 
            onClick={() => handleNavClick('wallet')}
            className="primary-gradient" 
            style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'var(--font-label)', textAlign: 'center' }}
          >
            Add Funds
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div 
              onClick={() => handleNavClick('profile')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', transition: 'all 0.2s ease', fontFamily: 'var(--font-label)' }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <Settings size={14} />
              <span>Settings</span>
            </div>
            {user && (
              <div 
                onClick={() => {
                  logoutUser();
                  navigate('/');
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', transition: 'all 0.2s ease', fontFamily: 'var(--font-label)' }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--color-pink)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <LogOut size={14} />
                <span>Logout</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
