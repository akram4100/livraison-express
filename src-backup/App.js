// App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import ResetPassword from './pages/ResetPassword';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardClient from './pages/DashboardClient';
import DashboardLivreur from './pages/DashboardLivreur';
import './App.css';
import './i18n';

// 🔹 إنشاء Context لإدارة الوضع الليلي عالمياً
import { createContext, useContext } from 'react';

const DarkModeContext = createContext();

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

const DarkModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    
    if (savedDarkMode) {
      document.body.classList.add('dark-mode-global');
      document.body.style.background = '#1a1a1a';
    } else {
      document.body.classList.remove('dark-mode-global');
      document.body.style.background = '';
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.body.classList.add('dark-mode-global');
      document.body.style.background = '#1a1a1a';
    } else {
      document.body.classList.remove('dark-mode-global');
      document.body.style.background = '';
    }
  };

  const value = {
    darkMode,
    toggleDarkMode,
    setDarkMode
  };

  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  );
};

function App() {
  const isAuthenticated = () => {
    return localStorage.getItem('user') !== null;
  };

  const getUserRole = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role;
  };

  return (
    <DarkModeProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* 🔹 المسارات العامة - بدون props */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* 🔹 المسارات المحمية - بدون props */}
            <Route 
              path="/dashboard-admin" 
              element={
                isAuthenticated() && getUserRole() === 'admin' ? 
                <DashboardAdmin /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/dashboard-client" 
              element={
                isAuthenticated() ? 
                <DashboardClient /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/dashboard-livreur" 
              element={
                isAuthenticated() && getUserRole() === 'livreur' ? 
                <DashboardLivreur /> : 
                <Navigate to="/login" />
              } 
            />
            
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </DarkModeProvider>
  );
}

export default App;