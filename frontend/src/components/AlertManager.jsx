import React, { useState } from 'react';
import { Bell, BellOff, X, ShieldCheck } from 'lucide-react';

const AlertManager = () => {
    const [permission, setPermission] = useState(Notification.permission);
    const [showGrantToast, setShowGrantToast] = useState(Notification.permission === 'default');

    const requestPermission = async () => {
        const result = await Notification.requestPermission();
        setPermission(result);
        setShowGrantToast(false);
    };

    return (
        <>
            {/* ── Notification Permission Toast — top-right corner ── */}
            {showGrantToast && (
                <div style={{
                    position: 'fixed',
                    top: '1.25rem',
                    right: '1.5rem',
                    zIndex: 400,
                    maxWidth: '340px',
                    width: 'calc(100vw - 3rem)',
                    animation: 'alertSlideDown 0.45s cubic-bezier(0.16,1,0.3,1) forwards',
                }}>
                    <style>{`
                        @keyframes alertSlideDown {
                            from { opacity: 0; transform: translateY(-20px) scale(0.96); }
                            to   { opacity: 1; transform: translateY(0)     scale(1); }
                        }
                    `}</style>
                    <div style={{
                        background: 'rgba(10,16,32,0.97)',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid rgba(99,102,241,0.28)',
                        borderRadius: '18px',
                        padding: '0.875rem 1.125rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.875rem',
                        boxShadow: '0 20px 48px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                    }}>
                        {/* Icon */}
                        <div style={{
                            width: 36, height: 36, flexShrink: 0,
                            background: 'rgba(99,102,241,0.15)',
                            border: '1px solid rgba(99,102,241,0.25)',
                            borderRadius: '11px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Bell size={16} color="#818cf8" strokeWidth={2.5} />
                        </div>

                        {/* Text */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ color: 'white', fontWeight: 700, fontSize: '0.82rem', marginBottom: '2px' }}>
                                Enable Smart Alerts
                            </p>
                            <p style={{ color: '#64748b', fontSize: '0.7rem' }}>
                                Get notified when you cross your budget
                            </p>
                        </div>

                        {/* Allow button */}
                        <button
                            onClick={requestPermission}
                            style={{
                                flexShrink: 0,
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '0.375rem 0.75rem',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                        >
                            Allow
                        </button>

                        {/* Dismiss */}
                        <button
                            onClick={() => setShowGrantToast(false)}
                            style={{
                                flexShrink: 0,
                                width: 22, height: 22,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#64748b', borderRadius: '6px',
                                background: 'none', border: 'none', cursor: 'pointer',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                            onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Bell status pill — top-right after granted/denied ── */}
            {!showGrantToast && (
                <div style={{
                    position: 'fixed',
                    top: '1.25rem',
                    right: '1.5rem',
                    zIndex: 400,
                }}>
                    <div
                        title={permission === 'granted' ? 'Budget alerts enabled' : 'Notifications blocked'}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '0.3rem 0.65rem',
                            borderRadius: '10px',
                            background: permission === 'granted' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.08)',
                            border: `1px solid ${permission === 'granted' ? 'rgba(16,185,129,0.22)' : 'rgba(244,63,94,0.18)'}`,
                            backdropFilter: 'blur(12px)',
                        }}
                    >
                        {permission === 'granted'
                            ? <ShieldCheck size={13} color="#34d399" />
                            : <BellOff size={13} color="#f43f5e" />
                        }
                        <span style={{
                            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.04em',
                            color: permission === 'granted' ? '#34d399' : '#f43f5e',
                        }}>
                            {permission === 'granted' ? 'Alerts On' : 'Alerts Off'}
                        </span>
                    </div>
                </div>
            )}
        </>
    );
};

export default AlertManager;
