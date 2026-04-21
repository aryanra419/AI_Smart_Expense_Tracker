import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useExpense } from '../context/ExpenseContext';

const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass p-3 border-primary-color/20 bg-slate-900/95 shadow-xl rounded-lg border border-white/5">
                <p className="text-sm font-bold text-white mb-1">{payload[0].name}</p>
                <p className="text-xs text-primary-color font-mono font-bold">₹{payload[0].value.toLocaleString('en-IN')}</p>
            </div>
        );
    }
    return null;
};

const ExpenseChart = () => {
    const { dashboardData } = useExpense();

    if (!dashboardData || dashboardData.length === 0) {
        return (
            <div className="glass glass-panel flex flex-col items-center justify-center min-h-[300px]">
                <p className="text-muted">No data to display. Add expenses to see your breakdown.</p>
            </div>
        );
    }

    return (
        <div className="glass glass-panel border-white/5 bg-white/5 flex flex-col">
            <h3 className="text-xl font-bold mb-6 text-white">Expense Distribution</h3>
            <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={dashboardData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {dashboardData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            iconType="circle"
                            formatter={(value) => <span className="text-xs text-muted ml-1">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ExpenseChart;
