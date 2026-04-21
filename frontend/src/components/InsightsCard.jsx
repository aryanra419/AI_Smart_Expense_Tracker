import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { Sparkles, AlertCircle, CheckCircle, Lightbulb, Zap, ShoppingBag, Utensils, TrendingDown, BarChart } from 'lucide-react';

const iconMap = {
    Sparkles,
    AlertCircle,
    CheckCircle,
    Lightbulb,
    Zap,
    ShoppingBag,
    Utensils,
    TrendingDown,
    BarChart
};

const InsightsCard = () => {
    const { insights } = useExpense();

    return (
        <div className="glass glass-panel border-primary-color/20 bg-primary-color/5 h-full">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-primary-color/20 rounded-lg text-primary-color">
                    <Sparkles size={20} />
                </div>
                <h3 className="text-xl font-bold text-white m-0">AI Insights</h3>
            </div>
            
            <div className="flex flex-col gap-4">
                {insights.map((insight, index) => {
                    const Icon = iconMap[insight.icon] || Sparkles;
                    const typeClass = insight.type === 'warning' ? 'text-danger-color border-danger-color/20 bg-danger-color/5' : 
                                     insight.type === 'success' ? 'text-success-color border-success-color/20 bg-success-color/5' :
                                     insight.type === 'tip' ? 'text-warning-color border-warning-color/20 bg-warning-color/5' :
                                     'text-primary-color border-primary-color/20 bg-primary-color/5';

                    return (
                        <div 
                            key={index} 
                            className={`flex gap-3 p-4 rounded-xl border animate-slide-in ${typeClass}`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="shrink-0 mt-1">
                                <Icon size={18} />
                            </div>
                            <p className="text-sm font-medium leading-relaxed m-0 text-inherit">
                                {insight.text}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default InsightsCard;
