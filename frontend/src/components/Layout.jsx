import React, { useState } from 'react';
import { LayoutDashboard, Settings, Wallet, Sparkles, Bell, X, ShieldCheck, BellOff } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';

const Layout = ({ children, activeView, setView }) => {
  const { budget, currentMonthAmount, budgetUsage, formatCurrency } = useExpense();
  const remaining = Math.max(0, budget - currentMonthAmount);
  const usagePct = Math.min(100, budgetUsage || 0);
  const barColor = usagePct > 85 ? '#f43f5e' : usagePct > 60 ? '#f59e0b' : '#10b981';

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Inline notification permission state
  const [notifPerm, setNotifPerm] = useState(Notification.permission);
  const [showAlertBanner, setShowAlertBanner] = useState(Notification.permission === 'default');

  const requestNotifPermission = async () => {
    const result = await Notification.requestPermission();
    setNotifPerm(result);
    setShowAlertBanner(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'flex-start' }}>
      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Wallet size={18} color="white" strokeWidth={2.5} />
          </div>
          <span className="sidebar-logo-title">SmartExp</span>
        </div>

        {/* Nav */}
        <p className="sidebar-section-label">Navigation</p>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button
            onClick={() => setView('dashboard')}
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={16} className="nav-icon" />
            Dashboard
          </button>
          <button
            onClick={() => setView('settings')}
            className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
          >
            <Settings size={16} className="nav-icon" />
            Settings
          </button>
        </nav>

        {/* Budget Widget */}
        <div className="sidebar-widget" style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b' }}>
              Monthly Budget
            </p>
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px',
              background: usagePct > 85 ? 'rgba(244,63,94,0.15)' : usagePct > 60 ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
              color: usagePct > 85 ? '#f43f5e' : usagePct > 60 ? '#f59e0b' : '#10b981',
              border: `1px solid ${usagePct > 85 ? 'rgba(244,63,94,0.25)' : usagePct > 60 ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.25)'}`,
              textTransform: 'uppercase', letterSpacing: '0.06em'
            }}>
              {usagePct.toFixed(0)}%
            </span>
          </div>

          <div style={{ marginBottom: '0.875rem' }}>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {formatCurrency(remaining)}
            </p>
            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
              remaining of {formatCurrency(budget)}
            </p>
          </div>

          <div style={{ height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${usagePct}%`,
              background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
              borderRadius: '99px',
              transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
              boxShadow: `0 0 8px ${barColor}60`
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Spent {formatCurrency(currentMonthAmount)}</span>
            <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Budget {formatCurrency(budget)}</span>
          </div>
        </div>

        {/* Version */}
        <p style={{ fontSize: '0.6rem', color: 'rgba(100,116,139,0.5)', textAlign: 'center', marginTop: '0.75rem', letterSpacing: '0.08em' }}>
          SMARTEXP v2.0 · AI-POWERED
        </p>
      </aside>

      {/* ── Main Content ───────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '2rem 2.5rem', minWidth: 0, overflowX: 'hidden' }}>
        {/* Top Header */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
              {greeting} 👋
            </p>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.035em', color: 'white', lineHeight: 1 }}>
              Financial Pulse
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              Real-time spending intelligence · {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>

            {/* ── Smart Alert Banner — between greeting and AI badge ── */}
            {showAlertBanner && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.4rem 0.6rem 0.4rem 0.75rem',
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.22)',
                borderRadius: '12px',
                animation: 'alertSlideDown 0.4s cubic-bezier(0.16,1,0.3,1)',
              }}>
                <style>{`@keyframes alertSlideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
                <Bell size={13} color="#818cf8" strokeWidth={2.5} />
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                  Enable alerts
                </span>
                <button
                  onClick={requestNotifPermission}
                  style={{
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    color: 'white', border: 'none', borderRadius: '8px',
                    padding: '0.22rem 0.6rem', fontSize: '0.68rem', fontWeight: 700,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  Allow
                </button>
                <button
                  onClick={() => setShowAlertBanner(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: '2px' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Alert status pill (after decision) */}
            {!showAlertBanner && (
              <div
                title={notifPerm === 'granted' ? 'Budget alerts enabled' : 'Notifications off'}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '0.3rem 0.6rem',
                  background: notifPerm === 'granted' ? 'rgba(16,185,129,0.08)' : 'rgba(100,116,139,0.08)',
                  border: `1px solid ${notifPerm === 'granted' ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.15)'}`,
                  borderRadius: '10px',
                }}
              >
                {notifPerm === 'granted'
                  ? <ShieldCheck size={13} color="#34d399" />
                  : <BellOff size={13} color="#64748b" />
                }
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: notifPerm === 'granted' ? '#34d399' : '#64748b' }}>
                  {notifPerm === 'granted' ? 'Alerts On' : 'Alerts Off'}
                </span>
              </div>
            )}

            {/* AI Badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '0.375rem 0.875rem',
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '12px',
            }}>
              <Sparkles size={13} color="#818cf8" />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#818cf8', letterSpacing: '0.04em' }}>AI Active</span>
            </div>

            {/* Avatar */}
            <div style={{
              width: 38, height: 38, borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '0.85rem', color: 'white',
              boxShadow: '0 4px 14px -4px rgba(99,102,241,0.5)'
            }}>
              U
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

export default Layout;
