import React, { useState } from 'react'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import Settings from './components/Settings'
import { ExpenseProvider } from './context/ExpenseContext'
import './App.css'

function App() {
  const [activeView, setActiveView] = useState('dashboard');

  return (
    <ExpenseProvider>
      <Layout activeView={activeView} setView={setActiveView}>
        {activeView === 'dashboard' ? <Dashboard /> : <Settings />}
      </Layout>
    </ExpenseProvider>
  )
}

export default App
