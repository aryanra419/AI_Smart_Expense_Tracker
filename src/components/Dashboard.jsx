import React, { useState } from 'react';
import ExpenseForm from './ExpenseForm';
import ExpenseChart from './ExpenseChart';
import MonthlyChart from './MonthlyChart';
import WeeklyTrends from './WeeklyTrends';
import BudgetPieChart from './BudgetPieChart';
import BehavioralInsights from './BehavioralInsights';
import TransactionList from './TransactionList';
import InsightsCard from './InsightsCard';
import AlertManager from './AlertManager';
import { useExpense } from '../context/ExpenseContext';
import { CreditCard, Wallet, Banknote, LayoutDashboard, BarChart3, History } from 'lucide-react';

const Dashboard = () => {
    const { currentMonthAmount, totalAmount, expenses, budget, budgetUsage, formatCurrency } = useExpense();
    const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'trends'
    const remaining = Math.max(0, budget - currentMonthAmount);

    return (
        <div className="flex flex-col gap-10 animate-fade-in pb-20 relative">
            {/* Header with Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-bold text-white tracking-tight">Financial Pulse</h2>
                    <p className="text-muted mt-1">Real-time spending intelligence</p>
                </div>
                
                <div className="tab-container">
                    <button 
                        onClick={() => setActiveTab('summary')}
                        className={`tab-btn flex items-center gap-2 ${activeTab === 'summary' ? 'active' : ''}`}
                    >
                        <LayoutDashboard size={16} />
                        Summary
                    </button>
                    <button 
                        onClick={() => setActiveTab('trends')}
                        className={`tab-btn flex items-center gap-2 ${activeTab === 'trends' ? 'active' : ''}`}
                    >
                        <BarChart3 size={16} />
                        Analytics
                    </button>
                </div>
            </div>

            {/* Pulse Stats Overview - Only visible in Summary */}
            {activeTab === 'summary' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
                    <div className="glass glass-panel pulse-card border-primary-color/10">
                        <p className="text-xs font-bold text-muted uppercase tracking-widest mb-3">Total Balance</p>
                        <h3 className="text-4xl font-bold text-white mb-2">{formatCurrency(remaining)}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] px-2 py-0.5 bg-success-color/10 text-success-color rounded-full border border-success-color/20 font-bold">
                                SAFE TO SPEND
                            </span>
                        </div>
                    </div>

                    <div className="glass glass-panel pulse-card border-white/5">
                        <p className="text-xs font-bold text-muted uppercase tracking-widest mb-3">Monthly Spending</p>
                        <h3 className="text-4xl font-bold text-white mb-2">{formatCurrency(currentMonthAmount)}</h3>
                        <p className="text-xs text-muted flex items-center gap-1 font-medium">
                            <History size={12} /> {formatCurrency(totalAmount)} total lifetime
                        </p>
                    </div>

                    <div className="glass glass-panel pulse-card border-white/5">
                        <p className="text-xs font-bold text-muted uppercase tracking-widest mb-3">Budget Usage</p>
                        <div className="flex items-end gap-2 mb-2">
                            <h3 className="text-4xl font-bold text-white leading-none">{budgetUsage.toFixed(0)}%</h3>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-1000 ${budgetUsage > 90 ? 'bg-danger-color' : 'bg-primary-color'}`}
                                style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {activeTab === 'summary' && (
                    <div className="xl:col-span-4 flex flex-col gap-10 animate-fade-in">
                        <ExpenseForm />
                        <InsightsCard />
                    </div>
                )}

                <div className={activeTab === 'summary' ? "xl:col-span-8" : "xl:col-span-12"}>
                    {activeTab === 'summary' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in content-summary">
                            <BudgetPieChart />
                            <ExpenseChart />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-10 animate-fade-in content-trends">
                            <MonthlyChart />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <WeeklyTrends />
                                <BehavioralInsights />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Transactions */}
            <div className="animate-fade-in">
                <TransactionList />
            </div>

            <AlertManager />
        </div>
    );
};

export default Dashboard;
