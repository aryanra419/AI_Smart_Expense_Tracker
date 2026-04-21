import React, { useState } from 'react'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import Settings from './components/Settings'
import ChatbotWidget from './components/ChatbotWidget'
import AnomalyAlert from './components/AnomalyAlert'
import { ExpenseProvider, useExpense } from './context/ExpenseContext'
import './App.css'

// Inner component has access to context for the anomaly alert
function AppInner({ activeView, setActiveView }) {
  const { pendingAnomaly, clearPendingAnomaly } = useExpense();
  return (
    <>
      <Layout activeView={activeView} setView={setActiveView}>
        {activeView === 'dashboard' ? <Dashboard /> : <Settings />}
      </Layout>
      {/* These are rendered at the TOP level — outside any overflow container
          so position:fixed always anchors to the real viewport */}
      <ChatbotWidget />
      <AnomalyAlert anomaly={pendingAnomaly} onDismiss={clearPendingAnomaly} />
    </>
  );
}

function App() {
  const [activeView, setActiveView] = useState('dashboard');

  return (
    <ExpenseProvider>
      <AppInner activeView={activeView} setActiveView={setActiveView} />
    </ExpenseProvider>
  )
}

export default App
