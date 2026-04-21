export const categories = [
  { name: 'Food', keywords: ['pizza', 'burger', 'restaurant', 'mcdonalds', 'kfc', 'lunch', 'dinner', 'breakfast', 'starbucks', 'cafe', 'grocery', 'supermarket', 'food', 'swiggy', 'zomato'] },
  { name: 'Transport', keywords: ['uber', 'lyft', 'taxi', 'bus', 'train', 'gas', 'petrol', 'fuel', 'metro', 'commute', 'transport', 'ola'] },
  { name: 'Utilities', keywords: ['electricity', 'water', 'internet', 'wifi', 'rent', 'garbage', 'utilities', 'recharge', 'bill'] },
  { name: 'Entertainment', keywords: ['netflix', 'cinema', 'movie', 'spotify', 'gaming', 'steam', 'playstation', 'xbox', 'entertainment', 'concert', 'hulu'] },
  { name: 'Health', keywords: ['pharmacy', 'doctor', 'hospital', 'medicine', 'gym', 'fitness', 'health', 'clinic', 'apollo'] },
  { name: 'Shopping', keywords: ['amazon', 'flipkart', 'clothing', 'fashion', 'shoes', 'electronics', 'mall', 'shopping', 'myntra'] },
  { name: 'Subscriptions', keywords: ['subscription', 'monthly', 'annual', 'premium', 'service', 'prime'] },
  { name: 'Investment', keywords: ['stock', 'crypto', 'bitcoin', 'mutual fund', 'deposit', 'investment', 'savings', 'equity'] },
  { name: 'Education', keywords: ['course', 'book', 'tuition', 'learning', 'udemy', 'coursera', 'education'] },
  { name: 'Travel', keywords: ['flight', 'hotel', 'airbnb', 'vacation', 'travel', 'booking'] },
  { name: 'Other', keywords: [] }
];

export function autoCategorize(description) {
  if (!description) return 'Other';
  const descLower = description.toLowerCase();
  
  for (const category of categories) {
    if (category.keywords.length > 0) {
      if (category.keywords.some(keyword => descLower.includes(keyword))) {
        return category.name;
      }
    }
  }
  
  return 'Other';
}
