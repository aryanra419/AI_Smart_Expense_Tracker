import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useExpense } from '../context/ExpenseContext';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass p-3 border-emerald-500/20 bg-slate-900/90 shadow-xl rounded-lg">
                <p className="text-sm font-bold text-white mb-1">{label}</p>
                <p className="text-xs text-emerald-400 font-mono">₹{payload[0].value.toLocaleString('en-IN')}</p>
            </div>
        );
    }
    return null;
};

const WeeklyTrends = () => {
    const { weeklyData } = useExpense();

    return (
        <div className="glass glass-panel border-white/5 bg-white/5 flex flex-col min-h-[400px]">
            <h3 className="text-xl font-bold mb-6 text-white">Weekly Trends</h3>
            <div className="flex-1 w-full" style={{ minHeight: '300px' }}>
                <ResponsiveContainer width="99%" height="100%">
                    <AreaChart data={weeklyData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                            tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                            type="monotone" 
                            dataKey="amount" 
                            stroke="#10b981" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorAmount)" 
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default WeeklyTrends;
