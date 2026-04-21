import React, { useState } from 'react';
import ExpenseForm from './ExpenseForm';
import ExpenseChart from './ExpenseChart';
import MonthlyChart from './MonthlyChart';
import WeeklyTrends from './WeeklyTrends';
import BudgetPieChart from './BudgetPieChart';
import BehavioralInsights from './BehavioralInsights';
import TransactionList from './TransactionList';
import InsightsCard from './InsightsCard';

import PredictiveCard from './PredictiveCard';
import FinancialScoreCard from './FinancialScoreCard';

import { useExpense } from '../context/ExpenseContext';
import {
  Wallet, TrendingDown, BarChart3, LayoutDashboard,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';

const StatCard = ({ label, value, subLabel, icon: Icon, color, trend, trendVal }) => {
  const colorMap = {
    indigo:  { bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.18)',  icon: 'rgba(99,102,241,0.15)',  text: '#818cf8' },
    emerald: { bg: 'rgba(16,185,129,0.06)',  border: 'rgba(16,185,129,0.18)',  icon: 'rgba(16,185,129,0.15)',  text: '#34d399' },
    violet:  { bg: 'rgba(139,92,246,0.06)',  border: 'rgba(139,92,246,0.18)', icon: 'rgba(139,92,246,0.15)', text: '#a78bfa' },
    rose:    { bg: 'rgba(244,63,94,0.06)',   border: 'rgba(244,63,94,0.18)',  icon: 'rgba(244,63,94,0.15)',  text: '#fb7185' },
  };
  const c = colorMap[color] || colorMap.indigo;

  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;
  const trendColor = trend === 'up' ? '#34d399' : trend === 'down' ? '#fb7185' : '#64748b';

  return (
    <div style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: '20px',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
      cursor: 'default',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 16px 40px -12px ${c.border}`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Subtle glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: '120px', height: '120px',
        background: `radial-gradient(circle, ${c.text}20 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b' }}>
          {label}
        </p>
        <div style={{ width: 34, height: 34, borderRadius: '10px', background: c.icon, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={c.text} strokeWidth={2.5} />
        </div>
      </div>

      <p style={{ fontSize: '2rem', fontWeight: 800, color: 'white', letterSpacing: '-0.04em', lineHeight: 1 }}>
        {value}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.875rem' }}>
        <p style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>{subLabel}</p>
        {trend && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', fontWeight: 700, color: trendColor }}>
            <TrendIcon size={12} strokeWidth={3} />
            {trendVal}
          </span>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const {
    currentMonthAmount, totalAmount, expenses, budget,
    budgetUsage, formatCurrency, financialScore
  } = useExpense();

  const [activeTab, setActiveTab] = useState('summary');
  const remaining = Math.max(0, budget - currentMonthAmount);
  const usagePct = Math.min(100, budgetUsage || 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }} className="animate-fade-in">

      {/* ── Stats Row ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        <StatCard
          label="Safe to Spend"
          value={formatCurrency(remaining)}
          subLabel={`${usagePct.toFixed(0)}% of budget used`}
          icon={Wallet}
          color={usagePct > 85 ? 'rose' : 'emerald'}
          trend={usagePct > 85 ? 'down' : 'up'}
          trendVal={usagePct > 85 ? 'High spend' : 'On track'}
        />
        <StatCard
          label="Monthly Spending"
          value={formatCurrency(currentMonthAmount)}
          subLabel={`${formatCurrency(totalAmount)} total lifetime`}
          icon={TrendingDown}
          color="indigo"
        />
        <StatCard
          label="Financial Score"
          value={financialScore ? `${financialScore.score}/100` : '—'}
          subLabel={financialScore ? `Grade ${financialScore.grade}` : 'Add expenses to score'}
          icon={BarChart3}
          color={financialScore && financialScore.score >= 70 ? 'emerald' : financialScore && financialScore.score >= 40 ? 'violet' : 'rose'}
          trend={financialScore?.trend}
          trendVal={financialScore?.trend === 'up' ? 'Improving' : financialScore?.trend === 'down' ? 'Declining' : 'Stable'}
        />
      </div>

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="tab-bar">
          <button
            onClick={() => setActiveTab('summary')}
            className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
          >
            <LayoutDashboard size={14} />
            Summary
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
          >
            <BarChart3 size={14} />
            Analytics
          </button>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
          {activeTab === 'summary'
            ? `${expenses.length} transaction${expenses.length !== 1 ? 's' : ''} tracked`
            : 'AI-powered spending analysis'}
        </p>
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      {activeTab === 'summary' ? (
        /* SUMMARY TAB */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
          {/* Top row: Form + Score */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem' }}>
            <ExpenseForm />
            <FinancialScoreCard />
          </div>
          {/* Second row: Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <BudgetPieChart />
            <ExpenseChart />
          </div>
          {/* AI Insights */}
          <InsightsCard />
        </div>
      ) : (
        /* ANALYTICS TAB */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
          <PredictiveCard />
          <MonthlyChart />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <WeeklyTrends />
            <BehavioralInsights />
          </div>
        </div>
      )}

      {/* ── Transactions ───────────────────────────────────────── */}
      <TransactionList />
    </div>
  );
};

export default Dashboard;
