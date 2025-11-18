// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import './App.css';
import './i18n';

// صفحات التطبيق
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import ResetPassword from './pages/ResetPassword';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardLivreur from './pages/DashboardLivreur';
import DashboardClient from './pages/DashboardClient';

// مكون بسيط لفحص الاتصال
const ConnectionStatus = () => {
  React.useEffect(() => {
    console.log("📱 Capacitor Platform:", Capacitor.getPlatform());
    console.log("🚀 App started successfully");
    
    // اختبار اتصال بسيط
    fetch('http://localhost:8080/')
      .then(() => console.log('✅ Local server connected'))
      .catch(() => console.log('❌ Local server not available'));
  }, []);

  return null; // لا يعرض أي واجهة
};

function App() {
  return (
    <Router>
      <div className="App">
        <ConnectionStatus />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard-admin" element={<DashboardAdmin />} />
          <Route path="/dashboard-livreur" element={<DashboardLivreur />} />
          <Route path="/dashboard-client" element={<DashboardClient />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
