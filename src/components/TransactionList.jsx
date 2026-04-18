import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { Trash2, Utensils, Car, Zap, Film, Heart, ShoppingBag, CreditCard, TrendingUp, BookOpen, Plane, HelpCircle } from 'lucide-react';

const CATEGORY_ICONS = {
    'Food': Utensils,
    'Transport': Car,
    'Utilities': Zap,
    'Entertainment': Film,
    'Health': Heart,
    'Shopping': ShoppingBag,
    'Subscriptions': CreditCard,
    'Investment': TrendingUp,
    'Education': BookOpen,
    'Travel': Plane,
    'Other': HelpCircle
};

const TransactionList = () => {
    const { expenses, deleteExpense } = useExpense();

    return (
        <div className="glass glass-panel border-white/5 bg-white/5">
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-bold text-white tracking-tight">Recent Transactions</h3>
                <span className="text-xs font-bold text-muted bg-white/5 px-3 py-1.5 rounded-full border border-white/5 uppercase tracking-widest">
                    {expenses.length} Total
                </span>
            </div>

            <div className="flex flex-col gap-4">
                {expenses.length === 0 ? (
                    <div className="text-center py-20 opacity-40">
                        <p className="text-lg">No transactions yet.</p>
                        <p className="text-sm">Start by adding your first expense above!</p>
                    </div>
                ) : (
                    expenses.slice().reverse().map((expense, index) => {
                        const Icon = CATEGORY_ICONS[expense.category] || CreditCard;
                        return (
                            <div 
                                key={expense.id} 
                                className="group flex items-center justify-between p-6 rounded-2xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/5"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-primary-color/10 text-primary-color rounded-2xl group-hover:scale-110 transition-transform">
                                        <Icon size={24} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-white font-bold text-lg">{expense.description}</p>
                                        <p className="text-sm text-muted font-medium">{expense.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <span className="text-white font-bold text-xl block">
                                            -₹{parseFloat(expense.amount).toLocaleString('en-IN')}
                                        </span>
                                        <span className="text-[11px] text-muted font-bold uppercase tracking-widest">
                                            {new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => deleteExpense(expense.id)}
                                        className="p-3 text-muted hover:text-danger-color hover:bg-danger-color/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default TransactionList;
