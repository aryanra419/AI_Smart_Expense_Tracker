import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';

const AlertManager = () => {
    const [permission, setPermission] = useState(Notification.permission);
    const [showGrantToast, setShowGrantToast] = useState(Notification.permission === 'default');

    const requestPermission = async () => {
        const result = await Notification.requestPermission();
        setPermission(result);
        setShowGrantToast(false);
    };

    if (showGrantToast) {
        return (
            <div className="fixed bottom-8 right-8 z-50 animate-bounce-in">
                <div className="glass p-6 border-primary-color/30 flex items-center gap-4 bg-slate-900/80 shadow-2xl">
                    <div className="p-3 bg-primary-color/20 rounded-full text-primary-color">
                        <Bell size={24} className="animate-pulse" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm">Enable Smart Alerts</h4>
                        <p className="text-xs text-muted">Get notified when you cross your budget!</p>
                    </div>
                    <button 
                        onClick={requestPermission}
                        className="btn-primary py-2 px-4 text-xs whitespace-nowrap ml-2"
                    >
                        Allow
                    </button>
                    <button 
                        onClick={() => setShowGrantToast(false)}
                        className="text-muted hover:text-white transition-colors ml-2"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-8 right-8 z-50">
             <div className={`p-3 rounded-full glass border-white/10 ${permission === 'granted' ? 'bg-success-color/10 text-success-color' : 'bg-danger-color/10 text-danger-color'}`}>
                {permission === 'granted' ? <Bell size={20} /> : <BellOff size={20} />}
             </div>
        </div>
    );
};

export default AlertManager;
