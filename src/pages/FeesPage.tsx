import React from 'react';
import Fees from '../components/Fees';
import PaymentMethods from '../components/PaymentMethods';

const FeesPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-12">
          Frais et moyens de paiement
        </h1>
        <Fees />
        <PaymentMethods />
      </div>
    </div>
  );
};

export default FeesPage;