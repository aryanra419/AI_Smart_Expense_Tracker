import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { Moon, Sun, Calendar, Zap, Coffee, ShieldCheck } from 'lucide-react';

const BehavioralInsights = () => {
    const { behavioralData, currencySymbol, formatCurrency } = useExpense();
    
    const { weekendPercentage, lateNightCount, isNightOwl, lateNight, weekend, weekday, lateNightSeverity } = behavioralData;

    const getNightLabel = () => {
        if (lateNightSeverity === 'high' || isNightOwl) return 'Night Owl Pattern';
        if (lateNightSeverity === 'moderate') return 'Evening Interest';
        if (lateNightSeverity === 'low') return 'Occasional Late-Night';
        return 'Daylight Spender';
    };

    return (
        <div className="glass glass-panel border-purple-500/20 bg-purple-500/5 h-full">
            <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <Zap className="text-purple-400" size={20} />
                Behavioral Profile
            </h3>

            <div className="flex flex-col gap-6">
                {/* Day vs Night Section */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm font-bold text-white">
                            {(isNightOwl || lateNightCount > 0) ? <Moon className="text-indigo-400" size={16} /> : <Sun className="text-yellow-400" size={16} />}
                            {getNightLabel()}
                        </div>
                        <p className="text-xs text-muted">
                            {lateNightCount} late-night purchases ({formatCurrency(lateNight)})
                        </p>
                    </div>
                    <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${isNightOwl ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'}`}>
                            {lateNightSeverity !== 'none' ? lateNightSeverity : 'Standard'}
                        </span>
                    </div>
                </div>

                {/* Weekend Intensity */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2 text-sm font-bold text-white">
                            <Calendar size={16} className="text-primary-color" />
                            Weekend Intensity
                        </div>
                        <span className="text-xs font-mono text-primary-color">{weekendPercentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden flex">
                        <div 
                            className="h-full bg-primary-color transition-all duration-1000" 
                            style={{ width: `${100 - weekendPercentage}%` }}
                            title="Weekdays"
                        ></div>
                        <div 
                            className="h-full bg-purple-500 transition-all duration-1000 border-l border-white/20" 
                            style={{ width: `${weekendPercentage}%` }}
                            title="Weekends"
                        ></div>
                    </div>
                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-tighter text-muted">
                        <span>Weekday ({formatCurrency(weekday)})</span>
                        <span>Weekend ({formatCurrency(weekend)})</span>
                    </div>
                </div>

                {/* Personality Badges */}
                <div className="flex flex-wrap gap-2 mt-2">
                    {weekendPercentage > 50 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-full text-xs font-bold border border-purple-500/30">
                            <Zap size={12} /> Weekend Warrior
                        </div>
                    )}
                    {isNightOwl && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold border border-indigo-500/30">
                            <Moon size={12} /> Late Night Munchies
                        </div>
                    )}
                    {lateNightCount === 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-success-color/20 text-success-color rounded-full text-xs font-bold border border-success-color/30">
                            <ShieldCheck size={12} /> Disciplined Logger
                        </div>
                    )}
                    {weekendPercentage < 20 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold border border-yellow-500/30">
                            <Coffee size={12} /> Weekday Hustler
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BehavioralInsights;
