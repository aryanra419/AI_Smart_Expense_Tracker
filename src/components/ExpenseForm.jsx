import React, { useState, useRef } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { PlusCircle, Search, Camera, Loader2, CheckCircle2 } from 'lucide-react';
import { categories } from '../utils/categorize';
import { parseReceipt } from '../utils/ocrParser';

const ExpenseForm = () => {
    const { addExpense } = useExpense();
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanSuccess, setScanSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!description || !amount) return;

        addExpense({
            description,
            amount: parseFloat(amount),
            category: category || undefined 
        });

        resetForm();
    };

    const resetForm = () => {
        setDescription('');
        setAmount('');
        setCategory('');
        setScanSuccess(false);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsScanning(true);
        setScanSuccess(false);

        try {
            const data = await parseReceipt(file);
            console.log("Scanned Data:", data);
            
            if (data.description) setDescription(data.description);
            if (data.amount) setAmount(data.amount.toString());
            
            setScanSuccess(true);
            // Hide success after 3 seconds
            setTimeout(() => setScanSuccess(false), 3000);
        } catch (error) {
            console.error("OCR Scan Failed:", error);
            alert("Could not read receipt. Please try another image or enter manually.");
        } finally {
            setIsScanning(false);
            // Clear input so same file can be scanned again if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const triggerFileSelect = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    return (
        <div className="glass glass-panel border-primary-color/20 bg-primary-color/5 h-full relative overflow-hidden">
            {isScanning && (
                <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
                    <Loader2 className="text-primary-color animate-spin mb-4" size={48} />
                    <p className="text-white font-bold animate-pulse">AI Scanning Receipt...</p>
                    <p className="text-xs text-muted mt-2">Extracting totals and merchant info</p>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Add Transaction</h3>
                <button 
                    type="button"
                    onClick={triggerFileSelect}
                    className="flex items-center gap-2 text-xs font-bold text-primary-color hover:text-white transition-colors bg-primary-color/10 px-3 py-1.5 rounded-full border border-primary-color/20"
                >
                    <Camera size={14} />
                    {scanSuccess ? <span className="text-success-color flex items-center gap-1"><CheckCircle2 size={12}/> Scanned!</span> : 'Scan Receipt'}
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept="image/*" 
                    className="hidden" 
                />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider">Description</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="What did you buy? (e.g. Netflix, Burger)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="pl-10"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-muted uppercase tracking-wider">Amount (₹)</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-muted uppercase tracking-wider">Category (Auto)</label>
                        <select 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">AI Detect</option>
                            {categories.filter(c => c.name !== 'Other').map(cat => (
                                <option key={cat.name} value={cat.name}>{cat.name}</option>
                            ))}
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="btn-primary flex items-center justify-center gap-2 mt-2 py-4 shadow-lg shadow-primary-glow/20"
                >
                    <PlusCircle size={20} />
                    <span>Add Expense</span>
                </button>
            </form>
        </div>
    );
};

export default ExpenseForm;
