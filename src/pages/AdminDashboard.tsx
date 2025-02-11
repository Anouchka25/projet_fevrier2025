import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import TransfersManager from '../components/Admin/TransfersManager';
import UsersManager from '../components/Admin/UsersManager';
import ExchangeRatesManager from '../components/Admin/ExchangeRatesManager';
import TransferFeesManager from '../components/Admin/TransferFeesManager';
import PromoCodesManager from '../components/Admin/PromoCodesManager';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('transfers');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Administration KundaPay</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white p-1 rounded-lg shadow-sm mb-6">
            <TabsTrigger value="transfers">Transferts</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="rates">Taux de change</TabsTrigger>
            <TabsTrigger value="fees">Frais</TabsTrigger>
            <TabsTrigger value="promo">Codes promo</TabsTrigger>
          </TabsList>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <TabsContent value="transfers">
              <TransfersManager />
            </TabsContent>

            <TabsContent value="users">
              <UsersManager />
            </TabsContent>

            <TabsContent value="rates">
              <ExchangeRatesManager />
            </TabsContent>

            <TabsContent value="fees">
              <TransferFeesManager />
            </TabsContent>

            <TabsContent value="promo">
              <PromoCodesManager />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;