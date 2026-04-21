export function generateInsights(expenses) {
  const insights = [];
  
  if (expenses.length === 0) return [{ text: "Start adding expenses to get AI-powered insights!", type: 'info' }];
  
  const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const categoryTotals = {};
  
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + parseFloat(exp.amount);
  });
  
  // 🍔 Food & Dining Insight
  if (categoryTotals['Food'] > totalSpent * 0.35) {
    insights.push({
      text: "You're spending over 35% of your budget on Food. Consider reducing dining out to save more.",
      type: 'warning',
      icon: 'Utensils'
    });
  } else if (categoryTotals['Food'] > 0) {
    insights.push({
      text: "Your food spending is well within the healthy range. Great job!",
      type: 'success',
      icon: 'CheckCircle'
    });
  }
  
  // 🛍️ Shopping Trends
  if (categoryTotals['Shopping'] > totalSpent * 0.20) {
    insights.push({
      text: "Shopping expenses are high this month (20%+ of total). Try the '30-day rule' before big purchases.",
      type: 'warning',
      icon: 'ShoppingBag'
    });
  }

  // Advanced Pattern: Behavioral Spending
  const weekendDays = [0, 6];
  const lateNightHours = [22, 23, 0, 1, 2, 3, 4];
  
  const weekendSpending = expenses
    .filter(e => weekendDays.includes(new Date(e.date).getDay()))
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const lateNightSpending = expenses
    .filter(e => lateNightHours.includes(new Date(e.date).getHours()))
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);

  if (weekendSpending > totalSpent * 0.5 && expenses.length > 3) {
    insights.push({
      type: 'warning',
      icon: 'Zap',
      text: "You are a 'Weekend Warrior'! Over 50% of your total spending happens on Saturday and Sunday.",
    });
  }

  if (lateNightSpending > 0 && expenses.some(e => lateNightHours.includes(new Date(e.date).getHours()))) {
     const count = expenses.filter(e => lateNightHours.includes(new Date(e.date).getHours())).length;
     if (count >= 3) {
        insights.push({
          type: 'warning',
          icon: 'Moon',
          text: `Late-night ordering habit detected! You've made ${count} purchases between 10PM and 4AM.`,
        });
     }
  }

  // 📂 Subscriptions Check
  if (categoryTotals['Subscriptions'] > 5000) {
    insights.push({
      text: "You have over ₹5,000 in monthly subscriptions. Are you using all of them?",
      type: 'tip',
      icon: 'Zap'
    });
  }
  
  // 💰 Savings Potential
  const potentialSavings = (totalSpent * 0.1).toFixed(0);
  insights.push({
    text: `Based on your patterns, you could easily save ₹${potentialSavings} by cutting 10% of non-essential spending.`,
    type: 'success',
    icon: 'TrendingDown'
  });

  // 📈 High Velocity Spending
  if (expenses.length > 10 && (totalSpent / expenses.length) > 50) {
    insights.push({
      text: "Your average transaction value is high. Consider bulk buying for frequent items.",
      type: 'tip',
      icon: 'BarChart'
    });
  }

  // 📉 Default Tip
  if (insights.length < 3) {
    insights.push({
      text: "Tip: Try to keep your fixed costs (Rent, Utilities) below 50% of your total income.",
      type: 'info',
      icon: 'Lightbulb'
    });
  }

  return insights;
}
