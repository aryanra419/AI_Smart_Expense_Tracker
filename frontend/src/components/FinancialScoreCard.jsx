import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * SVG circular gauge for financial score display
 */
const ScoreGauge = ({ score, color }) => {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
            <svg width="140" height="140" className="transform -rotate-90">
                {/* Track */}
                <circle
                    cx="70" cy="70" r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="10"
                />
                {/* Score arc */}
                <circle
                    cx="70" cy="70" r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)', filter: `drop-shadow(0 0 8px ${color}60)` }}
                />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white leading-none">{score}</span>
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest mt-0.5">/ 100</span>
            </div>
        </div>
    );
};

const ComponentBar = ({ component }) => {
    const maxPoints = { 'Budget Adherence': 30, 'Consistency': 20, 'Category Balance': 15, 'Savings Habit': 20, 'Discipline Streak': 15 };
    const max = maxPoints[component.label] || 20;
    const pct = (component.score / max) * 100;
    const barColor = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#f43f5e';

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-white/80">{component.label}</span>
                <span className="text-xs font-bold" style={{ color: barColor }}>{component.score}/{max}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${pct}%`, backgroundColor: barColor }}
                />
            </div>
            <p className="text-[10px] text-muted">{component.detail}</p>
        </div>
    );
};

const FinancialScoreCard = () => {
    const { financialScore } = useExpense();

    if (!financialScore) {
        return (
            <div className="glass glass-panel border-primary-color/20 h-full flex items-center justify-center">
                <p className="text-muted text-sm">Add expenses to generate your score</p>
            </div>
        );
    }

    const { score, grade, scoreColor, trend, components } = financialScore;

    const gradeColorMap = {
        emerald: '#10b981', green: '#22c55e', lime: '#84cc16',
        yellow: '#f59e0b', orange: '#f97316', red: '#f43f5e'
    };
    const gradeHex = gradeColorMap[financialScore.gradeColor] || '#6366f1';

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-muted';

    return (
        <div className="glass glass-panel border-primary-color/20 bg-primary-color/5 h-full">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-primary-color/20">
                    <Trophy className="text-primary-color" size={20} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Financial Score</h3>
                    <p className="text-xs text-muted">AI-powered health assessment</p>
                </div>
            </div>

            {/* Score Gauge + Grade */}
            <div className="flex items-center justify-center gap-8 mb-6">
                <ScoreGauge score={score} color={scoreColor} />

                <div className="flex flex-col items-center gap-2">
                    {/* Grade Badge */}
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black border-2"
                        style={{ color: gradeHex, borderColor: `${gradeHex}40`, backgroundColor: `${gradeHex}15` }}
                    >
                        {grade}
                    </div>

                    {/* Trend */}
                    <div className={`flex items-center gap-1 text-xs font-bold ${trendColor}`}>
                        <TrendIcon size={14} />
                        <span>{trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}</span>
                    </div>

                    {/* Score label */}
                    <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full border"
                        style={{ color: scoreColor, borderColor: `${scoreColor}40`, backgroundColor: `${scoreColor}15` }}
                    >
                        {score >= 80 ? 'Excellent' : score >= 65 ? 'Good' : score >= 50 ? 'Fair' : score >= 35 ? 'Poor' : 'Critical'}
                    </span>
                </div>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-4 border-t border-white/5 pt-4">
                <p className="text-xs font-bold text-muted uppercase tracking-widest">Score Breakdown</p>
                {components.map((comp, i) => (
                    <ComponentBar key={i} component={comp} />
                ))}
            </div>
        </div>
    );
};

export default FinancialScoreCard;
