import React from 'react';
import { LayoutDashboard, Receipt, TrendingUp, Settings } from 'lucide-react';

const Layout = ({ children, activeView, setView }) => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Desktop Only for now */}
      <aside className="w-64 glass m-4 mr-0 p-6 flex flex-col gap-8 hidden md:flex">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-primary-color p-2 rounded-lg text-white">
            <Receipt size={24} />
          </div>
          <h1 className="text-xl font-bold font-heading uppercase tracking-widest text-white">SmartExp</h1>
        </div>
        
        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeView === 'dashboard' ? 'bg-primary-color text-white shadow-lg shadow-primary-color/20' : 'text-muted hover:bg-white/5 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-semibold text-sm">Dashboard</span>
          </button>
          
          <button 
            onClick={() => setView('settings')}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeView === 'settings' ? 'bg-primary-color text-white shadow-lg shadow-primary-color/20' : 'text-muted hover:bg-white/5 hover:text-white'}`}
          >
            <Settings size={20} />
            <span className="font-semibold text-sm">Settings</span>
          </button>
        </nav>

        <div className="mt-auto glass-panel bg-primary-color/10 border-primary-color/20">
          <p className="text-sm text-primary-color font-medium mb-1">Weekly Goal</p>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div className="bg-primary-color h-full w-[65%]"></div>
          </div>
          <p className="text-xs mt-2 text-muted">65% of budget reached</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">Welcome Back!</h2>
            <p className="text-muted">Here's what's happening with your money today.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="btn-icon">
              <Settings size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600"></div>
          </div>
        </header>
        
        {children}
      </main>
    </div>
  );
};

export default Layout;
