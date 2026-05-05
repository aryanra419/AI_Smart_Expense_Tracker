import React, { createContext, useContext, useState, useEffect } from 'react';
import { autoCategorize } from '../utils/categorize';
import { generateInsights } from '../utils/insights';
import { getPredictionData } from '../utils/predictions';
import { detectAnomalies, isTransactionAnomalous } from '../utils/anomalyDetector';
import { calculateFinancialScore } from '../utils/financialScore';

const ExpenseContext = createContext();

export const useExpense = () => useContext(ExpenseContext);

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(5000);
  const [categoryBudgets, setCategoryBudgets] = useState({ Food: 5000, Transport: 3000, Shopping: 5000, Entertainment: 2500, Health: 2000 });
  const [insights, setInsights] = useState([]);
  const [pendingAnomaly, setPendingAnomaly] = useState(null);
  
  const currencySymbol = '₹';
  const API_URL = import.meta.env.VITE_API_URL || 'https://ai-smart-expense-tracker-1.onrender.com';

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const triggerNotification = (title, options = {}) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        ...options
      });
    }
  };

  useEffect(() => {
    // Initial fetch from Python Backend
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/data`);
        if (!res.ok) throw new Error("Backend not reachable");
        const data = await res.json();
        setExpenses(data.expenses || []);
        setBudget(data.budget || 5000);
        setCategoryBudgets(data.categoryBudgets || {});
      } catch (err) {
        console.error("Backend offline, falling back to local memory", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setInsights(generateInsights(expenses));
  }, [expenses]);

  const addExpense = async (expense) => {
    const newAmount = parseFloat(expense.amount);
    const category = expense.category || autoCategorize(expense.description);
    
    // Budget Rule Check (Local for instant feedback)
    const now = new Date();
    const categoryTotalBefore = expenses
      .filter(e => {
        const d = new Date(e.date);
        return e.category === category && 
               d.getMonth() === now.getMonth() && 
               d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    
    const categoryLimit = categoryBudgets[category] || 999999;
    
    if (categoryTotalBefore < categoryLimit && (categoryTotalBefore + newAmount) >= categoryLimit) {
      triggerNotification(`Budget Warning: ${category}`, {
        body: `You just crossed your ₹${categoryLimit} budget for ${category}! ⚠️`,
      });
    }

    const newExpense = {
      ...expense,
      category: category,
      date: new Date().toISOString()
    };

    // 🚨 Anomaly Detection — check before saving
    const anomalyResult = isTransactionAnomalous(newExpense, expenses);
    if (anomalyResult) {
      setPendingAnomaly({ expense: newExpense, anomaly: anomalyResult });
    }

    try {
      const res = await fetch(`${API_URL}/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
      });
      const savedExpense = await res.json();
      setExpenses(prev => [...prev, savedExpense]);
    } catch (err) {
        console.error("Could not save to backend", err);
        // Optimistic fallback for demo
        setExpenses(prev => [...prev, { ...newExpense, id: Date.now() }]);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await fetch(`${API_URL}/api/expenses/${id}`, { method: 'DELETE' });
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    } catch (err) {
      console.error("Could not delete from backend", err);
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    }
  };

  const updateBudget = async (name, value) => {
    let newBudget = budget;
    let newCategoryBudgets = { ...categoryBudgets };

    if (name === 'total') {
      newBudget = value;
      setBudget(value);
    } else {
      newCategoryBudgets[name] = value;
      setCategoryBudgets(newCategoryBudgets);
    }

    try {
      await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget: newBudget, categoryBudgets: newCategoryBudgets })
      });
    } catch (err) {
      console.error("Could not update settings in backend", err);
    }
  };

  const getBehavioralData = () => {
    const weekendDays = [0, 6]; // Sun, Sat
    const lateNightHours = [22, 23, 0, 1, 2, 3, 4]; // 10 PM to 4 AM
    
    const totals = expenses.reduce((acc, exp) => {
        const d = new Date(exp.date);
        const day = d.getDay();
        const hour = d.getHours();
        
        if (weekendDays.includes(day)) {
            acc.weekend += parseFloat(exp.amount);
        } else {
            acc.weekday += parseFloat(exp.amount);
        }
        
        if (lateNightHours.includes(hour)) {
            acc.lateNight += parseFloat(exp.amount);
            acc.lateNightCount++;
        }
        
        return acc;
    }, { weekend: 0, weekday: 0, lateNight: 0, lateNightCount: 0 });

    const total = (totals.weekend + totals.weekday) || 1;
    let lateNightSeverity = 'none';
    if (totals.lateNightCount > 5) lateNightSeverity = 'high';
    else if (totals.lateNightCount > 2) lateNightSeverity = 'moderate';
    else if (totals.lateNightCount > 0) lateNightSeverity = 'low';

    return {
        ...totals,
        weekendPercentage: (totals.weekend / total) * 100,
        weekdayPercentage: (totals.weekday / total) * 100,
        isNightOwl: totals.lateNightCount > 3,
        lateNightSeverity
    };
  };

  const now = new Date();

  const currentMonthExpenses = expenses.filter(exp => {
    const d = new Date(exp.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const currentMonthAmount = currentMonthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  
  const dashboardData = Object.entries(
    expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const monthlyData = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = months[d.getMonth()];
      const year = d.getFullYear();
      const monthTotal = expenses.reduce((sum, exp) => {
        const expDate = new Date(exp.date);
        if (expDate.getMonth() === d.getMonth() && expDate.getFullYear() === d.getFullYear()) {
          return sum + (parseFloat(exp.amount) || 0);
        }
        return sum;
      }, 0);
      result.push({ name: `${monthName} ${year}`, amount: monthTotal });
    }
    return result;
  })();

  const weeklyData = (() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayName = days[d.getDay()];
      const dayTotal = expenses.reduce((sum, exp) => {
        const expDate = new Date(exp.date);
        if (expDate.toDateString() === d.toDateString()) {
          return sum + parseFloat(exp.amount);
        }
        return sum;
      }, 0);
      result.push({ name: dayName, amount: dayTotal });
    }
    return result;
  })();

  const budgetUsage = (currentMonthAmount / budget) * 100;

  // ─── AI Feature Data ────────────────────────────────────────────────────────
  const predictionData = getPredictionData(expenses, budget);
  const anomalies = detectAnomalies(expenses);
  const financialScore = calculateFinancialScore(expenses, budget, categoryBudgets);

  return (
    <ExpenseContext.Provider value={{ 
      expenses, insights, totalAmount, currentMonthAmount, currentMonthExpenses, 
      dashboardData, monthlyData, weeklyData,
      budget, categoryBudgets, budgetUsage, currencySymbol, formatCurrency,
      behavioralData: getBehavioralData(), addExpense, deleteExpense, updateBudget,
      // AI Features
      predictionData, anomalies, financialScore,
      pendingAnomaly, clearPendingAnomaly: () => setPendingAnomaly(null)
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};
