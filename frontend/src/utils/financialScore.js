/**
 * Smart Financial Score Engine
 * Computes a 0–100 score with breakdown and grade
 */

function getCurrentMonthExpenses(expenses) {
  const now = new Date();
  return expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
}

function getPreviousMonthExpenses(expenses) {
  const now = new Date();
  const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  return expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  });
}

function stddev(arr) {
  if (arr.length < 2) return 0;
  const m = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.map(v => (v - m) ** 2).reduce((a, b) => a + b, 0) / arr.length);
}

const NON_ESSENTIAL = ['Entertainment', 'Shopping', 'Subscriptions'];
const ESSENTIAL = ['Food', 'Transport', 'Health', 'Utilities', 'Rent'];

/**
 * Component 1: Budget Adherence (max 30 pts)
 * Full score if under budget, scaled down if over
 */
function scoreBudgetAdherence(currentMonthExpenses, budget) {
  const spent = currentMonthExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);
  if (budget <= 0) return { score: 15, label: 'Budget Adherence', detail: 'No budget set' };
  const ratio = spent / budget;
  const score = Math.max(0, Math.round(30 * (1 - Math.max(0, ratio - 0.5) / 0.5)));
  return {
    score: Math.min(30, ratio <= 0.8 ? 30 : Math.round(30 * (1 - (ratio - 0.8) / 0.4))),
    label: 'Budget Adherence',
    detail: ratio <= 1 ? `${(ratio * 100).toFixed(0)}% of budget used` : `${((ratio - 1) * 100).toFixed(0)}% over budget`
  };
}

/**
 * Component 2: Spending Consistency (max 20 pts)
 * Low day-to-day stddev = more consistent = better score
 */
function scoreConsistency(expenses) {
  if (expenses.length < 5) return { score: 10, label: 'Consistency', detail: 'Not enough data yet' };

  const byDay = {};
  expenses.forEach(e => {
    const key = new Date(e.date).toDateString();
    byDay[key] = (byDay[key] || 0) + parseFloat(e.amount);
  });
  const dailyAmounts = Object.values(byDay);
  const avg = dailyAmounts.reduce((a, b) => a + b, 0) / dailyAmounts.length;
  const sd = stddev(dailyAmounts);
  const cv = avg > 0 ? sd / avg : 1; // coefficient of variation

  let score = 20;
  if (cv > 2) score = 5;
  else if (cv > 1.5) score = 10;
  else if (cv > 1) score = 14;
  else if (cv > 0.5) score = 17;

  return {
    score,
    label: 'Consistency',
    detail: cv < 0.5 ? 'Very consistent spending' : cv < 1 ? 'Moderate variation' : 'Highly variable spending'
  };
}

/**
 * Component 3: Category Diversity (max 15 pts)
 * Penalize if one category dominates >60% of spend
 */
function scoreDiversity(expenses) {
  if (expenses.length < 3) return { score: 8, label: 'Category Balance', detail: 'Not enough data yet' };

  const totals = {};
  const total = expenses.reduce((s, e) => {
    const cat = e.category || 'Other';
    totals[cat] = (totals[cat] || 0) + parseFloat(e.amount);
    return s + parseFloat(e.amount);
  }, 0);

  if (total === 0) return { score: 15, label: 'Category Balance', detail: 'No spending yet' };

  const maxRatio = Math.max(...Object.values(totals)) / total;
  let score = 15;
  if (maxRatio > 0.8) score = 3;
  else if (maxRatio > 0.6) score = 8;
  else if (maxRatio > 0.5) score = 12;

  const topCategory = Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0];

  return {
    score,
    label: 'Category Balance',
    detail: maxRatio < 0.5 ? 'Well balanced' : `${topCategory} is ${(maxRatio * 100).toFixed(0)}% of spend`
  };
}

/**
 * Component 4: Savings Potential (max 20 pts)
 * Low non-essential vs essential ratio = better
 */
