/**
 * Anomaly Detection Engine
 * Uses per-category mean + stddev (z-score) to flag unusual transactions
 */

function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stddev(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const squareDiffs = arr.map(v => (v - m) ** 2);
  return Math.sqrt(mean(squareDiffs));
}

/**
 * Build per-category stats from historical expenses
 */
function buildCategoryStats(expenses) {
  const byCategory = {};
  expenses.forEach(e => {
    const cat = e.category || 'Other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(parseFloat(e.amount));
  });

  const stats = {};
  Object.entries(byCategory).forEach(([cat, amounts]) => {
    const m = mean(amounts);
    const sd = stddev(amounts);
    stats[cat] = { mean: m, stddev: sd, count: amounts.length };
  });
  return stats;
}

/**
 * Determines anomaly level for a single amount vs category stats
 * Returns null if not anomalous, or { multiplier, level } if anomalous
 */
function classifyAnomaly(amount, stats) {
  if (!stats || stats.count < 3) return null; // need enough history
  const { mean: m, stddev: sd } = stats;
  if (sd === 0) return null;

  const zScore = (amount - m) / sd;
  const multiplier = m > 0 ? (amount / m).toFixed(1) : null;

  if (zScore > 3) {
    return { zScore, multiplier, level: 'high', label: `${multiplier}x higher than normal` };
  } else if (zScore > 2) {
    return { zScore, multiplier, level: 'medium', label: `${multiplier}x higher than normal` };
  }
  return null;
}

/**
 * Check if a new expense is anomalous compared to existing history
 * Used in ExpenseContext on addExpense()
 */
export function isTransactionAnomalous(newExpense, existingExpenses) {
  const cat = newExpense.category || 'Other';
  const amount = parseFloat(newExpense.amount);
  const stats = buildCategoryStats(existingExpenses);
  return classifyAnomaly(amount, stats?.[cat]) || null;
}

/**
 * Scan all expenses and return flagged ones
 * Returns array of { expense, anomaly } objects
 */
export function detectAnomalies(expenses) {
  if (!expenses || expenses.length < 4) return [];

  // Build stats excluding the expense being evaluated (leave-one-out)
  const anomalies = [];

  expenses.forEach((expense, idx) => {
    const others = expenses.filter((_, i) => i !== idx);
    const stats = buildCategoryStats(others);
    const cat = expense.category || 'Other';
    const amount = parseFloat(expense.amount);
    const anomaly = classifyAnomaly(amount, stats?.[cat]);
    if (anomaly) {
      anomalies.push({ expense, anomaly });
    }
  });

  return anomalies;
}
