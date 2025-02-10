import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/Auth/AuthProvider';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatsAppBubble from './components/WhatsAppBubble';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import LegalNotice from './pages/LegalNotice';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import TransferForm from './pages/TransferForm';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import TransferSimulator from './components/TransferSimulator';
import InstallPWA from './components/InstallPWA';
import ForgotPasswordForm from './components/Auth/ForgotPasswordForm';
import ResetPasswordForm from './components/Auth/ResetPasswordForm';
import FeesPage from './pages/FeesPage';

function App() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(true);

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-white">
          <Navbar />
          <Routes>
            <Route path="/" element={
              <main className="flex flex-col">
                <Hero />
                <div className="py-12 bg-gray-50">
                  <TransferSimulator />
                </div>
                <HowItWorks />
                <Contact />
              </main>
            } />
            <Route path="/fees" element={<FeesPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordForm />} />
            <Route path="/reset-password" element={<ResetPasswordForm />} />
            <Route path="/conditions-generales" element={<TermsOfService />} />
            <Route path="/politique-de-confidentialite" element={<PrivacyPolicy />} />
            <Route path="/mentions-legales" element={<LegalNotice />} />
            <Route path="/transfer" element={
              <ProtectedRoute>
                <TransferForm />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
          <Footer />
          <WhatsAppBubble />
          {showInstallPrompt && <InstallPWA onClose={() => setShowInstallPrompt(false)} />}
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;