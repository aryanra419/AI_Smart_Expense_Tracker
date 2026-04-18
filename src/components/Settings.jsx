import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { Save, ShieldCheck, PieChart, Wallet } from 'lucide-react';
import { categories } from '../utils/categorize';

const Settings = () => {
    const { budget, categoryBudgets, updateBudget, formatCurrency } = useExpense();
    const [tempBudget, setTempBudget] = useState(budget);
    const [tempCategoryBudgets, setTempCategoryBudgets] = useState({ ...categoryBudgets });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleSave = async () => {
        setIsSaving(true);
        setMessage('');
        try {
            await updateBudget('total', parseFloat(tempBudget));
            for (const [cat, val] of Object.entries(tempCategoryBudgets)) {
                await updateBudget(cat, parseFloat(val));
            }
            setMessage('Budget settings updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Failed to update settings. Please try again.');
        }
        setIsSaving(false);
    };

    const updateCategoryBudget = (cat, val) => {
        setTempCategoryBudgets(prev => ({ ...prev, [cat]: val }));
    };

    return (
        <div className="flex flex-col gap-10 animate-fade-in max-w-4xl">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-bold text-white tracking-tight">Budget Control</h2>
                    <p className="text-muted mt-1">Configure your monthly financial boundaries</p>
                </div>
                {message && (
                    <div className="px-4 py-2 bg-success-color/20 text-success-color rounded-lg text-sm font-medium border border-success-color/20 animate-bounce-in">
                        {message}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Global Budget Settings */}
                <div className="flex flex-col gap-6">
                    <div className="glass-panel p-8 flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-color/20 rounded-lg text-primary-color">
                                <Wallet size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Global Monthly Limit</h3>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-muted uppercase tracking-widest">Total Budget (₹)</label>
                            <input 
                                type="number" 
                                value={tempBudget}
                                onChange={(e) => setTempBudget(e.target.value)}
                                className="glass-input text-2xl font-bold p-4 rounded-xl"
                                placeholder="e.g. 5000"
                            />
                            <p className="text-[10px] text-muted font-medium">This is your hard limit for the entire month across all categories.</p>
                        </div>
                    </div>

                    <div className="glass-panel p-8 bg-primary-color/5 border-primary-color/20 flex items-start gap-4">
                        <div className="text-primary-color mt-1">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white mb-1">Smart Alerts Enabled</h4>
                            <p className="text-xs text-muted leading-relaxed">
                                You will receive browser notifications once you cross 90% and 100% of these limits.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Category-wise Settings */}
                <div className="glass-panel p-8 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary-color/20 rounded-lg text-secondary-color">
                            <PieChart size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Category Goals</h3>
                    </div>

                    <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                        {categories.filter(c => c.name !== 'Other').map(cat => (
                            <div key={cat.name} className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-white">{cat.name}</span>
                                    <span className="text-[10px] text-muted font-mono uppercase">{formatCurrency(tempCategoryBudgets[cat.name] || 0)}</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max={tempBudget}
                                    step="500"
                                    value={tempCategoryBudgets[cat.name] || 0}
                                    onChange={(e) => updateCategoryBudget(cat.name, e.target.value)}
                                    className="accent-primary-color h-1 cursor-pointer"
                                />
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold mt-4 shadow-xl shadow-primary-color/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Save size={20} />
                                Save Budget Settings
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
