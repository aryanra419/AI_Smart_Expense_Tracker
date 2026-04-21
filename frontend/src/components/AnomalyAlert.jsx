import React, { useEffect, useState } from 'react';
import { AlertOctagon, X } from 'lucide-react';

/**
 * AnomalyAlert — slide-in toast when a new anomalous transaction is detected
 * Props:
 *   anomaly: { expense: {...}, anomaly: { label, level, multiplier } } | null
 *   onDismiss: () => void
 */
const AnomalyAlert = ({ anomaly, onDismiss }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (anomaly) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(onDismiss, 400);
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [anomaly]);

    if (!anomaly) return null;

    const { expense, anomaly: info } = anomaly;
    const isHigh = info.level === 'high';

    return (
        <div
            className={`anomaly-toast ${visible ? 'anomaly-toast--visible' : 'anomaly-toast--hidden'}`}
        >
            <div className={`flex gap-3 items-start p-4 rounded-2xl border shadow-2xl max-w-sm
                ${isHigh
                    ? 'bg-red-950/90 border-red-500/40 backdrop-blur-xl'
                    : 'bg-yellow-950/90 border-yellow-500/40 backdrop-blur-xl'
                }`}
            >
                <div className={`shrink-0 p-2 rounded-xl ${isHigh ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
                    <AlertOctagon size={18} className={isHigh ? 'text-red-400' : 'text-yellow-400'} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold mb-0.5 ${isHigh ? 'text-red-300' : 'text-yellow-300'}`}>
                        Anomaly Detected
                    </p>
                    <p className="text-xs text-white/80 font-medium leading-snug">
                        <span className="font-bold">{expense.description}</span> ({expense.category}) — {info.label}
                    </p>
                    <p className="text-[10px] text-white/50 mt-1 uppercase tracking-wider font-bold">
                        {isHigh ? '🔴 High Severity' : '🟡 Medium Severity'}
                    </p>
                </div>
                <button
                    onClick={() => { setVisible(false); setTimeout(onDismiss, 400); }}
                    className="shrink-0 text-white/30 hover:text-white/80 transition-colors"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};

export default AnomalyAlert;
