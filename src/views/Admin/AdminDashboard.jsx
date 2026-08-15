import React, { useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { supabase } from '../../supabase';
import { 
  ShieldCheck, MessageSquare, Plus, Save, DollarSign, Wallet, 
  CheckCircle, AlertCircle, Users, List, BarChart3, Settings, 
  TrendingUp, RefreshCw, Send, ArrowUpRight, Search, FileText, Download,
  Eye, UserCheck, Ban, LayoutDashboard, Activity, ArrowRight, Clock,
  CreditCard, Server, Zap, Check, Smartphone, Share2, Key, ShoppingBag,
  ExternalLink
} from 'lucide-react';

// Module-level in-memory cache to ensure zero reload/flash on tab navigation
let adminDataCache = {
  profiles: null,
  transactions: null,
  otpOrders: null,
  tickets: null,
  lastFetched: 0
};

const AdminDashboard = () => {
  const { 
    walletBalance, 
    activeOtps, 
    rentedNumbers, 
    subscriptions, 
    otpServices, 
    esimPackages, 
    smmServices,
    transactions,
    activeEsims,
    smmOrders,
    accountSubscriptions,
    simulateSmsDelivery,
    updatePrices,
    setManualWallet,
    simulatePocketFiDeposit,
    user,
    profile,
    formatCost,
    profitMarkup,
    updateProfitMarkup,
    exchangeRate,
    setExchangeRate,
    adminFetchAllTransactions,
    adminFetchAllProfiles,
    adminUpdateSystemConfig,
    adminUpdateProfile,
    adminFetchAllOtpOrders,
    isAdmin,
    isAuthLoading
  } = useContext(AppContext);

  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Safeguard role access: navigate away if loading finishes and user is not an administrator
  useEffect(() => {
    if (!isAuthLoading && !isAdmin) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAdmin, isAuthLoading, navigate]);

  if (isAuthLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#f0f0f1' }}>
        <div className="spinner-loader" style={{ width: '40px', height: '40px', borderTopColor: 'var(--color-turquoise)' }}></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  // Dashboard Sub-navigation Tabs: 'overview', 'users', 'transactions', 'sms', 'pricing'
  const [adminTab, setAdminTab] = useState('overview');

  // Pagination states
  const [usersPage, setUsersPage] = useState(1);
  const USERS_PER_PAGE = 10;
  const [txPage, setTxPage] = useState(1);
  const TX_PER_PAGE = 20;

  // Database-synced states (initialized from cache if available)
  const [dbProfiles, setDbProfiles] = useState(() => adminDataCache.profiles || []);
  const [dbTransactions, setDbTransactions] = useState(() => adminDataCache.transactions || []);
  const [dbOtpOrders, setDbOtpOrders] = useState(() => adminDataCache.otpOrders || []);
  const [dbTickets, setDbTickets] = useState(() => adminDataCache.tickets || []);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [updatingTicketId, setUpdatingTicketId] = useState(null);

  const fetchAdminData = async (force = false) => {
    // If we have cached data and it's less than 60s old, avoid re-fetching unless forced
    if (!force && adminDataCache.profiles && (Date.now() - adminDataCache.lastFetched < 60000)) {
      return;
    }
    setIsLoadingDb(true);
    try {
      const [profilesRes, txRes, otpOrdersRes, ticketsRes] = await Promise.all([
        adminFetchAllProfiles(),
        adminFetchAllTransactions(),
        adminFetchAllOtpOrders(),
        supabase.from('support_tickets').select('*').order('created_at', { ascending: false })
      ]);

      if (profilesRes && profilesRes.success) {
        setDbProfiles(profilesRes.data);
        adminDataCache.profiles = profilesRes.data;
      }
      if (txRes && txRes.success) {
        setDbTransactions(txRes.data);
        adminDataCache.transactions = txRes.data;
      }
      if (otpOrdersRes && otpOrdersRes.success) {
        setDbOtpOrders(otpOrdersRes.data);
        adminDataCache.otpOrders = otpOrdersRes.data;
      }
      if (ticketsRes && !ticketsRes.error && ticketsRes.data) {
        setDbTickets(ticketsRes.data);
        adminDataCache.tickets = ticketsRes.data;
      }
      adminDataCache.lastFetched = Date.now();
    } catch (e) {
      console.error("Failed to load admin db data:", e);
    } finally {
      setIsLoadingDb(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId, nextStatus) => {
    setUpdatingTicketId(ticketId);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: nextStatus })
        .eq('id', ticketId);
      if (error) {
        alert(`Failed to update ticket status: ${error.message}`);
      } else {
        await fetchAdminData(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      const { error } = await supabase
        .from('support_tickets')
        .delete()
        .eq('id', ticketId);
      if (error) {
        alert(`Failed to delete ticket: ${error.message}`);
      } else {
        await fetchAdminData(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Combine real database-linked profiles
  const allUsers = useMemo(() => {
    return (dbProfiles || []).length > 0
      ? (dbProfiles || []).map(p => {
          const rawName = p.full_name || '';
          const nameClean = rawName.includes('(You / Admin)') ? rawName.replace(/\(You \/ Admin\)/g, '').trim() : rawName;
          return {
            id: p.id,
            full_name: p.id === user?.id 
              ? `${nameClean || p.username || p.email || 'Admin'} (You / Admin)` 
              : nameClean || p.username || p.email || 'Unnamed Client',
            username: p.username || '',
            phone: p.phone || 'N/A',
            email: p.email || 'N/A',
            wallet_balance: Number(p.wallet_balance),
            created_at: p.created_at || new Date().toISOString(),
            isReal: true
          };
        })
      : (profile && (profile.full_name || profile.username) ? [{
          id: user?.id || 'real-admin',
          full_name: `${profile.full_name || profile.username || user?.email || 'Admin'} (You / Admin)`,
          username: profile.username || '',
          phone: profile.phone || 'N/A',
          email: user?.email || 'N/A',
          wallet_balance: walletBalance,
          created_at: new Date().toISOString(),
          isReal: true
        }] : []);
  }, [dbProfiles, user, profile, walletBalance]);

  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilterTab, setUserFilterTab] = useState('ALL'); // ALL, VERIFIED, BANNED
  
  // Local storage mock states for verification & bans
  const [verifiedUserIds, setVerifiedUserIds] = useState(() => {
    return JSON.parse(localStorage.getItem('zp_verified_user_ids') || '[]');
  });
  const [restrictedUserIds, setRestrictedUserIds] = useState(() => {
    return JSON.parse(localStorage.getItem('zp_restricted_user_ids') || '[]');
  });

  const getInitials = (name) => {
    if (!name) return '??';
    // Strip parenthetical info (like "(You / Admin)")
    const cleanName = name.replace(/\([^)]*\)/g, '').trim();
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
    }
    return cleanName.slice(0, 2).toUpperCase();
  };

  const handleToggleVerify = (userId) => {
    let next;
    if (verifiedUserIds.includes(userId)) {
      next = verifiedUserIds.filter(id => id !== userId);
    } else {
      next = [...verifiedUserIds, userId];
    }
    setVerifiedUserIds(next);
    localStorage.setItem('zp_verified_user_ids', JSON.stringify(next));
  };

  const handleToggleRestrict = (userId) => {
    let next;
    if (restrictedUserIds.includes(userId)) {
      next = restrictedUserIds.filter(id => id !== userId);
    } else {
      next = [...restrictedUserIds, userId];
    }
    setRestrictedUserIds(next);
    localStorage.setItem('zp_restricted_user_ids', JSON.stringify(next));
  };

  const filteredUsers = allUsers
    .filter(u => {
      if (userFilterTab === 'VERIFIED') return verifiedUserIds.includes(u.id);
      if (userFilterTab === 'BANNED') return restrictedUserIds.includes(u.id);
      return true;
    })
    .filter(u => 
      (u.full_name || '').toLowerCase().includes(userSearchQuery.toLowerCase()) || 
      (u.phone || '').includes(userSearchQuery) ||
      (u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(userSearchQuery.toLowerCase())
    );

  // Reset pagination on search or filter tab change
  useEffect(() => { setUsersPage(1); }, [userSearchQuery, userFilterTab]);

  const paginatedUsers = filteredUsers.slice((usersPage - 1) * USERS_PER_PAGE, usersPage * USERS_PER_PAGE);
  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));

  // User Management State
  const [selectedUserId, setSelectedUserId] = useState(null);
  const selectedUser = useMemo(() => {
    if (!allUsers || allUsers.length === 0) return null;
    return allUsers.find(u => u.id === selectedUserId) || allUsers[0] || null;
  }, [allUsers, selectedUserId]);
  
  const [userModalTab, setUserModalTab] = useState('overview'); // 'overview', 'transactions', 'otp', 'tickets', 'adjust'

  const userTransactions = useMemo(() => {
    if (!selectedUser) return [];
    return (dbTransactions || []).filter(t => t.user_id === selectedUser.id);
  }, [selectedUser, dbTransactions]);

  const userOtpOrders = useMemo(() => {
    if (!selectedUser) return [];
    return (dbOtpOrders || []).filter(o => o.user_id === selectedUser.id);
  }, [selectedUser, dbOtpOrders]);

  const userTickets = useMemo(() => {
    if (!selectedUser) return [];
    return (dbTickets || []).filter(t => 
      t.user_id === selectedUser.id || 
      (t.email && selectedUser.email && t.email.toLowerCase() === selectedUser.email.toLowerCase()) || 
      (t.phone && selectedUser.phone && t.phone === selectedUser.phone && t.phone !== 'N/A')
    );
  }, [selectedUser, dbTickets]);

  const userLifetimeDeposited = useMemo(() => {
    return userTransactions
      .filter(t => t.type === 'Deposit')
      .reduce((sum, t) => sum + Number(t.amountNgn || t.amount || 0), 0);
  }, [userTransactions]);

  const userLifetimeSpent = useMemo(() => {
    return userTransactions
      .filter(t => t.type === 'Purchase')
      .reduce((sum, t) => sum + Number(t.amountNgn || t.amount || 0), 0);
  }, [userTransactions]);

  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState('set'); // set, add, deduct
  const [adjustResult, setAdjustResult] = useState('');
  const [simDepositAmount, setSimDepositAmount] = useState(5000);
  const [simDepositSuccess, setSimDepositSuccess] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [editProfileResult, setEditProfileResult] = useState('');

  // SMS Simulator Form State
  const allTargets = useMemo(() => {
    const activeOtpTargets = activeOtps.filter(o => o.status === 'WAITING');
    const activeRentalTargets = rentedNumbers.filter(r => r.status === 'ACTIVE');
    return [
      ...activeOtpTargets.map(o => ({ type: 'OTP Session', number: o.phoneNumber, label: `${o.service} Temp OTP - ${o.phoneNumber}` })),
      ...activeRentalTargets.map(r => ({ type: 'Rental line', number: r.phoneNumber, label: `${r.flag} Rented Line (${r.service}) - ${r.phoneNumber}` }))
    ];
  }, [activeOtps, rentedNumbers]);

  const [selectedNumber, setSelectedNumber] = useState(allTargets[0]?.number || '');
  const [smsText, setSmsText] = useState('Your verification code is: 582910');
  const [simResult, setSimResult] = useState({ success: null, msg: '' });

  // Price Editors state
  const [pricesList, setPricesList] = useState({});
  const [pricingCategory, setPricingCategory] = useState('subs'); // subs, otp, esim, smm
  const [savePriceResult, setSavePriceResult] = useState('');

  // Transaction Logs state
  const [searchTx, setSearchTx] = useState('');
  const [filterTxType, setFilterTxType] = useState('ALL');

  // OTP Orders Logs state
  const [otpPage, setOtpPage] = useState(1);
  const OTP_PER_PAGE = 20;
  const [searchOtp, setSearchOtp] = useState('');
  const [filterOtpServer, setFilterOtpServer] = useState('ALL');
  const [filterOtpStatus, setFilterOtpStatus] = useState('ALL');

  useEffect(() => { setTxPage(1); }, [searchTx, filterTxType]);
  useEffect(() => { setOtpPage(1); }, [searchOtp, filterOtpServer, filterOtpStatus]);

  const filteredOtpOrders = (dbOtpOrders || [])
    .filter(order => filterOtpServer === 'ALL' || order.server === filterOtpServer)
    .filter(order => filterOtpStatus === 'ALL' || order.status === filterOtpStatus)
    .filter(order => {
      const q = searchOtp.toLowerCase();
      const clientName = order.profiles?.full_name || 'N/A';
      const clientPhone = order.profiles?.phone || 'N/A';
      return (
        (order.id || '').toLowerCase().includes(q) ||
        (order.phone_number || '').includes(q) ||
        (order.service || '').toLowerCase().includes(q) ||
        (clientName || '').toLowerCase().includes(q) ||
        (clientPhone || '').toLowerCase().includes(q)
      );
    });

  const handleExportOtpOrders = () => {
    const rows = [
      ['Order ID', 'Client Name', 'Client Email', 'Client Phone', 'Created At', 'Server', 'Service', 'Phone Number', 'Price (₦)', 'OTP Code', 'SMS Text', 'Status'],
      ...filteredOtpOrders.map(o => [
        o.id,
        o.profiles?.full_name || 'N/A',
        o.profiles?.email || 'N/A',
        o.profiles?.phone || 'N/A',
        new Date(o.created_at).toLocaleString(),
        o.server,
        o.service,
        o.phone_number,
        o.price_ngn,
        o.otp_code || '',
        o.sms_text || '',
        o.status
      ])
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discountzar_admin_otp_orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const allTransactions = [
    ...(dbTransactions || []).map(t => ({
      ...t,
      isReal: true
    }))
  ];

  // Auto-select first number if target list changes
  useEffect(() => {
    if (allTargets.length > 0 && !selectedNumber) {
      setSelectedNumber(allTargets[0].number);
    }
  }, [allTargets, selectedNumber]);

  const handleSimulateSms = (e) => {
    e.preventDefault();
    setSimResult({ success: null, msg: '' });
    if (!selectedNumber) {
      setSimResult({ success: false, msg: 'No active numbers selected' });
      return;
    }
    if (!smsText.trim()) {
      setSimResult({ success: false, msg: 'SMS text cannot be empty' });
      return;
    }

    const result = simulateSmsDelivery(selectedNumber, smsText);
    if (result.success) {
      setSimResult({ success: true, msg: result.msg });
      setSmsText('Your verification code is: ');
    } else {
      setSimResult({ success: false, msg: result.msg });
    }
  };

  const handlePriceChange = (category, id, val) => {
    setPricesList(prev => ({
      ...prev,
      [`${category}-${id}`]: val
    }));
  };

  const handleSavePrice = (category, id) => {
    const val = pricesList[`${category}-${id}`];
    if (val === undefined || isNaN(val) || val === '') return;
    updatePrices(category, id, Number(val));
    setSavePriceResult(`Updated rate for ${id} successfully!`);
    setTimeout(() => setSavePriceResult(''), 3000);
  };

  const handleUserBalanceAdjust = async (e) => {
    e.preventDefault();
    setAdjustResult('');
    if (!selectedUser) return;
    const amountVal = Number(adjustAmount);
    if (isNaN(amountVal) || amountVal < 0) {
      setAdjustResult('Invalid amount entered.');
      return;
    }

    let targetNewBalance = amountVal;
    if (adjustType === 'add') targetNewBalance = selectedUser.wallet_balance + amountVal;
    else if (adjustType === 'deduct') targetNewBalance = Math.max(0, selectedUser.wallet_balance - amountVal);

    if (selectedUser.isReal) {
      // Sync real user balance to Database & AppContext
      const res = await adminUpdateProfile(selectedUser.id, { newBalance: targetNewBalance });
      if (!res.success) {
        setAdjustResult(`Database update failed: ${res.msg}`);
        return;
      }
      if (selectedUser.id === user?.id) {
        setManualWallet(targetNewBalance);
      }
      setAdjustResult(`Database wallet updated: ${formatCost(targetNewBalance)}`);
      await fetchAdminData(true);
    } else {
      setAdjustResult(`Mock client wallet adjustment is not supported.`);
    }
    setAdjustAmount('');
  };

  const handleSimulateWebhookDeposit = async (e) => {
    e.preventDefault();
    setSimDepositSuccess(false);
    if (!selectedUser) return;
    
    if (selectedUser.isReal) {
      const ref = `dep-sim-${Math.floor(100000 + Math.random() * 900000)}`;
      const { data, error } = await supabase.rpc('process_deposit', {
        p_tx_id: ref,
        p_user_id: selectedUser.id,
        p_amount: Number(simDepositAmount),
        p_method: 'PocketFi Webhook (Simulated)'
      });
      if (error) {
        setAdjustResult(`Simulation failed: ${error.message}`);
      } else {
        setSimDepositSuccess(true);
        await fetchAdminData(true);
      }
    } else {
      setAdjustResult(`Mock client webhook deposit is not supported.`);
    }
  };

  const handleOpenEditModal = (u, defaultTab = 'overview') => {
    setSelectedUserId(u.id);
    setUserModalTab(defaultTab);
    const dbProf = (dbProfiles || []).find(p => p.id === u.id) || {};
    setEditFullName(u.full_name.replace(' (You / Admin)', ''));
    setEditUsername(dbProf.username || '');
    setEditPhone(u.phone === 'N/A' ? '' : u.phone);
    setEditIsAdmin(dbProf.is_admin === true);
    setEditProfileResult('');
    setAdjustResult('');
    setSimDepositSuccess(false);
    setIsUserModalOpen(true);
  };

  const handleSaveProfileDetails = async (e) => {
    e.preventDefault();
    setEditProfileResult('');
    if (!selectedUser) return;

    if (selectedUser.isReal) {
      const res = await adminUpdateProfile(selectedUser.id, {
        fullName: editFullName,
        username: editUsername,
        phone: editPhone,
        isAdmin: editIsAdmin
      });
      if (res.success) {
        setEditProfileResult('Profile updated successfully!');
        await fetchAdminData(true);
      } else {
        setEditProfileResult(`Update failed: ${res.msg}`);
      }
    } else {
      setEditProfileResult('Editing mock profiles is not supported.');
    }
  };

  // Stats Computations
  const totalClientCash = allUsers.reduce((sum, u) => sum + u.wallet_balance, 0);
  const totalLedgerTransactions = (dbTransactions || []).length;
  
  // Detailed Database Stats
  const liveUserCount = (dbProfiles || []).length;
  const livePurchaseCount = (dbTransactions || []).filter(t => t.type === 'Purchase').length;
  const liveDepositCount = (dbTransactions || []).filter(t => t.type === 'Deposit').length;
  const totalDepositedReal = (dbTransactions || [])
    .filter(t => t.type === 'Deposit')
    .reduce((sum, t) => sum + Number(t.amountNgn || 0), 0);

  // Compute estimated platform profit from live database transactions
  const estimatedProfit = (dbTransactions || []).reduce((acc, tx) => {
    if (tx.type !== 'Purchase') return acc;
    const methodLower = (tx.method || '').toLowerCase();
    const amt = Number(tx.amountNgn || tx.amount || 0);
    let markup = 30; // default subscription profit markup
    if (methodLower.includes('otp')) markup = profitMarkup.otp || 50;
    else if (methodLower.includes('esim')) markup = profitMarkup.esim || 40;
    else if (methodLower.includes('smm')) markup = profitMarkup.smm || 50;
    else markup = profitMarkup.subs || 30;
    
    const profit = amt - (amt / (1 + markup / 100));
    return acc + profit;
  }, 0);

  // Detailed Category Stats
  const categoryStats = useMemo(() => {
    const txs = dbTransactions || [];
    const stats = {
      otp: { count: 0, volume: 0 },
      esim: { count: 0, volume: 0 },
      smm: { count: 0, volume: 0 },
      subs: { count: 0, volume: 0 },
      other: { count: 0, volume: 0 }
    };
    txs.forEach(tx => {
      if (tx.type !== 'Purchase') return;
      const method = (tx.method || '').toLowerCase();
      const amount = Number(tx.amountNgn || tx.amount || 0);
      if (method.includes('otp')) {
        stats.otp.count++;
        stats.otp.volume += amount;
      } else if (method.includes('esim')) {
        stats.esim.count++;
        stats.esim.volume += amount;
      } else if (method.includes('smm')) {
        stats.smm.count++;
        stats.smm.volume += amount;
      } else if (method.includes('subscription') || method.includes('sub')) {
        stats.subs.count++;
        stats.subs.volume += amount;
      } else {
        stats.other.count++;
        stats.other.volume += amount;
      }
    });
    return stats;
  }, [dbTransactions]);

  // Compute top server statistics based on live OTP orders
  const topServers = useMemo(() => {
    const counts = {};
    (dbOtpOrders || []).forEach(order => {
      const srv = order.server || 'Unknown';
      if (!counts[srv]) {
        counts[srv] = { name: srv, total: 0, completed: 0 };
      }
      counts[srv].total++;
      if (order.status === 'COMPLETED' || order.status === 'SUCCESS') {
        counts[srv].completed++;
      }
    });
    return Object.values(counts)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [dbOtpOrders]);

  const renderTabHeader = (title) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 20px 0', flexWrap: 'wrap', gap: '10px' }}>
        <h1 className="wp-heading" style={{ margin: 0 }}>{title}</h1>
        <button 
          className="wp-button-secondary" 
          onClick={() => fetchAdminData(true)} 
          disabled={isLoadingDb}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', height: '30px', padding: '0 12px', fontSize: '13px', borderRadius: '3px' }}
        >
          <RefreshCw size={14} className={isLoadingDb ? 'spin-animation' : ''} />
          {isLoadingDb ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
    );
  };

  return (
    <div className="wp-admin-wrapper">
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        /* WP Theme sandbox variables and styles */
        .wp-admin-wrapper {
          display: flex;
          flex-direction: ${isMobile ? 'column' : 'row'};
          min-height: calc(100vh - 60px);
          background-color: #f0f0f1;
          color: #2c3338;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          margin: -24px;
          box-sizing: border-box;
        }
        .wp-admin-wrapper * {
          box-sizing: border-box;
        }
        .wp-sidebar {
          width: ${isMobile ? '100%' : '180px'};
          background: #1d2327;
          color: #c3c4c7;
          flex-shrink: 0;
          display: flex;
          flex-direction: ${isMobile ? 'row' : 'column'};
          overflow-x: ${isMobile ? 'auto' : 'visible'};
          border-bottom: ${isMobile ? '1px solid #2c3338' : 'none'};
        }
        .wp-sidebar-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: ${isMobile ? '12px 14px' : '10px 16px'};
          color: #c3c4c7;
          background: none;
          border: none;
          width: ${isMobile ? 'auto' : '100%'};
          white-space: nowrap;
          text-align: left;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.1s ease-in-out;
          border-left: ${isMobile ? 'none' : '4px solid transparent'};
          border-bottom: ${isMobile ? '3px solid transparent' : 'none'};
        }
        .wp-sidebar-item:hover {
          background: #2c3338;
          color: #72aee6;
        }
        .wp-sidebar-item.active {
          background: #2c3338;
          color: #fff;
          border-left-color: ${isMobile ? 'none' : '#2271b1'};
          border-bottom-color: ${isMobile ? '#2271b1' : 'none'};
          font-weight: 600;
        }
        .wp-content {
          flex: 1;
          padding: 20px;
          background: #f0f0f1;
          overflow-x: hidden;
        }
        .wp-heading {
          font-size: 23px;
          font-weight: 400;
          margin: 0 0 20px 0;
          color: #1d2327;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .wp-button-primary {
          background: #2271b1;
          border: 1px solid #2271b1;
          border-radius: 3px;
          color: #fff;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 13px;
          padding: 4px 12px;
          font-weight: 500;
          height: 30px;
          transition: background 0.1s ease-in-out;
        }
        .wp-button-primary:hover {
          background: #135e96;
          border-color: #135e96;
        }
        .wp-button-secondary {
          background: #f6f7f7;
          border: 1px solid #8c8f94;
          border-radius: 3px;
          color: #2271b1;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 13px;
          padding: 4px 12px;
          font-weight: 500;
          height: 30px;
          transition: all 0.1s ease-in-out;
        }
        .wp-button-secondary:hover {
          background: #f0f6fc;
          color: #135e96;
          border-color: #135e96;
        }
        .wp-button-secondary:disabled, .wp-button-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .wp-metabox {
          background: #fff;
          border: 1px solid #ccd0d4;
          box-shadow: 0 1px 1px rgba(0,0,0,.04);
          margin-bottom: 20px;
        }
        .wp-metabox-header {
          border-bottom: 1px solid #ccd0d4;
          padding: 10px 15px;
          background: #fff;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .wp-metabox-header h2 {
          font-size: 14px;
          font-weight: 600;
          margin: 0;
          color: #1d2327;
        }
        .wp-metabox-content {
          padding: 15px;
        }
        .wp-table-container {
          width: 100%;
          overflow-x: auto;
          margin-bottom: 15px;
        }
        .wp-table {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
          border: 1px solid #ccd0d4;
          text-align: left;
        }
        .wp-table th {
          padding: 10px 12px;
          font-size: 13px;
          font-weight: 600;
          color: #2c3338;
          border-bottom: 1px solid #ccd0d4;
          background: #f6f7f7;
        }
        .wp-table td {
          padding: 10px 12px;
          font-size: 13px;
          color: #2c3338;
          border-bottom: 1px solid #ccd0d4;
        }
        .wp-table tr:nth-child(even) td {
          background: #f6f7f7;
        }
        .wp-table tr:hover td {
          background: #f0f6fc;
        }
        .wp-notice {
          background: #fff;
          border: 1px solid #ccd0d4;
          border-left-width: 4px;
          box-shadow: 0 1px 1px rgba(0,0,0,.04);
          margin: 5px 0 15px;
          padding: 8px 12px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .wp-notice-success { border-left-color: #00a32a; }
        .wp-notice-warning { border-left-color: #dba617; }
        .wp-notice-error { border-left-color: #d63638; }
        .wp-notice-info { border-left-color: #72aee6; }
        
        .wp-input {
          background-color: #fff;
          border: 1px solid #8c8f94;
          border-radius: 3px;
          color: #2c3338;
          font-size: 13px;
          height: 30px;
          padding: 0 8px;
          width: 100%;
        }
        .wp-input:focus {
          border-color: #2271b1;
          box-shadow: 0 0 0 1px #2271b1;
          outline: none;
        }
        .wp-select {
          background-color: #fff;
          border: 1px solid #8c8f94;
          border-radius: 3px;
          color: #2c3338;
          font-size: 13px;
          height: 30px;
          padding: 0 24px 0 8px;
          background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3Cpath fill='%232c3338' d='M2 0L0 2h4zm0 5L0 3h4z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
          background-size: 8px 10px;
          appearance: none;
          min-width: 120px;
        }
        .wp-select:focus {
          border-color: #2271b1;
          outline: none;
        }
        .wp-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        .wp-badge {
          display: inline-block;
          padding: 3px 6px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 2px;
          line-height: 1;
        }
        .wp-badge-success { background: #d2f4ea; color: #0f5132; border: 1px solid #badbcc; }
        .wp-badge-warning { background: #fff3cd; color: #664d03; border: 1px solid #ffecb5; }
        .wp-badge-error { background: #f8d7da; color: #842029; border: 1px solid #f5c2c7; }
        .wp-badge-info { background: #cff4fc; color: #055160; border: 1px solid #b6effb; }

        /* Mockup Users Table Styling */
        .wp-user-table-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 15px;
          flex-wrap: wrap;
          background: #fff;
          padding: 12px 16px;
          border: 1px solid #ccd0d4;
          border-radius: 4px;
          box-shadow: 0 1px 1px rgba(0,0,0,.04);
        }
        .wp-user-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 250px;
        }
        .wp-user-search-input {
          background-color: #fcfcfd;
          border: 1px solid #cbd5e1;
          border-radius: 9999px;
          color: #2c3338;
          font-size: 13px;
          height: 36px;
          padding: 0 16px 0 36px;
          width: 100%;
          outline: none;
          transition: all 0.15s ease-in-out;
        }
        .wp-user-search-input:focus {
          border-color: #6366F1;
          background-color: #fff;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
        }
        .wp-user-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }
        .wp-user-filters-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .wp-user-date-input-group {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #64748b;
        }
        .wp-user-date-field {
          background: #fff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 12px;
          color: #334155;
          height: 32px;
          outline: none;
        }
        .wp-user-filter-tabs {
          display: flex;
          background: #f1f5f9;
          padding: 3px;
          border-radius: 8px;
          gap: 2px;
        }
        .wp-user-filter-tab-btn {
          border: none;
          background: none;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .wp-user-filter-tab-btn:hover {
          color: #0f172a;
        }
        .wp-user-filter-tab-btn.active {
          background: #fff;
          color: #0f172a;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .wp-users-table-card {
          background: #fff;
          border: 1px solid #ccd0d4;
          border-radius: 4px;
          box-shadow: 0 1px 1px rgba(0,0,0,.04);
          overflow: hidden;
        }
        .wp-user-table-new {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .wp-user-table-new th {
          padding: 14px 16px;
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          color: #a0aec0;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #edf2f7;
          background: #fafafa;
        }
        .wp-user-table-new td {
          padding: 16px 16px;
          font-size: 13px;
          color: #2d3748;
          border-bottom: 1px solid #edf2f7;
          vertical-align: middle;
        }
        .wp-user-table-new tr:hover td {
          background: #f8fafc;
        }
        .wp-user-member-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .wp-user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #EEF2FF;
          color: #6366F1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 13px;
          flex-shrink: 0;
        }
        .wp-user-member-name {
          font-size: 14px;
          font-weight: 700;
          color: #1a202c;
          margin: 0;
        }
        .wp-user-member-username {
          font-size: 12px;
          color: #a0aec0;
          margin: 2px 0 0 0;
          font-weight: normal;
        }
        .wp-user-contact-email {
          font-size: 13px;
          color: #4a5568;
          word-break: break-all;
        }
        .wp-user-contact-phone {
          font-size: 12px;
          color: #a0aec0;
          margin: 2px 0 0 0;
        }
        .wp-user-status-deposited {
          background: #EEF2FF;
          color: #4F46E5;
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 11px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border: 1px solid #E0E7FF;
          text-transform: uppercase;
        }
        .wp-user-status-standard {
          color: #a0aec0;
          font-size: 11px;
          font-weight: bold;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .wp-user-wallet-blue {
          background: #E0F2FE;
          color: #0369A1;
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 11px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border: 1px solid #BAE6FD;
          text-transform: uppercase;
        }
        .wp-user-wallet-none {
          background: #F1F5F9;
          color: #64748B;
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 11px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border: 1px solid #E2E8F0;
          text-transform: uppercase;
        }
        .wp-user-action-btn-circle {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #94A3B8;
          cursor: pointer;
          transition: all 0.15s;
          padding: 0;
        }
        .wp-user-action-btn-circle:hover {
          background: #e2e8f0;
          color: #475569;
        }
        .wp-user-action-adjust-pill {
          background: #EEF2FF;
          color: #6366F1;
          border: 1px solid #E0E7FF;
          padding: 5px 10px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 11px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .wp-user-action-adjust-pill:hover {
          background: #e0e7ff;
        }
        .wp-user-action-verify-pill {
          background: #F8FAFC;
          color: #94A3B8;
          border: 1px solid #E2E8F0;
          padding: 5px 10px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 11px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .wp-user-action-verify-pill:hover {
          background: #f1f5f9;
        }
        .wp-user-action-verify-pill.active {
          background: #ECFDF5;
          color: #10B981;
          border-color: #D1FAE5;
        }
        .wp-user-action-restrict-pill {
          background: #FEF2F2;
          color: #EF4444;
          border: 1px solid #FEE2E2;
          padding: 5px 10px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 11px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .wp-user-action-restrict-pill:hover {
          background: #fee2e2;
        }
        .wp-user-action-restrict-pill.active {
          background: #EF4444;
          color: #fff;
          border-color: #EF4444;
        }
      `}</style>

      {/* WP Admin Left Sidebar */}
      <div className="wp-sidebar">
        <button className={`wp-sidebar-item ${adminTab === 'overview' ? 'active' : ''}`} onClick={() => setAdminTab('overview')}>
          <LayoutDashboard size={16} /> Overview
        </button>
        <button className={`wp-sidebar-item ${adminTab === 'stats' ? 'active' : ''}`} onClick={() => setAdminTab('stats')}>
          <BarChart3 size={16} /> Platform Stats
        </button>
        <button className={`wp-sidebar-item ${adminTab === 'users' ? 'active' : ''}`} onClick={() => setAdminTab('users')}>
          <Users size={16} /> Users
        </button>
        <button className={`wp-sidebar-item ${adminTab === 'transactions' ? 'active' : ''}`} onClick={() => setAdminTab('transactions')}>
          <List size={16} /> Transactions
        </button>
        <button className={`wp-sidebar-item ${adminTab === 'otp_orders' ? 'active' : ''}`} onClick={() => setAdminTab('otp_orders')}>
          <FileText size={16} /> OTP Orders
        </button>
        <button className={`wp-sidebar-item ${adminTab === 'rates' ? 'active' : ''}`} onClick={() => setAdminTab('rates')}>
          <Settings size={16} /> Rates & Config
        </button>
        <button className={`wp-sidebar-item ${adminTab === 'profile' ? 'active' : ''}`} onClick={() => setAdminTab('profile')}>
          <ShieldCheck size={16} /> Profile
        </button>
        <button className={`wp-sidebar-item ${adminTab === 'tickets' ? 'active' : ''}`} onClick={() => setAdminTab('tickets')}>
          <MessageSquare size={16} /> Support Tickets
        </button>
      </div>

      {/* WP Main Content Work Area */}
      <div className="wp-content">
        
        {/* OVERVIEW TAB */}
        {adminTab === 'overview' && (
          <div>
            {renderTabHeader('Admin Executive Overview')}
            
            {/* 1. Main KPI Metrics Grid */}
            <div className="wp-card-grid" style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(210px, 1fr))', gap: '15px' }}>
              <div className="wp-metabox" style={{ marginBottom: 0, borderLeft: '4px solid #00a32a' }}>
                <div className="wp-metabox-header">
                  <h2>System Cash Pool</h2>
                  <Wallet size={16} style={{ color: '#00a32a' }} />
                </div>
                <div className="wp-metabox-content">
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#00a32a' }}>{formatCost(totalClientCash)}</div>
                  <div style={{ fontSize: '11px', color: '#646970', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Client Liabilities</span>
                    <span style={{ fontWeight: '600' }}>Avg {formatCost(totalClientCash / Math.max(1, liveUserCount))}</span>
                  </div>
                </div>
              </div>

              <div className="wp-metabox" style={{ marginBottom: 0, borderLeft: '4px solid #00b4d8' }}>
                <div className="wp-metabox-header">
                  <h2>Total Real Deposits</h2>
                  <CreditCard size={16} style={{ color: '#00b4d8' }} />
                </div>
                <div className="wp-metabox-content">
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#00b4d8' }}>{formatCost(totalDepositedReal)}</div>
                  <div style={{ fontSize: '11px', color: '#646970', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Inflow Volume</span>
                    <span style={{ fontWeight: '600' }}>{liveDepositCount} top-ups</span>
                  </div>
                </div>
              </div>

              <div className="wp-metabox" style={{ marginBottom: 0, borderLeft: '4px solid #2271b1' }}>
                <div className="wp-metabox-header">
                  <h2>Est. Net Profit</h2>
                  <TrendingUp size={16} style={{ color: '#2271b1' }} />
                </div>
                <div className="wp-metabox-content">
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#2271b1' }}>{formatCost(estimatedProfit)}</div>
                  <div style={{ fontSize: '11px', color: '#646970', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Service Markups</span>
                    <span style={{ fontWeight: '600', color: '#00a32a' }}>+{((estimatedProfit / Math.max(1, totalDepositedReal)) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="wp-metabox" style={{ marginBottom: 0, borderLeft: '4px solid #1d2327' }}>
                <div className="wp-metabox-header">
                  <h2>Live DB Clients</h2>
                  <Users size={16} style={{ color: '#1d2327' }} />
                </div>
                <div className="wp-metabox-content">
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#1d2327' }}>{liveUserCount} <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#646970' }}>Users</span></div>
                  <div style={{ fontSize: '11px', color: '#646970', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Active Profiles</span>
                    <span style={{ fontWeight: '600', color: '#2271b1' }}>{verifiedUserIds.length} Verified</span>
                  </div>
                </div>
              </div>

              <div className="wp-metabox" style={{ marginBottom: 0, borderLeft: '4px solid #7952cc' }}>
                <div className="wp-metabox-header">
                  <h2>Audit Ledger Events</h2>
                  <List size={16} style={{ color: '#7952cc' }} />
                </div>
                <div className="wp-metabox-content">
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#7952cc' }}>{totalLedgerTransactions} <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#646970' }}>Logs</span></div>
                  <div style={{ fontSize: '11px', color: '#646970', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{livePurchaseCount} Purchases</span>
                    <span style={{ fontWeight: '600' }}>{dbOtpOrders.length} OTP orders</span>
                  </div>
                </div>
              </div>

              <div className="wp-metabox" style={{ marginBottom: 0, borderLeft: `4px solid ${dbTickets.filter(t => t.status === 'OPEN').length > 0 ? '#d63638' : '#00a32a'}` }}>
                <div className="wp-metabox-header">
                  <h2>Support Desk</h2>
                  <MessageSquare size={16} style={{ color: dbTickets.filter(t => t.status === 'OPEN').length > 0 ? '#d63638' : '#00a32a' }} />
                </div>
                <div className="wp-metabox-content">
                  <div style={{ fontSize: '24px', fontWeight: '800', color: dbTickets.filter(t => t.status === 'OPEN').length > 0 ? '#d63638' : '#00a32a' }}>
                    {dbTickets.filter(t => t.status === 'OPEN').length} <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#646970' }}>Open</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#646970', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{dbTickets.length} Total Tickets</span>
                    <span style={{ fontWeight: '600', color: dbTickets.filter(t => t.status === 'OPEN').length > 0 ? '#d63638' : '#00a32a' }}>
                      {dbTickets.filter(t => t.status === 'OPEN').length > 0 ? 'Needs Action' : 'All Clear'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Admin Quick Launchpad */}
            <div className="wp-metabox" style={{ marginTop: '20px', background: '#fff' }}>
              <div className="wp-metabox-header">
                <h2>Quick Admin Launchpad</h2>
                <span style={{ fontSize: '11px', color: '#646970' }}>1-Click Operations</span>
              </div>
              <div className="wp-metabox-content" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', padding: '15px' }}>
                <button
                  type="button"
                  onClick={() => setAdminTab('users')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px 10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: '#1e293b',
                    fontSize: '12px',
                    fontWeight: '600',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#2271b1'; e.currentTarget.style.background = '#f0f6fc'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                >
                  <Users size={20} style={{ color: '#2271b1' }} />
                  <span>Manage Users</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTab('sms')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px 10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: '#1e293b',
                    fontSize: '12px',
                    fontWeight: '600',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#00a32a'; e.currentTarget.style.background = '#f0fdf4'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                >
                  <Send size={20} style={{ color: '#00a32a' }} />
                  <span>SMS Simulator</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTab('pricing')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px 10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: '#1e293b',
                    fontSize: '12px',
                    fontWeight: '600',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#7952cc'; e.currentTarget.style.background = '#faf5ff'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                >
                  <DollarSign size={20} style={{ color: '#7952cc' }} />
                  <span>Rates & Markups</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTab('transactions')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px 10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: '#1e293b',
                    fontSize: '12px',
                    fontWeight: '600',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.background = '#f0f9ff'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                >
                  <List size={20} style={{ color: '#0284c7' }} />
                  <span>Audit Ledger</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTab('otplogs')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px 10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: '#1e293b',
                    fontSize: '12px',
                    fontWeight: '600',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.background = '#fffbeb'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                >
                  <Key size={20} style={{ color: '#f59e0b' }} />
                  <span>OTP Orders</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTab('tickets')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px 10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: '#1e293b',
                    fontSize: '12px',
                    fontWeight: '600',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#d63638'; e.currentTarget.style.background = '#fef2f2'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                >
                  <MessageSquare size={20} style={{ color: '#d63638' }} />
                  <span>Support Desk</span>
                </button>
              </div>
            </div>

            {/* 3. Real-time Live Operations Feed (Two Columns) */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginTop: '20px' }}>
              
              {/* Left Column: Recent Database Transactions */}
              <div className="wp-metabox" style={{ marginBottom: 0 }}>
                <div className="wp-metabox-header">
                  <h2>Recent Audit Transactions</h2>
                  <button 
                    type="button" 
                    className="wp-button-secondary" 
                    style={{ height: '26px', fontSize: '11px', padding: '0 8px' }}
                    onClick={() => setAdminTab('transactions')}
                  >
                    View All ({allTransactions.length}) <ArrowRight size={12} style={{ marginLeft: '4px' }} />
                  </button>
                </div>
                <div className="wp-metabox-content" style={{ padding: '10px 15px' }}>
                  {allTransactions.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                      No recent transaction events recorded.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {allTransactions.slice(0, 5).map((tx, idx) => {
                        const isDeposit = tx.type === 'Deposit';
                        return (
                          <div 
                            key={tx.id || idx} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              padding: '8px 10px',
                              background: '#f9fafb',
                              border: '1px solid #f1f5f9',
                              borderRadius: '6px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: isDeposit ? 'rgba(0, 163, 42, 0.1)' : 'rgba(34, 113, 177, 0.1)',
                                color: isDeposit ? '#00a32a' : '#2271b1'
                              }}>
                                {isDeposit ? <ArrowUpRight size={16} /> : <ShoppingBag size={14} />}
                              </div>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                                  {tx.user_name || tx.method || 'System Event'}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                  {tx.date || new Date(tx.created_at).toLocaleString()} • {tx.method || tx.type}
                                </div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '13px', fontWeight: '700', color: isDeposit ? '#00a32a' : '#1e293b' }}>
                                {isDeposit ? '+' : '-'}{formatCost(tx.amountNgn || tx.amount || 0)}
                              </div>
                              <span style={{
                                fontSize: '10px',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontWeight: '600',
                                background: tx.status === 'SUCCESS' ? 'rgba(0, 163, 42, 0.1)' : '#fef2f2',
                                color: tx.status === 'SUCCESS' ? '#00a32a' : '#dc2626'
                              }}>
                                {tx.status || 'SUCCESS'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Support Tickets & Gateway Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Support Inquiries Preview */}
                <div className="wp-metabox" style={{ marginBottom: 0 }}>
                  <div className="wp-metabox-header">
                    <h2>Active Support Inquiries</h2>
                    <button 
                      type="button" 
                      className="wp-button-secondary" 
                      style={{ height: '26px', fontSize: '11px', padding: '0 8px' }}
                      onClick={() => setAdminTab('tickets')}
                    >
                      All Tickets ({dbTickets.length}) <ArrowRight size={12} style={{ marginLeft: '4px' }} />
                    </button>
                  </div>
                  <div className="wp-metabox-content" style={{ padding: '10px 15px' }}>
                    {dbTickets.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                        No support tickets filed yet. Support desk is clear!
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {dbTickets.slice(0, 4).map((ticket) => {
                          const isOpen = ticket.status === 'OPEN';
                          const isResolved = ticket.status === 'RESOLVED';
                          return (
                            <div 
                              key={ticket.id} 
                              style={{ 
                                padding: '10px', 
                                background: '#f9fafb', 
                                border: '1px solid #f1f5f9', 
                                borderRadius: '6px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div style={{ flex: 1, minWidth: 0, paddingRight: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                  <span style={{
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    background: isOpen ? '#fee2e2' : isResolved ? '#dcfce7' : '#fef3c7',
                                    color: isOpen ? '#b91c1c' : isResolved ? '#15803d' : '#b45309'
                                  }}>
                                    {ticket.status || 'OPEN'}
                                  </span>
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>{ticket.category || 'General'}</span>
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {ticket.subject || ticket.message || 'Support Request'}
                                </div>
                                <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                                  From: {ticket.full_name || ticket.phone || 'Customer'} • {new Date(ticket.created_at).toLocaleDateString()}
                                </div>
                              </div>

                              <button
                                type="button"
                                className="wp-button-secondary"
                                style={{ height: '26px', fontSize: '11px', padding: '0 8px', flexShrink: 0 }}
                                onClick={() => setAdminTab('tickets')}
                              >
                                Review
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Gateway & Infrastructure Health Matrix */}
                <div className="wp-metabox" style={{ marginBottom: 0 }}>
                  <div className="wp-metabox-header">
                    <h2>Infrastructure & Gateway Matrix</h2>
                    <span style={{ fontSize: '11px', color: '#00a32a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00a32a', display: 'inline-block' }}></span>
                      All Systems Operational
                    </span>
                  </div>
                  <div className="wp-metabox-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '12px 15px' }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>PostgreSQL Database</div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#00a32a', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Check size={14} /> Supabase Online
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Payment Webhooks</div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#00a32a', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Check size={14} /> PocketFi Active
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>SMS OTP Gateway</div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#00a32a', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Check size={14} /> Multi-Provider Online
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>SMM Reseller Gateway</div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#00a32a', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Check size={14} /> Realtime Connected
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* 4. Service Breakdown & Top VIP Clients */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginTop: '20px' }}>
              
              {/* Category Purchase Volume breakdown */}
              <div className="wp-metabox" style={{ marginBottom: 0 }}>
                <div className="wp-metabox-header">
                  <h2>Service Revenue Distribution</h2>
                  <span style={{ fontSize: '11px', color: '#646970' }}>By Category Share</span>
                </div>
                <div className="wp-metabox-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '15px' }}>
                  {(() => {
                    const totalVolume = Math.max(1, categoryStats.otp.volume + categoryStats.esim.volume + categoryStats.smm.volume + categoryStats.subs.volume + categoryStats.other.volume);
                    const renderCategoryRow = (title, stats, color) => {
                      const percent = ((stats.volume / totalVolume) * 100).toFixed(1);
                      return (
                        <div key={title}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{title} <span style={{ color: '#646970', fontWeight: '400', fontSize: '11px' }}>({stats.count} orders)</span></span>
                            <span style={{ fontWeight: 'bold' }}>{formatCost(stats.volume)} <span style={{ color: '#8c8f94', fontWeight: '400', fontSize: '11px' }}>({percent}%)</span></span>
                          </div>
                          <div style={{ height: '8px', background: '#f0f0f1', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.4s ease' }}></div>
                          </div>
                        </div>
                      );
                    };
                    return (
                      <>
                        {renderCategoryRow("SMS / OTP Verifications", categoryStats.otp, "#2271b1")}
                        {renderCategoryRow("eSIM Travel Packages", categoryStats.esim, "#00b4d8")}
                        {renderCategoryRow("SMM Reseller Boost Tasks", categoryStats.smm, "#7952cc")}
                        {renderCategoryRow("Account Subscriptions", categoryStats.subs, "#1d2327")}
                        {renderCategoryRow("Other Services", categoryStats.other, "#a7aaad")}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* VIP Customer Rankings */}
              <div className="wp-metabox" style={{ marginBottom: 0 }}>
                <div className="wp-metabox-header">
                  <h2>Top Client Balances (VIPs)</h2>
                  <button 
                    type="button" 
                    className="wp-button-secondary" 
                    style={{ height: '26px', fontSize: '11px', padding: '0 8px' }}
                    onClick={() => setAdminTab('users')}
                  >
                    View Users ({allUsers.length}) <ArrowRight size={12} style={{ marginLeft: '4px' }} />
                  </button>
                </div>
                <div className="wp-metabox-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 15px' }}>
                  {[...allUsers]
                    .sort((a, b) => b.wallet_balance - a.wallet_balance)
                    .slice(0, 5)
                    .map((cust, idx) => {
                      const cleanName = cust.full_name.replace(/\([^)]*\)/g, '').trim();
                      const initials = getInitials(cust.full_name);
                      return (
                        <div 
                          key={cust.id} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            padding: '8px 10px',
                            background: '#f9fafb',
                            border: '1px solid #f1f5f9',
                            borderRadius: '6px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="wp-user-avatar" style={{ width: '28px', height: '28px', fontSize: '11px' }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1d2327' }}>{cleanName}</div>
                              <div style={{ fontSize: '11px', color: '#646970' }}>{cust.email || cust.phone}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: '700', color: '#2271b1', fontSize: '13px' }}>{formatCost(cust.wallet_balance)}</span>
                            <button
                              type="button"
                              className="wp-button-secondary"
                              style={{ height: '24px', fontSize: '10px', padding: '0 6px' }}
                              onClick={() => handleOpenEditModal(cust)}
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* STATS TAB */}
        {adminTab === 'stats' && (
          <div>
            {renderTabHeader('Platform Stats')}
            
            <div className="wp-card-grid">
              {/* Financial Performance */}
              <div className="wp-metabox" style={{ gridColumn: 'span 2' }}>
                <div className="wp-metabox-header">
                  <h2>Financial Performance Summary</h2>
                </div>
                <div className="wp-metabox-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ background: '#f6f7f7', border: '1px solid #ccd0d4', padding: '15px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '12px', color: '#646970', textTransform: 'uppercase', fontWeight: '600' }}>Total Cash Deposited</div>
                    <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#00a32a', marginTop: '6px' }}>{formatCost(totalDepositedReal)}</div>
                    <div style={{ fontSize: '11px', color: '#8c8f94', marginTop: '4px' }}>Cumulative customer top-ups</div>
                  </div>
                  <div style={{ background: '#f6f7f7', border: '1px solid #ccd0d4', padding: '15px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '12px', color: '#646970', textTransform: 'uppercase', fontWeight: '600' }}>Platform Net Profits</div>
                    <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#2271b1', marginTop: '6px' }}>{formatCost(estimatedProfit)}</div>
                    <div style={{ fontSize: '11px', color: '#8c8f94', marginTop: '4px' }}>Calculated service markups</div>
                  </div>
                  <div style={{ background: '#f6f7f7', border: '1px solid #ccd0d4', padding: '15px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '12px', color: '#646970', textTransform: 'uppercase', fontWeight: '600' }}>Wallet Liabilities</div>
                    <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#d63638', marginTop: '6px' }}>{formatCost(totalClientCash)}</div>
                    <div style={{ fontSize: '11px', color: '#8c8f94', marginTop: '4px' }}>Sum of outstanding client balances</div>
                  </div>
                  <div style={{ background: '#f6f7f7', border: '1px solid #ccd0d4', padding: '15px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '12px', color: '#646970', textTransform: 'uppercase', fontWeight: '600' }}>Average Client Wallet</div>
                    <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#1d2327', marginTop: '6px' }}>{formatCost(totalClientCash / Math.max(1, liveUserCount))}</div>
                    <div style={{ fontSize: '11px', color: '#8c8f94', marginTop: '4px' }}>Per registered database user</div>
                  </div>
                </div>
              </div>

              {/* Transaction Volumes */}
              <div className="wp-metabox">
                <div className="wp-metabox-header">
                  <h2>System Event Activity</h2>
                </div>
                <div className="wp-metabox-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f1', paddingBottom: '8px' }}>
                    <span style={{ color: '#646970' }}>Total Audit Log Events</span>
                    <span style={{ fontWeight: 'bold' }}>{totalLedgerTransactions} txs</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f1', paddingBottom: '8px' }}>
                    <span style={{ color: '#646970' }}>Successful Deposits</span>
                    <span style={{ fontWeight: 'bold', color: '#00a32a' }}>{liveDepositCount} deposits</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f1', paddingBottom: '8px' }}>
                    <span style={{ color: '#646970' }}>Purchase Logs</span>
                    <span style={{ fontWeight: 'bold', color: '#2271b1' }}>{livePurchaseCount} purchases</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                    <span style={{ color: '#646970' }}>Conversion Rate</span>
                    <span style={{ fontWeight: 'bold' }}>{((livePurchaseCount / Math.max(1, totalLedgerTransactions)) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="wp-card-grid" style={{ marginTop: '20px' }}>
              {/* Category Purchase Volume breakdown */}
              <div className="wp-metabox" style={{ gridColumn: 'span 2' }}>
                <div className="wp-metabox-header">
                  <h2>Purchase Share by Service Category</h2>
                </div>
                <div className="wp-metabox-content" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {(() => {
                    const totalVolume = Math.max(1, categoryStats.otp.volume + categoryStats.esim.volume + categoryStats.smm.volume + categoryStats.subs.volume + categoryStats.other.volume);
                    const renderCategoryRow = (title, stats, color) => {
                      const percent = ((stats.volume / totalVolume) * 100).toFixed(1);
                      return (
                        <div key={title}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                            <span style={{ fontWeight: '600' }}>{title} <span style={{ color: '#646970', fontWeight: '400', fontSize: '12px' }}>({stats.count} purchases)</span></span>
                            <span style={{ fontWeight: 'bold' }}>{formatCost(stats.volume)} <span style={{ color: '#8c8f94', fontWeight: '400', fontSize: '11px' }}>({percent}%)</span></span>
                          </div>
                          <div style={{ height: '8px', background: '#f0f0f1', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: '4px' }}></div>
                          </div>
                        </div>
                      );
                    };
                    return (
                      <>
                        {renderCategoryRow("SMS / OTP Verifications", categoryStats.otp, "#2271b1")}
                        {renderCategoryRow("eSIM Travel Packages", categoryStats.esim, "#72aee6")}
                        {renderCategoryRow("SMM Reseller Social Tasks", categoryStats.smm, "#6366F1")}
                        {renderCategoryRow("Premium Account Subscriptions", categoryStats.subs, "#1d2327")}
                        {renderCategoryRow("Other Services", categoryStats.other, "#a7aaad")}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Top Customers (Highest Balances) */}
              <div className="wp-metabox">
                <div className="wp-metabox-header">
                  <h2>Top Balances (VIP Customers)</h2>
                </div>
                <div className="wp-metabox-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[...allUsers]
                    .sort((a, b) => b.wallet_balance - a.wallet_balance)
                    .slice(0, 5)
                    .map((cust, idx) => {
                      const cleanName = cust.full_name.replace(/\([^)]*\)/g, '').trim();
                      const initials = getInitials(cust.full_name);
                      return (
                        <div key={cust.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: idx < 4 ? '1px solid #f0f0f1' : 'none', paddingBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="wp-user-avatar" style={{ width: '28px', height: '28px', fontSize: '11px' }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1d2327' }}>{cleanName}</div>
                              <div style={{ fontSize: '11px', color: '#646970' }}>{cust.email}</div>
                            </div>
                          </div>
                          <span style={{ fontWeight: 'bold', color: '#2271b1', fontSize: '13px' }}>{formatCost(cust.wallet_balance)}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="wp-card-grid" style={{ marginTop: '20px' }}>
              {/* Top OTP Servers Performance */}
              <div className="wp-metabox" style={{ gridColumn: 'span 2' }}>
                <div className="wp-metabox-header">
                  <h2>Top OTP Server Performance</h2>
                </div>
                <div className="wp-metabox-content" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {topServers.length === 0 ? (
                    <div style={{ padding: '10px', color: '#64748b', textAlign: 'center' }}>No OTP server transaction data found.</div>
                  ) : topServers.map((srv) => {
                    const pct = srv.total > 0 ? ((srv.completed / srv.total) * 100).toFixed(0) : 0;
                    return (
                      <div key={srv.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                          <span style={{ fontWeight: '600' }}>{srv.name} <span style={{ color: '#646970', fontWeight: '400', fontSize: '12px' }}>({srv.total} total orders)</span></span>
                          <span style={{ fontWeight: 'bold' }}>{pct}% Success <span style={{ color: '#8c8f94', fontWeight: '400', fontSize: '11px' }}>({srv.completed} successful)</span></span>
                        </div>
                        <div style={{ height: '8px', background: '#f0f0f1', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: pct > 80 ? '#00a32a' : pct > 50 ? '#dba617' : '#d63638', borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {adminTab === 'users' && (
          <div>
            {renderTabHeader('Users')}

            {/* Custom search and filter controls matching mockup */}
            <div className="wp-user-table-controls">
              <div className="wp-user-search-wrapper">
                <Search size={16} className="wp-user-search-icon" />
                <input 
                  type="text" 
                  className="wp-user-search-input" 
                  placeholder="Find by id, name, username..." 
                  value={userSearchQuery} 
                  onChange={(e) => setUserSearchQuery(e.target.value)} 
                />
              </div>

              <div className="wp-user-filters-right">
                {/* Visual Start/End Date Pickers */}
                <div className="wp-user-date-input-group">
                  <input type="date" className="wp-user-date-field" defaultValue="2026-07-10" />
                  <span>to</span>
                  <input type="date" className="wp-user-date-field" defaultValue="2026-07-10" />
                </div>

                {/* Filter Tabs Group */}
                <div className="wp-user-filter-tabs">
                  <button 
                    className={`wp-user-filter-tab-btn ${userFilterTab === 'ALL' ? 'active' : ''}`}
                    onClick={() => setUserFilterTab('ALL')}
                  >
                    ALL
                  </button>
                  <button 
                    className={`wp-user-filter-tab-btn ${userFilterTab === 'VERIFIED' ? 'active' : ''}`}
                    onClick={() => setUserFilterTab('VERIFIED')}
                  >
                    VERIFIED
                  </button>
                  <button 
                    className={`wp-user-filter-tab-btn ${userFilterTab === 'BANNED' ? 'active' : ''}`}
                    onClick={() => setUserFilterTab('BANNED')}
                  >
                    BANNED
                  </button>
                </div>

                <button type="button" className="wp-button-secondary" style={{ height: '36px', borderRadius: '8px' }} onClick={() => fetchAdminData(true)} disabled={isLoadingDb}>
                  <RefreshCw size={12} className={isLoadingDb ? 'spin-slow' : ''} style={{ marginRight: '6px' }} /> Refresh
                </button>
              </div>
            </div>

            <div className="wp-users-table-card">
              <div className="wp-table-container" style={{ margin: 0 }}>
                <table className="wp-user-table-new">
                  <thead>
                    <tr>
                      <th style={{ width: '25%' }}>MEMBER</th>
                      <th style={{ width: '25%' }}>CONTACT</th>
                      <th style={{ width: '12%' }}>STATUS</th>
                      <th style={{ width: '15%' }}>VIRTUAL WALLET</th>
                      <th style={{ width: '10%' }}>BALANCE</th>
                      <th style={{ width: '13%', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No users found matching filters.</td>
                      </tr>
                    ) : paginatedUsers.map((u) => {
                      const initials = getInitials(u.full_name);
                      
                      const isVerified = verifiedUserIds.includes(u.id);
                      const isRestricted = restrictedUserIds.includes(u.id);
                      const isDeposited = u.wallet_balance > 0;
                      
                      // Fallback username display
                      const displayUsername = u.username 
                        ? `@${u.username}` 
                        : `@${(u.full_name || '').toLowerCase().replace(/\([^)]*\)/g, '').trim().replace(/\s+/g, '_')}_${u.id.slice(0, 4)}`;

                      return (
                        <tr 
                          key={u.id} 
                          style={{ cursor: 'pointer', transition: 'background 0.15s ease' }} 
                          onClick={() => handleOpenEditModal(u, 'overview')}
                          title="Click to view user history, orders & details"
                        >
                          <td>
                            <div className="wp-user-member-cell">
                              <div className="wp-user-avatar">
                                {initials}
                              </div>
                              <div>
                                <p className="wp-user-member-name">{u.full_name}</p>
                                <p className="wp-user-member-username">{displayUsername}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="wp-user-contact-email">{u.email}</div>
                            <div className="wp-user-contact-phone">{u.phone !== 'N/A' ? u.phone : 'No phone'}</div>
                          </td>
                          <td>
                            {isDeposited ? (
                              <span className="wp-user-status-deposited">
                                <span style={{ width: '6px', height: '6px', backgroundColor: '#6366F1', display: 'inline-block', borderRadius: '1px' }}></span>
                                DEPOSITED
                              </span>
                            ) : (
                              <span className="wp-user-status-standard">STANDARD</span>
                            )}
                          </td>
                          <td>
                            {isDeposited ? (
                              <span className="wp-user-wallet-blue">
                                <span style={{ fontSize: '12px', marginRight: '4px' }}>🏦</span>
                                PocketFi
                              </span>
                            ) : (
                              <span className="wp-user-wallet-none">
                                <span style={{ width: '6px', height: '6px', backgroundColor: '#64748B', display: 'inline-block', borderRadius: '50%' }}></span>
                                NONE
                              </span>
                            )}
                          </td>
                          <td>
                            <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>
                              ₦{u.wallet_balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                              <button 
                                className="wp-user-action-btn-circle" 
                                title="View User History & Details"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditModal(u, 'overview');
                                }}
                              >
                                <Eye size={12} />
                              </button>
                              
                              <button 
                                className="wp-user-action-adjust-pill" 
                                title="Adjust Balance"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditModal(u, 'adjust');
                                }}
                              >
                                <Wallet size={10} />
                                ADJUST
                              </button>
                              
                              <button 
                                className={`wp-user-action-verify-pill ${isVerified ? 'active' : ''}`}
                                title={isVerified ? "Unverify User" : "Verify User"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleVerify(u.id);
                                }}
                              >
                                <UserCheck size={10} />
                                VERIFY
                              </button>
                              
                              <button 
                                className={`wp-user-action-restrict-pill ${isRestricted ? 'active' : ''}`}
                                title={isRestricted ? "Remove restriction" : "Restrict User"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleRestrict(u.id);
                                }}
                              >
                                <Ban size={10} />
                                RESTRICT
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredUsers.length > USERS_PER_PAGE && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '15px' }}>
                <button className="wp-button-secondary" disabled={usersPage === 1} onClick={() => setUsersPage(p => p - 1)}>Prev</button>
                <span style={{ fontSize: '13px', color: '#2c3338' }}>Page {usersPage} of {totalUserPages}</span>
                <button className="wp-button-secondary" disabled={usersPage === totalUserPages} onClick={() => setUsersPage(p => p + 1)}>Next</button>
              </div>
            )}
          </div>
        )}

        {/* USER DETAIL & HISTORY INSPECTOR MODAL (WP STYLE) */}
        {isUserModalOpen && selectedUser && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: isMobile ? '10px' : '20px'
          }} onClick={() => setIsUserModalOpen(false)}>
            <div className="wp-metabox" style={{
              width: '100%',
              maxWidth: '780px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              background: '#fff',
              border: '1px solid #ccd0d4',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,.25)',
              overflow: 'hidden'
            }} onClick={(e) => e.stopPropagation()}>
              
              {/* Modal Header with User Identity */}
              <div style={{ 
                padding: '16px 20px', 
                borderBottom: '1px solid #e2e8f0', 
                background: '#f8fafc',
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="wp-user-avatar" style={{ width: '42px', height: '42px', fontSize: '15px' }}>
                    {getInitials(selectedUser.full_name)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>
                        {selectedUser.full_name}
                      </h2>
                      {verifiedUserIds.includes(selectedUser.id) && (
                        <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                          VERIFIED
                        </span>
                      )}
                      {restrictedUserIds.includes(selectedUser.id) && (
                        <span style={{ fontSize: '10px', background: '#fee2e2', color: '#b91c1c', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                          RESTRICTED
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {selectedUser.email} • {selectedUser.phone !== 'N/A' ? selectedUser.phone : 'No phone'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Current Wallet</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#0284c7' }}>{formatCost(selectedUser.wallet_balance)}</div>
                  </div>
                  <button 
                    onClick={() => setIsUserModalOpen(false)} 
                    style={{ 
                      background: '#e2e8f0', 
                      border: 'none', 
                      borderRadius: '50%', 
                      width: '28px', 
                      height: '28px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer', 
                      fontSize: '16px', 
                      fontWeight: 'bold',
                      color: '#475569'
                    }}
                  >
                    &times;
                  </button>
                </div>
              </div>

              {/* Modal Sub-Navigation Bar */}
              <div style={{ 
                display: 'flex', 
                borderBottom: '1px solid #e2e8f0', 
                background: '#fff',
                overflowX: 'auto',
                padding: '0 10px'
              }}>
                {[
                  ['overview', '👤 Profile & Overview'],
                  ['transactions', `💳 Transactions (${userTransactions.length})`],
                  ['otp', `📱 OTP Orders (${userOtpOrders.length})`],
                  ['tickets', `🎧 Support (${userTickets.length})`],
                  ['adjust', '💰 Wallet Operations']
                ].map(([tabKey, label]) => (
                  <button
                    key={tabKey}
                    type="button"
                    onClick={() => setUserModalTab(tabKey)}
                    style={{
                      padding: '12px 14px',
                      background: 'none',
                      border: 'none',
                      borderBottom: userModalTab === tabKey ? '3px solid #2271b1' : '3px solid transparent',
                      color: userModalTab === tabKey ? '#2271b1' : '#64748b',
                      fontWeight: userModalTab === tabKey ? '700' : '500',
                      fontSize: '13px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Modal Body Container */}
              <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                
                {/* 1. OVERVIEW & PROFILE TAB */}
                {userModalTab === 'overview' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* User Lifetime Metrics Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '10px' }}>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '6px' }}>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Wallet Balance</div>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#0284c7', marginTop: '2px' }}>{formatCost(selectedUser.wallet_balance)}</div>
                      </div>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '6px' }}>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Total Deposited</div>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#00a32a', marginTop: '2px' }}>{formatCost(userLifetimeDeposited)}</div>
                      </div>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '6px' }}>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Total Spent</div>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#d63638', marginTop: '2px' }}>{formatCost(userLifetimeSpent)}</div>
                      </div>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '6px' }}>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>OTP Orders Count</div>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#7952cc', marginTop: '2px' }}>{userOtpOrders.length} orders</div>
                      </div>
                    </div>

                    {/* Account Identity Metadata */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '6px' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#1e293b', fontWeight: '700' }}>Account Identity Details</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                        <div><strong style={{ color: '#475569' }}>User ID:</strong> <code style={{ fontSize: '11px', background: '#e2e8f0', padding: '2px 4px', borderRadius: '3px' }}>{selectedUser.id}</code></div>
                        <div><strong style={{ color: '#475569' }}>Registered:</strong> {new Date(selectedUser.created_at).toLocaleString()}</div>
                        <div><strong style={{ color: '#475569' }}>Email:</strong> {selectedUser.email}</div>
                        <div><strong style={{ color: '#475569' }}>Phone:</strong> {selectedUser.phone}</div>
                      </div>

                      {/* Quick Moderation Toggles */}
                      <div style={{ display: 'flex', gap: '10px', marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                        <button
                          type="button"
                          className={`wp-button-secondary ${verifiedUserIds.includes(selectedUser.id) ? 'active' : ''}`}
                          style={{ fontSize: '12px', height: '28px' }}
                          onClick={() => handleToggleVerify(selectedUser.id)}
                        >
                          <UserCheck size={14} style={{ marginRight: '4px' }} />
                          {verifiedUserIds.includes(selectedUser.id) ? 'Remove Verification' : 'Mark as Verified'}
                        </button>

                        <button
                          type="button"
                          className="wp-button-secondary"
                          style={{ fontSize: '12px', height: '28px', color: restrictedUserIds.includes(selectedUser.id) ? '#15803d' : '#b91c1c' }}
                          onClick={() => handleToggleRestrict(selectedUser.id)}
                        >
                          <Ban size={14} style={{ marginRight: '4px' }} />
                          {restrictedUserIds.includes(selectedUser.id) ? 'Unrestrict Account' : 'Restrict Account'}
                        </button>
                      </div>
                    </div>

                    {/* Edit Profile Form */}
                    <form onSubmit={handleSaveProfileDetails} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h4 style={{ margin: '0', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Edit User Profile</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px', fontWeight: '500' }}>Full Name</label>
                          <input type="text" className="wp-input" value={editFullName} onChange={(e) => setEditFullName(e.target.value)} required />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px', fontWeight: '500' }}>Username</label>
                          <input type="text" className="wp-input" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px', fontWeight: '500' }}>Phone Number</label>
                        <input type="text" className="wp-input" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" id="wp-is-admin-inspect" checked={editIsAdmin} onChange={(e) => setEditIsAdmin(e.target.checked)} style={{ cursor: 'pointer' }} />
                        <label htmlFor="wp-is-admin-inspect" style={{ fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>Administrator Access Privileges</label>
                      </div>
                      {editProfileResult && (
                        <div className={`wp-notice ${editProfileResult.includes('success') ? 'wp-notice-success' : 'wp-notice-error'}`}>
                          <p>{editProfileResult}</p>
                        </div>
                      )}
                      <button type="submit" className="wp-button-primary" style={{ alignSelf: 'flex-start' }}>Save Profile Changes</button>
                    </form>
                  </div>
                )}

                {/* 2. TRANSACTIONS TAB */}
                {userModalTab === 'transactions' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                        Transaction History ({userTransactions.length})
                      </h4>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        Lifetime Deposited: <strong style={{ color: '#00a32a' }}>{formatCost(userLifetimeDeposited)}</strong>
                      </span>
                    </div>

                    {userTransactions.length === 0 ? (
                      <div style={{ padding: '30px', textAlign: 'center', background: '#f8fafc', borderRadius: '6px', color: '#64748b', fontSize: '13px' }}>
                        No transactions recorded for this user yet.
                      </div>
                    ) : (
                      <div className="wp-table-container" style={{ margin: 0 }}>
                        <table className="wp-table" style={{ fontSize: '12px' }}>
                          <thead>
                            <tr>
                              <th>DATE</th>
                              <th>TYPE</th>
                              <th>METHOD / DESC</th>
                              <th>AMOUNT (₦)</th>
                              <th>STATUS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userTransactions.map((tx) => {
                              const isDeposit = tx.type === 'Deposit';
                              return (
                                <tr key={tx.id}>
                                  <td>{tx.date || new Date(tx.created_at).toLocaleString()}</td>
                                  <td>
                                    <span style={{
                                      fontSize: '10px',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      fontWeight: '700',
                                      background: isDeposit ? 'rgba(0, 163, 42, 0.1)' : 'rgba(34, 113, 177, 0.1)',
                                      color: isDeposit ? '#00a32a' : '#2271b1'
                                    }}>
                                      {tx.type}
                                    </span>
                                  </td>
                                  <td>{tx.method}</td>
                                  <td style={{ fontWeight: '700', color: isDeposit ? '#00a32a' : '#1e293b' }}>
                                    {isDeposit ? '+' : '-'}{formatCost(tx.amountNgn || tx.amount || 0)}
                                  </td>
                                  <td>
                                    <span style={{
                                      fontSize: '10px',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      fontWeight: '600',
                                      background: tx.status === 'SUCCESS' ? 'rgba(0, 163, 42, 0.1)' : '#fee2e2',
                                      color: tx.status === 'SUCCESS' ? '#00a32a' : '#dc2626'
                                    }}>
                                      {tx.status || 'SUCCESS'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. OTP ORDERS TAB */}
                {userModalTab === 'otp' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                        OTP Verification Orders ({userOtpOrders.length})
                      </h4>
                    </div>

                    {userOtpOrders.length === 0 ? (
                      <div style={{ padding: '30px', textAlign: 'center', background: '#f8fafc', borderRadius: '6px', color: '#64748b', fontSize: '13px' }}>
                        No OTP verification orders found for this user.
                      </div>
                    ) : (
                      <div className="wp-table-container" style={{ margin: 0 }}>
                        <table className="wp-table" style={{ fontSize: '12px' }}>
                          <thead>
                            <tr>
                              <th>DATE</th>
                              <th>SERVICE</th>
                              <th>PHONE NUMBER</th>
                              <th>PRICE (₦)</th>
                              <th>OTP CODE</th>
                              <th>STATUS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userOtpOrders.map((order) => {
                              const isCompleted = order.status === 'COMPLETED' || order.status === 'SUCCESS';
                              return (
                                <tr key={order.id}>
                                  <td>{new Date(order.created_at).toLocaleString()}</td>
                                  <td><strong>{order.service}</strong> ({order.server || 'Server 2'})</td>
                                  <td><code>{order.phone_number}</code></td>
                                  <td>{formatCost(order.price_ngn)}</td>
                                  <td>
                                    {order.otp_code ? (
                                      <span style={{ fontWeight: '800', background: '#ecfdf5', color: '#059669', padding: '2px 6px', borderRadius: '4px', letterSpacing: '1px' }}>
                                        {order.otp_code}
                                      </span>
                                    ) : (
                                      <span style={{ color: '#94a3b8' }}>Waiting...</span>
                                    )}
                                  </td>
                                  <td>
                                    <span style={{
                                      fontSize: '10px',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      fontWeight: '700',
                                      background: isCompleted ? '#dcfce7' : order.status === 'CANCELLED' ? '#fee2e2' : '#fef3c7',
                                      color: isCompleted ? '#15803d' : order.status === 'CANCELLED' ? '#b91c1c' : '#b45309'
                                    }}>
                                      {order.status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. SUPPORT TICKETS TAB */}
                {userModalTab === 'tickets' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                        Support Desk Tickets ({userTickets.length})
                      </h4>
                    </div>

                    {userTickets.length === 0 ? (
                      <div style={{ padding: '30px', textAlign: 'center', background: '#f8fafc', borderRadius: '6px', color: '#64748b', fontSize: '13px' }}>
                        No support tickets opened by this user.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {userTickets.map((t) => (
                          <div key={t.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: '700',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  background: t.status === 'OPEN' ? '#fee2e2' : t.status === 'RESOLVED' ? '#dcfce7' : '#fef3c7',
                                  color: t.status === 'OPEN' ? '#b91c1c' : t.status === 'RESOLVED' ? '#15803d' : '#b45309'
                                }}>
                                  {t.status}
                                </span>
                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{t.category || 'Support'}</span>
                              </div>
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(t.created_at).toLocaleString()}</span>
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                              {t.subject || 'Inquiry'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#475569', background: '#fff', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                              {t.message}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                              {t.status !== 'RESOLVED' && (
                                <button
                                  type="button"
                                  className="wp-button-secondary"
                                  style={{ height: '24px', fontSize: '11px', padding: '0 8px' }}
                                  onClick={() => handleUpdateTicketStatus(t.id, 'RESOLVED')}
                                >
                                  Mark as Resolved
                                </button>
                              )}
                              {t.status !== 'IN_PROGRESS' && t.status !== 'RESOLVED' && (
                                <button
                                  type="button"
                                  className="wp-button-secondary"
                                  style={{ height: '24px', fontSize: '11px', padding: '0 8px' }}
                                  onClick={() => handleUpdateTicketStatus(t.id, 'IN_PROGRESS')}
                                >
                                  Mark In Progress
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. WALLET OPERATIONS TAB */}
                {userModalTab === 'adjust' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Direct Wallet Balance Adjustment */}
                    <form onSubmit={handleUserBalanceAdjust} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Direct Balance Override / Adjustment</h4>
                      <div>
                        <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px', fontWeight: '500' }}>Operation Type</label>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {[['set', 'Set Exact Balance'], ['add', 'Add Funds (+)'], ['deduct', 'Deduct Funds (-)']].map(([type, label]) => (
                            <button
                              key={type}
                              type="button"
                              className={adjustType === type ? 'wp-button-primary' : 'wp-button-secondary'}
                              style={{ flex: 1, height: '30px', fontSize: '12px' }}
                              onClick={() => setAdjustType(type)}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px', fontWeight: '500' }}>Amount in Naira (₦)</label>
                        <input type="number" className="wp-input" placeholder="Amount (e.g. 5000)" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} required />
                      </div>
                      {adjustResult && (
                        <div className="wp-notice wp-notice-info">
                          <p>{adjustResult}</p>
                        </div>
                      )}
                      <button type="submit" className="wp-button-primary" style={{ background: '#d63638', borderColor: '#d63638', alignSelf: 'flex-start' }}>
                        Apply Wallet Adjustment
                      </button>
                    </form>

                    {/* Simulate Webhook Deposit */}
                    <form onSubmit={handleSimulateWebhookDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Simulate Gateway Webhook Inflow (PocketFi)</h4>
                      <div>
                        <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px', fontWeight: '500' }}>Simulated Deposit Amount (₦)</label>
                        <input type="number" className="wp-input" value={simDepositAmount} onChange={(e) => setSimDepositAmount(Number(e.target.value))} required />
                      </div>
                      {simDepositSuccess && (
                        <div className="wp-notice wp-notice-success">
                          <p>PocketFi Webhook deposit simulated successfully! Balance updated.</p>
                        </div>
                      )}
                      <button type="submit" className="wp-button-secondary" onClick={() => setSimDepositSuccess(false)} style={{ alignSelf: 'flex-start' }}>
                        Trigger Webhook Deposit
                      </button>
                    </form>

                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {adminTab === 'transactions' && (
          <div>
            {renderTabHeader('Transactions')}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', gap: '10px', flexDirection: isMobile ? 'column' : 'row' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select className="wp-select" value={filterTxType} onChange={(e) => setFilterTxType(e.target.value)}>
                  <option value="ALL">All Types</option>
                  <option value="Deposit">Deposits</option>
                  <option value="Purchase">Purchases</option>
                  <option value="Refund">Refunds</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  className="wp-input" 
                  placeholder="Search transactions..." 
                  style={{ width: '200px' }} 
                  value={searchTx} 
                  onChange={(e) => setSearchTx(e.target.value)} 
                />
              </div>
            </div>

            <div className="wp-table-container">
              <table className="wp-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>User</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filteredTx = allTransactions
                      .filter(tx => filterTxType === 'ALL' || tx.type === filterTxType)
                      .filter(tx => (tx.user_name || '').toLowerCase().includes(searchTx.toLowerCase()) || (tx.id || '').toLowerCase().includes(searchTx.toLowerCase()));
                    
                    const totalTxPages = Math.max(1, Math.ceil(filteredTx.length / TX_PER_PAGE));
                    const paginatedTx = filteredTx.slice((txPage - 1) * TX_PER_PAGE, txPage * TX_PER_PAGE);

                    if (paginatedTx.length === 0) {
                      return (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#646970' }}>No transactions found.</td>
                        </tr>
                      );
                    }

                    return (
                      <>
                        {paginatedTx.map((tx) => (
                          <tr key={tx.id}>
                            <td style={{ fontFamily: 'monospace' }}>{tx.id}</td>
                            <td style={{ fontWeight: '500' }}>{tx.user_name}</td>
                            <td>{tx.date || new Date(tx.created_at).toLocaleString()}</td>
                            <td>
                              <span className={`wp-badge ${
                                tx.type === 'Deposit' ? 'wp-badge-success' : 
                                tx.type === 'Refund' ? 'wp-badge-info' : 'wp-badge-error'
                              }`}>
                                {tx.type}
                              </span>
                            </td>
                            <td>{tx.method}</td>
                            <td style={{ fontWeight: 'bold', color: tx.type === 'Deposit' || tx.type === 'Refund' ? '#00a32a' : '#d63638' }}>
                              {tx.type === 'Deposit' || tx.type === 'Refund' ? '+' : '-'}{formatCost(tx.amountNgn || tx.amount)}
                            </td>
                            <td>
                              <span className="wp-badge wp-badge-success">{tx.status}</span>
                            </td>
                          </tr>
                        ))}
                        {filteredTx.length > TX_PER_PAGE && (
                          <tr>
                            <td colSpan="7">
                              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px 0' }}>
                                <button className="wp-button-secondary" disabled={txPage === 1} onClick={() => setTxPage(p => p - 1)}>Prev</button>
                                <span style={{ fontSize: '13px' }}>Page {txPage} of {totalTxPages}</span>
                                <button className="wp-button-secondary" disabled={txPage === totalTxPages} onClick={() => setTxPage(p => p + 1)}>Next</button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* OTP ORDERS TAB */}
        {adminTab === 'otp_orders' && (
          <div>
            {renderTabHeader('OTP Orders')}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <select className="wp-select" value={filterOtpServer} onChange={(e) => setFilterOtpServer(e.target.value)}>
                  <option value="ALL">All Servers</option>
                  <option value="server2">Server 2</option>
                  <option value="server3">Server 3</option>
                  <option value="server4">Server 4</option>
                </select>

                <select className="wp-select" value={filterOtpStatus} onChange={(e) => setFilterOtpStatus(e.target.value)}>
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>

                <button className="wp-button-secondary" onClick={handleExportOtpOrders}>
                  <Download size={12} /> Export CSV
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  className="wp-input" 
                  placeholder="Search orders..." 
                  style={{ width: '200px' }} 
                  value={searchOtp} 
                  onChange={(e) => setSearchOtp(e.target.value)} 
                />
              </div>
            </div>

            <div className="wp-table-container">
              <table className="wp-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Client / Phone</th>
                    <th>Timestamp</th>
                    <th>Server</th>
                    <th>Platform</th>
                    <th>Number</th>
                    <th>Cost</th>
                    <th>Code</th>
                    <th>SMS Text</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filtered = filteredOtpOrders;
                    const totalPages = Math.max(1, Math.ceil(filtered.length / OTP_PER_PAGE));
                    const paginated = filtered.slice((otpPage - 1) * OTP_PER_PAGE, otpPage * OTP_PER_PAGE);
                    
                    const serverNames = {
                      server1: 'Server 1',
                      server2: 'Server 2',
                      server3: 'Server 3',
                      server4: 'Server 4'
                    };

                    if (paginated.length === 0) {
                      return (
                        <tr>
                          <td colSpan="10" style={{ textAlign: 'center', padding: '20px', color: '#646970' }}>No OTP orders found.</td>
                        </tr>
                      );
                    }

                    return (
                      <>
                        {paginated.map((order) => (
                          <tr key={order.id}>
                            <td style={{ fontFamily: 'monospace' }}>{order.id}</td>
                            <td>
                              <div style={{ fontWeight: '500' }}>{order.profiles?.full_name || 'N/A'}</div>
                              <div style={{ fontSize: '11px', color: '#646970' }}>{order.profiles?.phone || 'N/A'}</div>
                            </td>
                            <td>{new Date(order.created_at).toLocaleString()}</td>
                            <td>{serverNames[order.server] || order.server}</td>
                            <td style={{ fontWeight: '600' }}>{order.service}</td>
                            <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{order.phone_number}</td>
                            <td style={{ fontWeight: 'bold' }}>{formatCost(order.price_ngn)}</td>
                            <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#00a32a', fontSize: '14px' }}>
                              {order.otp_code || '-'}
                            </td>
                            <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={order.sms_text || ''}>
                              {order.sms_text || <span style={{ color: '#8c8f94' }}>No SMS yet</span>}
                            </td>
                            <td>
                              <span className={`wp-badge ${
                                order.status === 'COMPLETED' ? 'wp-badge-success' : 
                                order.status === 'PENDING' ? 'wp-badge-warning' : 'wp-badge-error'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {totalPages > 1 && (
                          <tr>
                            <td colSpan="10">
                              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px 0' }}>
                                <button className="wp-button-secondary" disabled={otpPage === 1} onClick={() => setOtpPage(prev => Math.max(1, prev - 1))}>Prev</button>
                                <span style={{ fontSize: '13px' }}>Page {otpPage} of {totalPages}</span>
                                <button className="wp-button-secondary" disabled={otpPage === totalPages} onClick={() => setOtpPage(prev => Math.min(totalPages, prev + 1))}>Next</button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* RATES & CONFIG TAB */}
        {adminTab === 'rates' && (
          <div>
            {renderTabHeader('Rates & Config')}

            {/* Exchange Rate Meta Box */}
            <div className="wp-metabox">
              <div className="wp-metabox-header">
                <h2>Global Dollar to Naira Exchange Rate</h2>
              </div>
              <div className="wp-metabox-content">
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '15px', maxWidth: '400px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Rate (1 USD = NGN)</label>
                    <input 
                      type="number" 
                      className="wp-input" 
                      value={exchangeRate}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val > 0) setExchangeRate(val);
                      }}
                    />
                  </div>
                  <button 
                    className="wp-button-primary" 
                    onClick={async () => {
                      const res = await adminUpdateSystemConfig('exchange_rate', exchangeRate);
                      if (res.success) alert('Exchange rate updated successfully.');
                      else alert('Failed to update rate: ' + res.msg);
                    }}
                  >
                    Save Rate
                  </button>
                </div>
              </div>
            </div>

            {/* Markups Meta Box */}
            <div className="wp-metabox">
              <div className="wp-metabox-header">
                <h2>Category Profit Markup (%)</h2>
                <button className="wp-button-secondary" style={{ height: '24px', padding: '0 8px', fontSize: '11px' }} onClick={async () => {
                  const res = await adminUpdateSystemConfig('profit_markup', JSON.stringify(profitMarkup));
                  if (res.success) alert('Profit markup updated globally.');
                }}>
                  Save All Markups
                </button>
              </div>
              <div className="wp-metabox-content" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '15px' }}>
                {[
                  ['subs', 'Shared Subscriptions', 'subs'],
                  ['otp', 'SMS Verification', 'otp'],
                  ['esim', 'eSIM Packages', 'esim'],
                  ['smm', 'SMM Booster Tasks', 'smm']
                ].map(([key, label, cat]) => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#646970' }}>{label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input 
                        type="range" 
                        min="5" 
                        max="150" 
                        step="5"
                        value={profitMarkup[cat] || 0}
                        onChange={(e) => updateProfitMarkup(cat, Number(e.target.value))}
                        style={{ flex: 1, accentColor: '#2271b1' }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#2271b1', minWidth: '35px', textAlign: 'right' }}>
                        {profitMarkup[cat]}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Catalog Rate Override Metaboax */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 3fr', gap: '20px' }}>
              <div className="wp-metabox" style={{ height: 'fit-content' }}>
                <div className="wp-metabox-header">
                  <h2>Catalogs</h2>
                </div>
                <div className="wp-metabox-content" style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '5px', overflowX: 'auto', padding: '10px' }}>
                  {[
                    ['subs', 'Subscriptions'],
                    ['otp', 'OTP Services'],
                    ['esim', 'eSIM Regions'],
                    ['smm', 'SMM Booster']
                  ].map(([cat, label]) => (
                    <button
                      key={cat}
                      type="button"
                      className={pricingCategory === cat ? 'wp-button-primary' : 'wp-button-secondary'}
                      style={{ justifyContent: 'flex-start', textAlign: 'left', width: isMobile ? 'auto' : '100%', height: '32px', whiteSpace: 'nowrap' }}
                      onClick={() => setPricingCategory(cat)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="wp-metabox">
                <div className="wp-metabox-header">
                  <h2>Adjust pricing for: {pricingCategory.toUpperCase()}</h2>
                  {savePriceResult && (
                    <span style={{ fontSize: '12px', color: '#00a32a', fontWeight: 'bold' }}>{savePriceResult}</span>
                  )}
                </div>
                <div className="wp-metabox-content" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                  
                  {pricingCategory === 'subs' && (
                    <table className="wp-table">
                      <thead>
                        <tr>
                          <th>Item Name</th>
                          <th>Wholesale Base</th>
                          <th>Override Price (₦)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptions.map((sub) => {
                          const mapKey = `subs-${sub.id}`;
                          const val = pricesList[mapKey] !== undefined ? pricesList[mapKey] : sub.priceNgn;
                          const markupVal = profitMarkup.subs || 0;
                          const baseCost = Math.round(sub.priceNgn / (1 + markupVal / 100));
                          return (
                            <tr key={sub.id}>
                              <td style={{ fontWeight: '500' }}>{sub.name}</td>
                              <td>{formatCost(baseCost)}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <input type="number" className="wp-input" style={{ width: '90px' }} value={val} onChange={(e) => handlePriceChange('subs', sub.id, e.target.value)} />
                                  <button className="wp-button-secondary" style={{ padding: '0 6px', height: '24px' }} onClick={() => handleSavePrice('subs', sub.id)}><Save size={12} /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                  {pricingCategory === 'otp' && (
                    <table className="wp-table">
                      <thead>
                        <tr>
                          <th>Service Name</th>
                          <th>Wholesale Base</th>
                          <th>Override Price (₦)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {otpServices.map((otp) => {
                          const mapKey = `otp-${otp.id}`;
                          const val = pricesList[mapKey] !== undefined ? pricesList[mapKey] : otp.priceNgn;
                          const markupVal = profitMarkup.otp || 0;
                          const baseCost = Math.round(otp.priceNgn / (1 + markupVal / 100));
                          return (
                            <tr key={otp.id}>
                              <td style={{ fontWeight: '500' }}>{otp.name}</td>
                              <td>{formatCost(baseCost)}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <input type="number" className="wp-input" style={{ width: '90px' }} value={val} onChange={(e) => handlePriceChange('otp', otp.id, e.target.value)} />
                                  <button className="wp-button-secondary" style={{ padding: '0 6px', height: '24px' }} onClick={() => handleSavePrice('otp', otp.id)}><Save size={12} /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                  {pricingCategory === 'esim' && (
                    <table className="wp-table">
                      <thead>
                        <tr>
                          <th>Country / Region</th>
                          <th>Wholesale Base</th>
                          <th>Override Price (₦)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {esimPackages.map((pkg) => {
                          const mapKey = `esim-${pkg.id}`;
                          const val = pricesList[mapKey] !== undefined ? pricesList[mapKey] : pkg.priceNgn;
                          const markupVal = profitMarkup.esim || 0;
                          const baseCost = Math.round(pkg.priceNgn / (1 + markupVal / 100));
                          return (
                            <tr key={pkg.id}>
                              <td style={{ fontWeight: '500' }}>{pkg.country} ({pkg.dataGb === 999 ? 'Unlimited' : `${pkg.dataGb}GB`})</td>
                              <td>{formatCost(baseCost)}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <input type="number" className="wp-input" style={{ width: '90px' }} value={val} onChange={(e) => handlePriceChange('esim', pkg.id, e.target.value)} />
                                  <button className="wp-button-secondary" style={{ padding: '0 6px', height: '24px' }} onClick={() => handleSavePrice('esim', pkg.id)}><Save size={12} /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                  {pricingCategory === 'smm' && (
                    <table className="wp-table">
                      <thead>
                        <tr>
                          <th>Task Name</th>
                          <th>Base API Cost</th>
                          <th>Override Price (₦)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {smmServices.map((smm) => {
                          const mapKey = `smm-${smm.id}`;
                          const val = pricesList[mapKey] !== undefined ? pricesList[mapKey] : smm.pricePerThousandNgn;
                          const markupVal = profitMarkup.smm || 0;
                          const baseCost = Math.round(smm.pricePerThousandNgn / (1 + markupVal / 100));
                          return (
                            <tr key={smm.id}>
                              <td style={{ fontWeight: '500', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={smm.name}>{smm.name}</td>
                              <td>{formatCost(baseCost)}/k</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <input type="number" className="wp-input" style={{ width: '90px' }} value={val} onChange={(e) => handlePriceChange('smm', smm.id, e.target.value)} />
                                  <button className="wp-button-secondary" style={{ padding: '0 6px', height: '24px' }} onClick={() => handleSavePrice('smm', smm.id)}><Save size={12} /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                </div>
              </div>
            </div>

          </div>
        )}


        {/* PROFILE TAB */}
        {adminTab === 'profile' && (
          <div>
            {renderTabHeader('Profile')}

            <div className="wp-metabox">
              <div className="wp-metabox-header">
                <h2>Administrator Profile Information</h2>
              </div>
              <div className="wp-metabox-content" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: '#f6f7f7', border: '1px solid #ccd0d4', padding: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#646970' }}>Full Name</div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1d2327', marginTop: '2px' }}>{profile?.full_name || 'Admin'}</div>
                  </div>
                  <div style={{ background: '#f6f7f7', border: '1px solid #ccd0d4', padding: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#646970' }}>Email Address</div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1d2327', marginTop: '2px' }}>{user?.email || 'N/A'}</div>
                  </div>
                  <div style={{ background: '#f6f7f7', border: '1px solid #ccd0d4', padding: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#646970' }}>Registered Phone Number</div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1d2327', marginTop: '2px' }}>{profile?.phone || 'N/A'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: '#f6f7f7', border: '1px solid #ccd0d4', padding: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#646970' }}>Access Level</div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#00a32a', marginTop: '2px' }}>Super Administrator</div>
                  </div>
                  <div style={{ background: '#f6f7f7', border: '1px solid #ccd0d4', padding: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#646970' }}>Personal Wallet Balance</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2271b1', marginTop: '2px' }}>{formatCost(walletBalance)}</div>
                  </div>
                  <div style={{ background: '#f8d7da', border: '1px solid #f5c2c7', padding: '10px', color: '#842029' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '13px' }}>System Support Contact</div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                      Email: Support@discountzar.com<br/>
                      WhatsApp: +234 707 972 2993
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* SUPPORT TICKETS TAB */}
        {adminTab === 'tickets' && (
          <div>
            {renderTabHeader('Support Tickets')}

            <div className="wp-metabox">
              <div className="wp-metabox-header">
                <h2>Submitted Support Inquiries ({dbTickets.length})</h2>
              </div>
              <div className="wp-metabox-content" style={{ padding: 0 }}>
                {dbTickets.length === 0 ? (
                  <div style={{ padding: '20px', color: '#64748b', textAlign: 'center' }}>No support tickets found in the database.</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="wp-table">
                      <thead>
                        <tr>
                          <th style={{ width: '100px' }}>ID</th>
                          <th>Customer</th>
                          <th>Subject</th>
                          <th style={{ width: '150px' }}>Date</th>
                          <th style={{ width: '100px' }}>Status</th>
                          <th style={{ width: '220px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dbTickets.map((ticket) => {
                          const isPending = ticket.status === 'PENDING';
                          const isResolved = ticket.status === 'RESOLVED';
                          
                          return (
                            <React.Fragment key={ticket.id}>
                              <tr>
                                <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{ticket.id}</td>
                                <td>
                                  <div style={{ fontWeight: '600' }}>{ticket.name}</div>
                                  <div style={{ fontSize: '11px', color: '#646970' }}>{ticket.email}</div>
                                </td>
                                <td>
                                  <div style={{ fontWeight: '600', color: '#1d2327' }}>{ticket.subject || 'No Subject'}</div>
                                  <div style={{ fontSize: '12px', color: '#646970', marginTop: '4px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '280px' }}>
                                    {ticket.message}
                                  </div>
                                </td>
                                <td style={{ fontSize: '12px' }}>{new Date(ticket.created_at).toLocaleString()}</td>
                                <td>
                                  <span className={`wp-badge ${isPending ? 'wp-badge-warning' : isResolved ? 'wp-badge-success' : 'wp-badge-error'}`} style={{ color: '#fff' }}>
                                    {ticket.status}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  <div style={{ display: 'inline-flex', gap: '5px' }}>
                                    {isPending ? (
                                      <>
                                        <button 
                                          className="wp-button-primary" 
                                          style={{ background: '#00a32a', borderColor: '#00a32a', fontSize: '11px', padding: '0 8px', height: '24px', borderRadius: '3px' }}
                                          onClick={() => handleUpdateTicketStatus(ticket.id, 'RESOLVED')}
                                          disabled={updatingTicketId === ticket.id}
                                        >
                                          Resolve
                                        </button>
                                        <button 
                                          className="wp-button-secondary" 
                                          style={{ fontSize: '11px', padding: '0 8px', height: '24px', borderRadius: '3px' }}
                                          onClick={() => handleUpdateTicketStatus(ticket.id, 'CLOSED')}
                                          disabled={updatingTicketId === ticket.id}
                                        >
                                          Close
                                        </button>
                                      </>
                                    ) : (
                                      <button 
                                        className="wp-button-secondary" 
                                        style={{ fontSize: '11px', padding: '0 8px', height: '24px', borderRadius: '3px' }}
                                        onClick={() => handleUpdateTicketStatus(ticket.id, 'PENDING')}
                                        disabled={updatingTicketId === ticket.id}
                                      >
                                        Reopen
                                      </button>
                                    )}
                                    <button 
                                      className="wp-button-secondary" 
                                      style={{ color: '#d63638', borderColor: '#d63638', fontSize: '11px', padding: '0 8px', height: '24px', borderRadius: '3px' }}
                                      onClick={() => handleDeleteTicket(ticket.id)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              {/* Message body row */}
                              <tr>
                                <td colSpan="6" style={{ background: '#f6f7f7', padding: '10px 15px', borderBottom: '1px solid #ccd0d4' }}>
                                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#646970', marginBottom: '4px' }}>Ticket Description:</div>
                                  <div style={{ fontSize: '13px', color: '#2c3338', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                                    {ticket.message}
                                  </div>
                                </td>
                              </tr>
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
