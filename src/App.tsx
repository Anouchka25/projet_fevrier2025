import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/Auth/AuthProvider';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatsAppBubble from './components/WhatsAppBubble';
import TransferSimulator from './components/TransferSimulator';
import PaymentMethods from './components/PaymentMethods';
import LocalPayments from './components/LocalPayments';
import CountryFlags from './components/CountryFlags';
import AuthForm from './components/Auth/AuthForm';
import TransferForm from './components/TransferForm';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import ResetPasswordForm from './components/Auth/ResetPasswordForm';
import LegalNotice from './pages/LegalNotice';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Procedures from './pages/Procedures';
import PromoMessage from "./components/PromoMessage";
import InstallPWA from './components/InstallPWA';
import CookieConsent from './components/CookieConsent';
import DiscountPopup from "./components/DiscountPopup";

function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="flex flex-col">
       {/*  <DiscountPopup /> ✅ Popup s'affiche au chargement */}
        <Hero />
        {/*<PromoMessage />*/}
        <TransferSimulator />
        <CountryFlags />
        <HowItWorks />
        <PaymentMethods />
        <LocalPayments />
        <Contact />
      </main>
      <Footer />
      <WhatsAppBubble />
      <InstallPWA />
      <CookieConsent />
    </div>
  );
}

function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Écouter les messages du Service Worker
    navigator.serviceWorker?.addEventListener('message', (event) => {
      if (event.data.type === 'UPDATE_AVAILABLE') {
        setUpdateAvailable(true);
      }
    });
  }, []);

  const handleUpdate = () => {
    // Recharger la page pour activer la nouvelle version
    window.location.reload();
  };

  return (
    <Router>
      <AuthProvider>
        {updateAvailable && (
          <div className="fixed bottom-4 left-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg shadow-lg z-50 flex justify-between items-center">
            <p>Une nouvelle version est disponible !</p>
            <button
              onClick={handleUpdate}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Mettre à jour
            </button>
          </div>
        )}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/reset-password" element={<ResetPasswordForm />} />
          <Route path="/mentions-legales" element={<LegalNotice />} />
          <Route path="/politique-de-confidentialite" element={<PrivacyPolicy />} />
          <Route path="/conditions-generales" element={<TermsOfService />} />
          <Route path="/Procedures" element={<Procedures />} />
          <Route 
            path="/transfer" 
            element={
              <ProtectedRoute>
                <TransferForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;