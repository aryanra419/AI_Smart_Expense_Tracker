import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useExpense } from '../context/ExpenseContext';

const BudgetPieChart = () => {
    const { currentMonthAmount, budget } = useExpense();
    
    const remaining = Math.max(0, budget - currentMonthAmount);
    const over = Math.max(0, currentMonthAmount - budget);

    const data = [
        { name: 'Spent', value: currentMonthAmount - over, color: '#3b82f6' },
        { name: 'Remaining', value: remaining, color: '#10b981' },
    ];

    if (over > 0) {
        data.push({ name: 'Over Budget', value: over, color: '#ef4444' });
    }

    return (
        <div className="glass glass-panel border-white/5 bg-white/5 flex flex-col h-[400px]">
            <h3 className="text-xl font-bold mb-6 text-white">Budget Status</h3>
            <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-4">
                <p className="text-xs text-muted uppercase font-bold tracking-wider">Remaining</p>
                <p className={`text-xl font-bold ${remaining > 0 ? 'text-success-color' : 'text-danger-color'}`}>
                    ₹{remaining.toLocaleString('en-IN')}
                </p>
            </div>
        </div>
    );
};

export default BudgetPieChart;
