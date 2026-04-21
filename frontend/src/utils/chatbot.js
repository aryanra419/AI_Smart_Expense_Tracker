/**
 * AI Financial Chatbot Engine
 * Rule-based NLP intent parser + response generator
 * Operates entirely on in-memory expense data — no API key needed
 */

const CATEGORIES = ['food', 'transport', 'shopping', 'entertainment', 'health', 'subscriptions', 'utilities', 'rent', 'other'];

// ─── Intent Patterns ──────────────────────────────────────────────────────────
const INTENTS = [
  {
    name: 'can_i_spend',
    patterns: [/can i (afford|spend|buy)/i, /is it ok to spend/i, /should i spend/i, /can i use/i],
    amountRegex: /[₹rs\s]*([\d,]+)/i
  },
  {
    name: 'top_category',
    patterns: [/where did i spend/i, /most (spent|spending)/i, /top categor/i, /biggest expense/i, /where.*money.*go/i]
  },
  {
    name: 'anomaly_summary',
    patterns: [/unusual/i, /anomal/i, /abnormal/i, /weird transaction/i, /suspicious/i, /spike/i]
  },
  {
    name: 'score_explain',
    patterns: [/why.*score/i, /score.*low/i, /improve.*score/i, /financial.*score/i, /my score/i, /what.*score/i]
  },
  {
    name: 'prediction',
    patterns: [/will i overspend/i, /overspend/i, /project/i, /forecast/i, /end of month/i, /how much.*spend.*month/i]
  },
  {
    name: 'category_spend',
    patterns: [/how much.*spend.*on/i, /spent on/i, /spending on/i, /total.*category/i]
  },
  {
    name: 'save_tips',
    patterns: [/how.*save/i, /tips.*saving/i, /reduce.*spend/i, /cut.*cost/i, /save more/i]
  },
  {
    name: 'total_spend',
    patterns: [/total spend/i, /how much.*spent/i, /total.*this month/i, /monthly.*total/i, /how much.*month/i]
  },
  {
    name: 'budget_status',
    patterns: [/budget.*status/i, /how.*budget/i, /remaining.*budget/i, /budget.*left/i, /budget.*remain/i]
  },
  {
    name: 'greeting',
    patterns: [/^(hi|hello|hey|yo|sup|good morning|good evening|howdy)[\s!?]*$/i]
  },
  {
    name: 'help',
    patterns: [/^help$/i, /what can you do/i, /commands/i, /what.*ask/i]
  }
];

// ─── Intent Parser ─────────────────────────────────────────────────────────────
function parseIntent(message) {
  const lower = message.toLowerCase().trim();

  for (const intent of INTENTS) {
    if (intent.patterns.some(p => p.test(message))) {
      // Extract amount if applicable
      let amount = null;
      if (intent.amountRegex) {
        const match = message.match(intent.amountRegex);
        if (match) amount = parseFloat(match[1].replace(',', ''));
      }

      // Extract category mention
      let category = null;
      for (const cat of CATEGORIES) {
        if (lower.includes(cat)) { category = cat; break; }
      }

      // Extract timeframe
      let timeframe = 'current_month';
      if (/last month/i.test(message)) timeframe = 'last_month';
      else if (/last week/i.test(message)) timeframe = 'last_week';
      else if (/today/i.test(message)) timeframe = 'today';

      return { intent: intent.name, amount, category, timeframe };
    }
  }

  return { intent: 'unknown', amount: null, category: null, timeframe: 'current_month' };
}

// ─── Data Helpers ─────────────────────────────────────────────────────────────
function getExpensesForTimeframe(expenses, timeframe) {
  const now = new Date();
  return expenses.filter(e => {
    const d = new Date(e.date);
    if (timeframe === 'current_month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (timeframe === 'last_month') {
      const pm = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const py = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return d.getMonth() === pm && d.getFullYear() === py;
    }
    if (timeframe === 'last_week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= weekAgo;
    }
    if (timeframe === 'today') {
      return d.toDateString() === now.toDateString();
    }
    return true;
  });
}

