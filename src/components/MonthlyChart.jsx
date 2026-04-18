import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useExpense } from '../context/ExpenseContext';

const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass p-3 border-primary-color/20 bg-slate-900/90 shadow-xl rounded-lg">
                <p className="text-sm font-bold text-white mb-1">{label}</p>
                <p className="text-xs text-primary-color font-mono">₹{payload[0].value.toLocaleString('en-IN')}</p>
            </div>
        );
    }
    return null;
};

const MonthlyChart = () => {
    const { monthlyData } = useExpense();

    return (
        <div className="glass glass-panel border-white/5 bg-white/5 flex flex-col min-h-[400px]">
            <h3 className="text-xl font-bold mb-6 text-white text-pulse">Monthly Spending</h3>
            <div className="flex-1 w-full" style={{ minHeight: '300px' }}>
                <ResponsiveContainer width="99%" height="100%" debounce={50} minHeight={300}>
                    <BarChart data={monthlyData || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
                            tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Bar 
                            dataKey="amount" 
                            fill="var(--primary-color)"
                            radius={[8, 8, 0, 0]} 
                            barSize={32} 
                            animationDuration={1000}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            {(!monthlyData || monthlyData.length === 0) && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                    <p className="text-muted text-sm font-medium">Loading spending history...</p>
                </div>
            )}
        </div>
    );
};

export default MonthlyChart;
