import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { TrendingUp, TrendingDown, Clock, Flame, CheckCircle2, AlertTriangle } from 'lucide-react';

const PredictiveCard = () => {
    const { predictionData, formatCurrency, budget } = useExpense();

    if (!predictionData) return null;

    const {
        dailyBurnRate,
        projectedMonthlySpend,
        daysUntilOverspend,
        currentMonthSpent,
        daysElapsed,
        daysInMonth,
        budgetRemainingPercent,
        severity,
        alerts
    } = predictionData;

    const daysLeft = daysInMonth - daysElapsed;

    const severityConfig = {
        safe:     { bg: 'bg-emerald-500/10',  border: 'border-emerald-500/20', icon: CheckCircle2, color: 'text-emerald-400', label: 'On Track'   },
        warning:  { bg: 'bg-yellow-500/10',   border: 'border-yellow-500/20',  icon: AlertTriangle, color: 'text-yellow-400', label: 'Watch Out'  },
        critical: { bg: 'bg-red-500/10',      border: 'border-red-500/20',     icon: Flame,         color: 'text-red-400',    label: 'Critical'   },
        over:     { bg: 'bg-red-500/15',      border: 'border-red-500/30',     icon: Flame,         color: 'text-red-400',    label: 'Over Budget'},
    };

    const config = severityConfig[severity] || severityConfig.safe;
    const StatusIcon = config.icon;

    const projectedBarWidth = Math.min(100, (projectedMonthlySpend / (budget || 1)) * 100);
    const spentBarWidth = Math.min(100, (currentMonthSpent / (budget || 1)) * 100);

    const overBudget = projectedMonthlySpend > budget && budget > 0;

    return (
        <div className="glass glass-panel border-primary-color/20 bg-primary-color/5 h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary-color/20">
                        <TrendingUp className="text-primary-color" size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Predictive Intelligence</h3>
                        <p className="text-xs text-muted">Day {daysElapsed} of {daysInMonth}</p>
                    </div>
                </div>
                <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${config.bg} ${config.border} ${config.color}`}>
                    <StatusIcon size={12} />
                    {config.label}
                </span>
            </div>

            {/* Alert Banner */}
            {alerts.map((alert, i) => (
                <div
                    key={i}
                    className={`mb-5 p-3 rounded-xl text-sm font-medium border ${
                        alert.type === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                        alert.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                        'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}
                >
                    {alert.message}
                </div>
            ))}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Daily Rate</p>
                    <p className="text-lg font-bold text-white">{formatCurrency(dailyBurnRate)}</p>
                    <p className="text-[10px] text-muted">per day</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Projected</p>
                    <p className={`text-lg font-bold ${overBudget ? 'text-red-400' : 'text-white'}`}>
                        {formatCurrency(projectedMonthlySpend)}
                    </p>
                    <p className="text-[10px] text-muted">this month</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock size={10} className="text-muted" />
                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Days Left</p>
                    </div>
                    <p className={`text-lg font-bold ${daysUntilOverspend <= 3 ? 'text-red-400' : daysUntilOverspend <= 7 ? 'text-yellow-400' : 'text-white'}`}>
                        {daysUntilOverspend === Infinity ? '∞' : daysUntilOverspend}
                    </p>
                    <p className="text-[10px] text-muted">to overspend</p>
                </div>
            </div>

            {/* Spend Forecast Bar */}
            <div className="space-y-3">
                <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted">Spent vs Projected vs Budget</span>
                    <span className="text-white">{formatCurrency(budget)} budget</span>
                </div>
                <div className="relative h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    {/* Projected (behind) */}
                    <div
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${overBudget ? 'bg-red-500/40' : 'bg-primary-color/30'}`}
                        style={{ width: `${projectedBarWidth}%` }}
                    />
                    {/* Actual Spent (on top) */}
                    <div
                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 bg-primary-color"
                        style={{ width: `${spentBarWidth}%` }}
                    />
                </div>
                <div className="flex justify-between text-[10px] text-muted font-medium">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary-color inline-block" />
                        Spent {formatCurrency(currentMonthSpent)}
                    </span>
                    <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full inline-block ${overBudget ? 'bg-red-500/40' : 'bg-primary-color/30'}`} />
                        Projected {formatCurrency(projectedMonthlySpend)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PredictiveCard;