function fmt(n) {
  return `₹${Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

// ─── Response Generator ────────────────────────────────────────────────────────
function generateResponse(parsed, context) {
  const { intent, amount, category, timeframe } = parsed;
  const { expenses, budget, predictionData, financialScore, anomalies, formatCurrency } = context;

  const relevantExpenses = getExpensesForTimeframe(expenses, timeframe);
  const totalSpent = relevantExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);

  switch (intent) {
    case 'greeting':
      return `👋 Hey there! I'm your AI Financial Assistant. I can help you with:\n• "Can I spend ₹500 today?"\n• "Where did I spend most this month?"\n• "Will I overspend this month?"\n• "Why is my score low?"\n\nWhat would you like to know?`;

    case 'help':
      return `🤖 Here's what you can ask me:\n\n💰 **Spending:** "How much did I spend on food?"\n📊 **Budget:** "How is my budget looking?"\n🔮 **Prediction:** "Will I overspend this month?"\n🚨 **Anomalies:** "Any unusual transactions?"\n🏆 **Score:** "Why is my score low?"\n💡 **Savings:** "How can I save more?"\n🛒 **Approval:** "Can I spend ₹2000 today?"`;

    case 'can_i_spend': {
      if (!amount) return `Sure, tell me the amount! e.g. "Can I spend ₹500 today?"`;
      const remaining = Math.max(0, budget - (predictionData?.currentMonthSpent || totalSpent));
      const burnRate = predictionData?.dailyBurnRate || 0;
      const daysLeft = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();
      const projectedSpendForRest = burnRate * daysLeft;
      const canAfford = remaining - projectedSpendForRest > amount;
      const afterSpend = remaining - amount;

      if (budget === 0) return `You haven't set a monthly budget yet. Go to Settings to set one first!`;

      if (afterSpend < 0) {
        return `❌ I wouldn't recommend it. Spending ${fmt(amount)} would put you ${fmt(Math.abs(afterSpend))} over your budget. You only have ${fmt(remaining)} left.`;
      }
      if (!canAfford) {
        return `⚠️ Careful — you can technically spend ${fmt(amount)}, but with your current burn rate (${fmt(burnRate)}/day), you might not make it to month-end. Budget remaining: ${fmt(remaining)}.`;
      }
      return `✅ Yes, go for it! After spending ${fmt(amount)} you'll have ${fmt(afterSpend)} left in your budget — comfortably above your projected needs.`;
    }

    case 'top_category': {
      if (relevantExpenses.length === 0) return `No expenses found for ${timeframe.replace('_', ' ')}.`;
      const catTotals = {};
      relevantExpenses.forEach(e => {
        catTotals[e.category] = (catTotals[e.category] || 0) + parseFloat(e.amount);
      });
      const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
      const top3 = sorted.slice(0, 3).map(([ cat, amt], i) =>
        `${i + 1}. ${cat}: ${fmt(amt)} (${((amt / totalSpent) * 100).toFixed(0)}%)`
      ).join('\n');
      return `📊 Your top spending categories (${timeframe.replace('_', ' ')}):\n\n${top3}\n\nTotal: ${fmt(totalSpent)}`;
    }

    case 'anomaly_summary': {
      if (!anomalies || anomalies.length === 0) {
        return `✅ No unusual transactions detected. Your spending looks consistent across all categories!`;
      }
      const top3 = anomalies.slice(0, 3).map(({ expense, anomaly }) =>
        `• ${expense.description} (${expense.category}): ${fmt(expense.amount)} — ${anomaly.label}`
      ).join('\n');
      return `🚨 Found ${anomalies.length} unusual transaction${anomalies.length > 1 ? 's' : ''}:\n\n${top3}`;
    }

    case 'score_explain': {
      if (!financialScore) return `Not enough data to compute your score yet. Add more expenses!`;
      const { score, grade, components } = financialScore;
      const weakest = [...components].sort((a, b) => (a.score / a.maxScore || 0) - (b.score / b.maxScore || 0))[0];
      const topTip = components.filter(c => c.score < 15).map(c => `• **${c.label}**: ${c.detail}`).join('\n') || '• Keep up the good work!';
      return `🏆 Your financial score is **${score}/100** (Grade ${grade}).\n\nAreas to improve:\n${topTip}\n\nFocus on budget adherence and reducing non-essential spending for the biggest score boost.`;
    }

    case 'prediction': {
      if (!predictionData) return `Add more expenses this month to get predictions.`;
      const { projectedMonthlySpend, daysUntilOverspend, dailyBurnRate, severity } = predictionData;
      const icon = severity === 'safe' ? '✅' : severity === 'warning' ? '⚠️' : '🚨';
      let msg = `${icon} **Spending Forecast**\n\n`;
      msg += `• Daily burn rate: ${fmt(dailyBurnRate)}/day\n`;
      msg += `• Expected month-end total: ${fmt(projectedMonthlySpend)}\n`;
      msg += `• Your budget: ${fmt(budget)}\n`;
      if (daysUntilOverspend !== Infinity && daysUntilOverspend >= 0) {
        msg += `• Days until budget exhausted: **${daysUntilOverspend} days**`;
      } else {
        msg += `• You're on track to stay within budget 🎉`;
      }
      return msg;
    }

    case 'category_spend': {
      if (!category) return `Which category? e.g. "How much did I spend on food?"`;
      const capCat = category.charAt(0).toUpperCase() + category.slice(1);
      const catExpenses = relevantExpenses.filter(e => e.category?.toLowerCase() === category);
      const catTotal = catExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);
      if (catExpenses.length === 0) return `No ${capCat} expenses found for ${timeframe.replace('_', ' ')}.`;
      const pct = totalSpent > 0 ? ((catTotal / totalSpent) * 100).toFixed(0) : 0;
      return `🛒 **${capCat}** spending (${timeframe.replace('_', ' ')}):\n\n${fmt(catTotal)} across ${catExpenses.length} transaction${catExpenses.length > 1 ? 's' : ''} (${pct}% of total)`;
    }

    case 'save_tips': {
      const tips = [];
      if (relevantExpenses.length > 0) {
        const catTotals = {};
        relevantExpenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + parseFloat(e.amount); });
        const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
        if (sorted[0]) tips.push(`• Cut ${sorted[0][0]} spending by 20% to save ${fmt(sorted[0][1] * 0.2)}/month`);
        const nonEss = ['Entertainment', 'Shopping', 'Subscriptions'];
        const nonEssTotal = sorted.filter(([c]) => nonEss.includes(c)).reduce((s, [, v]) => s + v, 0);
        if (nonEssTotal > 0) tips.push(`• You spent ${fmt(nonEssTotal)} on non-essentials — this is your biggest saving opportunity`);
      }
      tips.push(`• Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings`);
      tips.push(`• Set category budgets in Settings to get automatic alerts`);
      tips.push(`• The 30-day rule: wait 30 days before any non-essential purchase over ₹2000`);
      return `💡 **Personalized Saving Tips:**\n\n${tips.join('\n')}`;
    }

    case 'total_spend': {
      const tfLabel = timeframe.replace('_', ' ');
      if (relevantExpenses.length === 0) return `No expenses recorded for ${tfLabel}.`;
      return `💳 Total spent (${tfLabel}): **${fmt(totalSpent)}** across ${relevantExpenses.length} transactions.`;
    }

    case 'budget_status': {
      const spent = predictionData?.currentMonthSpent || totalSpent;
      const remaining = Math.max(0, budget - spent);
      const usagePct = budget > 0 ? ((spent / budget) * 100).toFixed(0) : 0;
      const icon = usagePct > 90 ? '🚨' : usagePct > 70 ? '⚠️' : '✅';
      return `${icon} **Budget Status (This Month)**\n\n• Spent: ${fmt(spent)}\n• Budget: ${fmt(budget)}\n• Remaining: ${fmt(remaining)}\n• Used: ${usagePct}%`;
    }

    case 'unknown':
    default:
      return `🤔 I didn't quite understand that. Try asking:\n• "Can I spend ₹1000?"\n• "How much did I spend on food?"\n• "Will I overspend this month?"\n• "Tips to save money"`;
  }
}

// ─── Main exported function ───────────────────────────────────────────────────
export function processMessage(message, context) {
  const parsed = parseIntent(message);
  return generateResponse(parsed, context);
}
