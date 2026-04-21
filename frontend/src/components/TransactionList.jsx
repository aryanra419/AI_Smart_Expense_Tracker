import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import {
  Trash2, Utensils, Car, Zap, Film, Heart, ShoppingBag,
  CreditCard, TrendingUp, BookOpen, Plane, HelpCircle,
  AlertOctagon, Receipt, Search
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Food': Utensils, 'Transport': Car, 'Utilities': Zap,
  'Entertainment': Film, 'Health': Heart, 'Shopping': ShoppingBag,
  'Subscriptions': CreditCard, 'Investment': TrendingUp,
  'Education': BookOpen, 'Travel': Plane, 'Other': HelpCircle,
};

const CATEGORY_COLORS = {
  'Food': '#f97316', 'Transport': '#06b6d4', 'Utilities': '#eab308',
  'Entertainment': '#a855f7', 'Health': '#ec4899', 'Shopping': '#f43f5e',
  'Subscriptions': '#6366f1', 'Investment': '#10b981',
  'Education': '#3b82f6', 'Travel': '#8b5cf6', 'Other': '#64748b',
};

const TransactionList = () => {
  const { expenses, deleteExpense, anomalies } = useExpense();
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const anomalyMap = {};
  (anomalies || []).forEach(({ expense, anomaly }) => {
    if (expense.id) anomalyMap[expense.id] = anomaly;
  });

  const filtered = expenses
    .slice()
    .reverse()
    .filter(e =>
      !search ||
      e.description?.toLowerCase().includes(search.toLowerCase()) ||
      e.category?.toLowerCase().includes(search.toLowerCase())
    );

  const handleDelete = async (id) => {
    setDeletingId(id);
    await deleteExpense(id);
    setDeletingId(null);
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '24px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem 1.75rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 34, height: 34, borderRadius: '10px',
            background: 'rgba(99,102,241,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Receipt size={16} color="#818cf8" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>
              Transactions
            </h3>
            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '1px' }}>
              {expenses.length} total · {(anomalies || []).length} flagged
            </p>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '220px' }}>
          <Search size={14} style={{
            position: 'absolute', left: '0.75rem', top: '50%',
            transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none'
          }} />
          <input
            type="text"
            placeholder="Search transactions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', paddingLeft: '2.25rem', paddingTop: '0.5rem',
              paddingBottom: '0.5rem', fontSize: '0.8rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', color: 'white',
            }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{
            padding: '4rem 2rem', textAlign: 'center', opacity: 0.4,
          }}>
            <Receipt size={36} color="#64748b" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem' }}>
              {search ? 'No matching transactions' : 'No transactions yet'}
            </p>
            <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {search ? 'Try a different search term' : 'Add your first expense above!'}
            </p>
          </div>
        ) : (
          filtered.map((expense, index) => {
            const Icon = CATEGORY_ICONS[expense.category] || HelpCircle;
            const catColor = CATEGORY_COLORS[expense.category] || '#64748b';
            const anomalyInfo = anomalyMap[expense.id];
            const isDeleting = deletingId === expense.id;

            return (
              <div
                key={expense.id}
                className="group"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.75rem',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  transition: 'background 0.2s',
                  background: anomalyInfo ? 'rgba(245,158,11,0.03)' : 'transparent',
                  opacity: isDeleting ? 0.4 : 1,
                  animationDelay: `${index * 0.04}s`,
                }}
                onMouseEnter={e => { if (!anomalyInfo) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                onMouseLeave={e => { if (!anomalyInfo) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Left: Icon + Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '12px', flexShrink: 0,
                    background: `${catColor}18`,
                    border: `1px solid ${catColor}28`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={18} color={catColor} strokeWidth={2} />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <p style={{
                        color: 'white', fontWeight: 600, fontSize: '0.875rem',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {expense.description}
                      </p>
                      {anomalyInfo && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '3px',
                          padding: '2px 6px', borderRadius: '6px', fontSize: '0.62rem', fontWeight: 700,
                          letterSpacing: '0.04em', textTransform: 'uppercase', flexShrink: 0,
                          background: anomalyInfo.level === 'high' ? 'rgba(239,68,68,0.12)' : 'rgba(234,179,8,0.12)',
                          border: `1px solid ${anomalyInfo.level === 'high' ? 'rgba(239,68,68,0.25)' : 'rgba(234,179,8,0.25)'}`,
                          color: anomalyInfo.level === 'high' ? '#f87171' : '#facc15',
                        }}>
                          <AlertOctagon size={9} />
                          {anomalyInfo.label}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 600, padding: '1px 7px', borderRadius: '5px',
                        background: `${catColor}15`, color: catColor, letterSpacing: '0.03em',
                      }}>
                        {expense.category}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        {new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount + Delete */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'white', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}>
                      −₹{parseFloat(expense.amount).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    disabled={isDeleting}
                    style={{
                      width: 32, height: 32, borderRadius: '9px',
                      background: 'transparent', color: '#64748b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: 'all 0.2s',
                      border: '1px solid transparent',
                    }}
                    className="group-hover-delete"
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(244,63,94,0.12)';
                      e.currentTarget.style.color = '#f43f5e';
                      e.currentTarget.style.borderColor = 'rgba(244,63,94,0.2)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#64748b';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Show delete btns on row hover via CSS */}
      <style>{`
        .group:hover .group-hover-delete { opacity: 1 !important; }
      `}</style>
    </div>
  );
};

export default TransactionList;
