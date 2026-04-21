import React, { useState, useRef } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { PlusCircle, Camera, Loader2, CheckCircle2, Sparkles, Search } from 'lucide-react';
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
        addExpense({ description, amount: parseFloat(amount), category: category || undefined });
        resetForm();
    };

    const resetForm = () => {
        setDescription(''); setAmount(''); setCategory(''); setScanSuccess(false);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsScanning(true); setScanSuccess(false);
        try {
            const data = await parseReceipt(file);
            if (data.description) setDescription(data.description);
            if (data.amount) setAmount(data.amount.toString());
            setScanSuccess(true);
            setTimeout(() => setScanSuccess(false), 3000);
        } catch (err) {
            alert("Could not read receipt. Please try another image.");
        } finally {
            setIsScanning(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: '20px',
            padding: '1.75rem',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Scanning overlay */}
            {isScanning && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 10,
                    background: 'rgba(6,11,20,0.85)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                    borderRadius: '20px',
                }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: '16px',
                        background: 'rgba(99,102,241,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Loader2 className="animate-spin" size={24} color="#818cf8" />
                    </div>
                    <p style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>Scanning Receipt…</p>
                    <p style={{ color: '#64748b', fontSize: '0.75rem' }}>AI extracting details</p>
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>
                        Add Expense
                    </h3>
                    <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Track your spending</p>
                </div>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '0.45rem 0.875rem',
                        background: scanSuccess ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.1)',
                        border: `1px solid ${scanSuccess ? 'rgba(16,185,129,0.25)' : 'rgba(99,102,241,0.25)'}`,
                        borderRadius: '10px',
                        color: scanSuccess ? '#34d399' : '#818cf8',
                        fontSize: '0.72rem', fontWeight: 700,
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                    }}
                >
                    {scanSuccess ? <CheckCircle2 size={13} /> : <Camera size={13} />}
                    {scanSuccess ? 'Scanned!' : 'Scan Receipt'}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" style={{ display: 'none' }} />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Description */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem' }}>
                        Description
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Search size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                        <input
                            type="text"
                            placeholder="e.g. Netflix, Groceries, Uber…"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>
                </div>

                {/* Amount + Category */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem' }}>
                            Amount (₹)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem' }}>
                            Category
                        </label>
                        <select value={category} onChange={e => setCategory(e.target.value)}>
                            <option value="">✨ Auto-detect</option>
                            {categories.filter(c => c.name !== 'Other').map(cat => (
                                <option key={cat.name} value={cat.name}>{cat.name}</option>
                            ))}
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%', marginTop: '0.25rem' }}
                >
                    <PlusCircle size={17} strokeWidth={2.5} />
                    Add Expense
                </button>
            </form>
        </div>
    );
};

export default ExpenseForm;
