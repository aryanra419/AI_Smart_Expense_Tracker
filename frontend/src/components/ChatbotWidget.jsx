import React, { useState, useRef, useEffect } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { processMessage } from '../utils/chatbot';
import { Bot, X, Send, Sparkles, ChevronDown } from 'lucide-react';

const QUICK_REPLIES = [
    "Can I spend ₹500 today?",
    "Where did I spend most?",
    "Will I overspend this month?",
    "Why is my score low?",
    "Tips to save money",
];

const TypingIndicator = () => (
    <div className="flex items-center gap-1 px-4 py-3">
        {[0, 1, 2].map(i => (
            <span key={i} className="w-2 h-2 rounded-full bg-primary-color/60 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }} />
        ))}
    </div>
);

/**
 * Parse markdown-style bold **text** from bot messages
 */
const BotMessage = ({ text }) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return (
        <span>
            {parts.map((p, i) =>
                p.startsWith('**') && p.endsWith('**')
                    ? <strong key={i} className="font-bold text-white">{p.slice(2, -2)}</strong>
                    : <span key={i}>{p}</span>
            )}
        </span>
    );
};

const ChatbotWidget = () => {
    const expenseCtx = useExpense();
    const { expenses, budget, predictionData, financialScore, anomalies, formatCurrency } = expenseCtx;

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: 'bot', text: "👋 Hi! I'm your AI Financial Assistant. Ask me anything about your spending!\n\nTry: \"Can I spend ₹500 today?\"" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [hasNotif, setHasNotif] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (open) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => inputRef.current?.focus(), 200);
            setHasNotif(false);
        }
    }, [open, messages]);

    // Global "/" shortcut to open chatbot
    useEffect(() => {
        const handler = (e) => {
            if (e.key === '/' && !open && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                setOpen(true);
            }
            if (e.key === 'Escape' && open) setOpen(false);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open]);

    const sendMessage = (text) => {
        const msg = (text || input).trim();
        if (!msg) return;

        setMessages(prev => [...prev, { from: 'user', text: msg }]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const response = processMessage(msg, {
                expenses, budget, predictionData, financialScore, anomalies, formatCurrency
            });
            setMessages(prev => [...prev, { from: 'bot', text: response }]);
            setIsTyping(false);
        }, 600 + Math.random() * 400);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setOpen(o => !o)}
                className="chatbot-fab"
                title="Open AI Assistant (Press /)"
                id="chatbot-fab-btn"
            >
                {open ? <ChevronDown size={22} /> : <Bot size={22} />}
                {hasNotif && !open && <span className="chatbot-notif-dot" />}
            </button>

            {/* Chat Panel */}
            <div className={`chatbot-panel ${open ? 'chatbot-panel--open' : ''}`}>
                {/* Header */}
                <div className="chatbot-header">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary-color/30 flex items-center justify-center">
                            <Sparkles size={16} className="text-primary-color" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white leading-none">AI Assistant</p>
                            <p className="text-[10px] text-emerald-400 font-medium">● Online</p>
                        </div>
                    </div>
                    <button onClick={() => setOpen(false)} className="text-muted hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Messages */}
                <div className="chatbot-messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`chatbot-message-row ${msg.from === 'user' ? 'chatbot-message-row--user' : ''}`}>
                            {msg.from === 'bot' && (
                                <div className="chatbot-bot-avatar">
                                    <Bot size={14} />
                                </div>
                            )}
                            <div className={`chatbot-bubble ${msg.from === 'user' ? 'chatbot-bubble--user' : 'chatbot-bubble--bot'}`}>
                                {msg.from === 'bot'
                                    ? msg.text.split('\n').map((line, j) => (
                                        <React.Fragment key={j}>
                                            <BotMessage text={line} />
                                            {j < msg.text.split('\n').length - 1 && <br />}
                                        </React.Fragment>
                                    ))
                                    : msg.text
                                }
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="chatbot-message-row">
                            <div className="chatbot-bot-avatar"><Bot size={14} /></div>
                            <div className="chatbot-bubble chatbot-bubble--bot">
                                <TypingIndicator />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                <div className="chatbot-quick-replies">
                    {QUICK_REPLIES.map((qr, i) => (
                        <button key={i} className="chatbot-quick-reply-chip" onClick={() => sendMessage(qr)}>
                            {qr}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <div className="chatbot-input-row">
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything... (press /)"
                        className="chatbot-input"
                        id="chatbot-input-field"
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim()}
                        className="chatbot-send-btn"
                        id="chatbot-send-btn"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </>
    );
};

export default ChatbotWidget;
