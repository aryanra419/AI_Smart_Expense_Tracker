/**
 * Predictive Intelligence Engine
 * Computes burn rate, projected spending, and overspend warnings
 */

/**
 * Returns expenses for the current month only
 */
function getCurrentMonthExpenses(expenses) {
  const now = new Date();
  return expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
}

/**
 * How many days have elapsed in the current month (min 1 to avoid divide-by-zero)
 */
function getDaysElapsed() {
  return Math.max(1, new Date().getDate());
}

/**
 * Total days in the current month
 */
function getDaysInCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

/**
 * Daily burn rate based on current month spend
 */
export function getDailyBurnRate(expenses) {
  const monthExpenses = getCurrentMonthExpenses(expenses);
  const totalSpent = monthExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);
  return totalSpent / getDaysElapsed();
}

/**
 * Projected end-of-month total
 */
export function getProjectedMonthlySpend(expenses) {
  const burnRate = getDailyBurnRate(expenses);
  return burnRate * getDaysInCurrentMonth();
}

/**
 * Days until the user exhausts the budget at current burn rate
 * Returns Infinity if burn rate is 0
 */
export function getDaysUntilOverspend(expenses, budget) {
  const monthExpenses = getCurrentMonthExpenses(expenses);
  const totalSpent = monthExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);
  const remaining = budget - totalSpent;
  if (remaining <= 0) return 0;
  const burnRate = getDailyBurnRate(expenses);
  if (burnRate === 0) return Infinity;
  return Math.floor(remaining / burnRate);
}

/**
 * Main prediction summary object consumed by PredictiveCard
 */
export function getPredictionData(expenses, budget) {
  if (!expenses || expenses.length === 0) {
    return {
      dailyBurnRate: 0,
      projectedMonthlySpend: 0,
      daysUntilOverspend: Infinity,
      currentMonthSpent: 0,
      daysElapsed: getDaysElapsed(),
      daysInMonth: getDaysInCurrentMonth(),
      budgetRemainingPercent: 100,
      severity: 'safe',
      alerts: []
    };
  }

  const monthExpenses = getCurrentMonthExpenses(expenses);
  const currentMonthSpent = monthExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);
  const dailyBurnRate = getDailyBurnRate(expenses);
  const projectedMonthlySpend = getProjectedMonthlySpend(expenses);
  const daysUntilOverspend = getDaysUntilOverspend(expenses, budget);
  const daysElapsed = getDaysElapsed();
  const daysInMonth = getDaysInCurrentMonth();
  const budgetRemainingPercent = Math.max(0, ((budget - currentMonthSpent) / budget) * 100);

  const alerts = [];
  let severity = 'safe';

  if (currentMonthSpent >= budget) {
    severity = 'over';
    alerts.push({
      type: 'danger',
      message: `Budget exceeded by ₹${(currentMonthSpent - budget).toFixed(0)}. You are over budget this month.`
    });
  } else if (daysUntilOverspend !== Infinity && daysUntilOverspend <= 3) {
    severity = 'critical';
    alerts.push({
      type: 'danger',
      message: `⚠️ You will overspend in ${daysUntilOverspend} day${daysUntilOverspend === 1 ? '' : 's'} at current pace.`
    });
  } else if (daysUntilOverspend !== Infinity && daysUntilOverspend <= 7) {
    severity = 'warning';
    alerts.push({
      type: 'warning',
      message: `You will overspend in ~${daysUntilOverspend} days. Consider slowing down spending.`
    });
  } else if (projectedMonthlySpend > budget) {
    severity = 'warning';
    alerts.push({
      type: 'warning',
      message: `Projected month-end spend is ₹${projectedMonthlySpend.toFixed(0)}, above your ₹${budget} budget.`
    });
  } else {
    alerts.push({
      type: 'success',
      message: `On track! Projected spend: ₹${projectedMonthlySpend.toFixed(0)} of ₹${budget} budget.`
    });
  }

  return {
    dailyBurnRate,
    projectedMonthlySpend,
    daysUntilOverspend,
    currentMonthSpent,
    daysElapsed,
    daysInMonth,
    budgetRemainingPercent,
    severity,
    alerts
  };
}
