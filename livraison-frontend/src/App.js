// App.js - النسخة المصححة مع المسارات الصحيحة
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

// استيراد المكونات من مجلد pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
// يمكنك إضافة المكونات الأخرى لاحقاً
import DashboardAdmin from './pages/DashboardAdmin.jsx';
import DashboardClient from './pages/DashboardClient.jsx';
import DashboardLivreur from './pages/DashboardLivreur.jsx';
import VerifyOtp from './pages/VerifyOtp.jsx';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <div className="App">
          <Routes>
            {/* 🔐 مسارات المصادقة */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* 🏠 مسارات Dashboard (معلق حالياً) */}
            {<Route path="/dashboard-admin" element={<DashboardAdmin />} />}
            {<Route path="/dashboard-client" element={<DashboardClient />} />}
            {<Route path="/dashboard-livreur" element={<DashboardLivreur />} />}
            <Route path="/verify-otp" element={<VerifyOtp />} />
            {/* 🔀 إعادة التوجيه للصفحة الرئيسية */}
            <Route path="*" element={<Login />} />
          </Routes>
        </div>
      </Router>
    </I18nextProvider>
  );
}

export default App;