function scoreSavings(expenses) {
  if (expenses.length < 3) return { score: 10, label: 'Savings Habit', detail: 'Not enough data yet' };

  const essentialTotal = expenses
    .filter(e => ESSENTIAL.includes(e.category))
    .reduce((s, e) => s + parseFloat(e.amount), 0);
  const nonEssentialTotal = expenses
    .filter(e => NON_ESSENTIAL.includes(e.category))
    .reduce((s, e) => s + parseFloat(e.amount), 0);

  const total = essentialTotal + nonEssentialTotal;
  if (total === 0) return { score: 20, label: 'Savings Habit', detail: 'No spending yet' };

  const nonEssentialRatio = nonEssentialTotal / total;
  let score = 20;
  if (nonEssentialRatio > 0.6) score = 3;
  else if (nonEssentialRatio > 0.4) score = 10;
  else if (nonEssentialRatio > 0.25) score = 15;

  return {
    score,
    label: 'Savings Habit',
    detail: nonEssentialRatio < 0.25
      ? 'Excellent — low non-essential spend'
      : `${(nonEssentialRatio * 100).toFixed(0)}% spent on non-essentials`
  };
}

/**
 * Component 5: Streak / Discipline Bonus (max 15 pts)
 * Days since last high-amount spike (> 3x avg)
 */
function scoreStreak(expenses) {
  if (expenses.length < 3) return { score: 8, label: 'Discipline Streak', detail: 'Not enough data yet' };

  const amounts = expenses.map(e => parseFloat(e.amount));
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;

  // Sort by date descending for recency
  const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  let daysSinceSpike = Infinity;
  for (const exp of sorted) {
    const amt = parseFloat(exp.amount);
    if (amt > avg * 3) {
      daysSinceSpike = Math.floor((Date.now() - new Date(exp.date)) / (1000 * 60 * 60 * 24));
      break;
    }
  }

  let score = 15;
  let detail = 'No spending spikes detected!';
  if (daysSinceSpike === 0) { score = 3; detail = 'Spending spike today'; }
  else if (daysSinceSpike <= 2) { score = 6; detail = `Spike ${daysSinceSpike} days ago`; }
  else if (daysSinceSpike <= 7) { score = 10; detail = `Last spike ${daysSinceSpike} days ago`; }
  else if (daysSinceSpike < Infinity) { score = 13; detail = `Clean for ${daysSinceSpike} days`; }

  return { score, label: 'Discipline Streak', detail };
}

function getGrade(score) {
  if (score >= 90) return { grade: 'A+', color: 'emerald' };
  if (score >= 80) return { grade: 'A', color: 'green' };
  if (score >= 65) return { grade: 'B', color: 'lime' };
  if (score >= 50) return { grade: 'C', color: 'yellow' };
  if (score >= 35) return { grade: 'D', color: 'orange' };
  return { grade: 'F', color: 'red' };
}

function getScoreColor(score) {
  if (score >= 70) return '#10b981'; // green
  if (score >= 40) return '#f59e0b'; // yellow
  return '#f43f5e'; // red
}

/**
 * Main export — calculate full financial score
 */
export function calculateFinancialScore(expenses, budget, categoryBudgets) {
  const currentMonthExpenses = getCurrentMonthExpenses(expenses);
  const prevMonthExpenses = getPreviousMonthExpenses(expenses);

  const components = [
    scoreBudgetAdherence(currentMonthExpenses, budget),
    scoreConsistency(expenses),
    scoreDiversity(currentMonthExpenses),
    scoreSavings(expenses),
    scoreStreak(expenses)
  ];

  const totalScore = Math.min(100, components.reduce((s, c) => s + c.score, 0));
  const maxPossible = 100;

  // Trend vs last month
  let trend = 'stable';
  if (prevMonthExpenses.length > 0) {
    const prevComponents = [
      scoreBudgetAdherence(prevMonthExpenses, budget),
      scoreConsistency(expenses.filter(e => prevMonthExpenses.includes(e))),
      scoreDiversity(prevMonthExpenses),
      scoreSavings(prevMonthExpenses),
      scoreStreak(expenses)
    ];
    const prevScore = Math.min(100, prevComponents.reduce((s, c) => s + c.score, 0));
    if (totalScore > prevScore + 3) trend = 'up';
    else if (totalScore < prevScore - 3) trend = 'down';
  }

  const { grade, color } = getGrade(totalScore);

  return {
    score: totalScore,
    grade,
    gradeColor: color,
    scoreColor: getScoreColor(totalScore),
    trend,
    components,
    maxPossible
  };
}
