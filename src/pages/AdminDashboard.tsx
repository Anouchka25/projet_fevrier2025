import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import TransfersManager from '../components/Admin/TransfersManager';
import UsersManager from '../components/Admin/UsersManager';
import ExchangeRatesManager from '../components/Admin/ExchangeRatesManager';
import TransferFeesManager from '../components/Admin/TransferFeesManager';
import PromoCodesManager from '../components/Admin/PromoCodesManager';
import TransferConditionsManager from '../components/Admin/TransferConditionsManager';
import Navbar from '../components/Navbar';
import { Home, Users, DollarSign, Percent, Tag, Settings, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Stats {
  userCount: number;
  uniqueBeneficiaryCount: number;
  transferStats: {
    direction: string;
    count: number;
    totalAmount: number;
    currency: string;
  }[];
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('transfers');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get test users first
      const { data: testUsers } = await supabase
        .from('users')
        .select('id')
        .in('email', ['alloglacons.ga@gmail.com', 'minkoueobamea@gmail.com']);

      const testUserIds = testUsers?.map(u => u.id) || [];

      // Get all users except test users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .filter('id', 'not.in', `(${testUserIds.join(',')})`);

      if (usersError) throw usersError;

      // Get unique beneficiaries except those from test users
      const { data: beneficiaries, error: beneficiariesError } = await supabase
        .from('beneficiaries')
        .select(`
          email,
          transfers!inner(user_id)
        `)
        .filter('transfers.user_id', 'not.in', `(${testUserIds.join(',')})`);

      if (beneficiariesError) throw beneficiariesError;

      // Count unique beneficiaries
      const uniqueEmails = new Set(beneficiaries?.map(b => b.email));

      // Get completed transfers except from test users
      const { data: transfers, error: transfersError } = await supabase
        .from('transfers')
        .select('*')
        .eq('status', 'completed')
        .filter('user_id', 'not.in', `(${testUserIds.join(',')})`);

      if (transfersError) throw transfersError;

      // Aggregate transfer stats by direction
      const statsByDirection = transfers?.reduce((acc, transfer) => {
        // Skip if no direction
        if (!transfer.direction) return acc;

        if (!acc[transfer.direction]) {
          acc[transfer.direction] = {
            direction: transfer.direction,
            count: 0,
            totalAmount: 0,
            currency: transfer.sender_currency
          };
        }
        acc[transfer.direction].count++;
        acc[transfer.direction].totalAmount += Number(transfer.amount_sent);
        return acc;
      }, {} as Record<string, any>);

      setStats({
        userCount: users?.length || 0,
        uniqueBeneficiaryCount: uniqueEmails.size,
        transferStats: Object.values(statsByDirection || {})
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Une erreur est survenue lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const cleanupTestData = async () => {
    try {
      setCleanupLoading(true);
      setError(null);

      // Get test users first
      const { data: testUsers } = await supabase
        .from('users')
        .select('id')
        .in('email', ['alloglacons.ga@gmail.com', 'minkoueobamea@gmail.com']);

      if (testUsers && testUsers.length > 0) {
        const testUserIds = testUsers.map(u => u.id);

        // First get all transfers from test users
        const { data: testTransfers } = await supabase
          .from('transfers')
          .select('id')
          .in('user_id', testUserIds);

        if (testTransfers && testTransfers.length > 0) {
          const transferIds = testTransfers.map(t => t.id);

          // Delete notifications first
          await supabase
            .from('notifications')
            .delete()
            .in('transfer_id', transferIds);

          // Then delete beneficiaries
          await supabase
            .from('beneficiaries')
            .delete()
            .in('transfer_id', transferIds);

          // Finally delete transfers
          await supabase
            .from('transfers')
            .delete()
            .in('user_id', testUserIds);
        }

        // Refresh stats
        await fetchStats();
        alert('Les données de test ont été supprimées avec succès');
      } else {
        alert('Aucune donnée de test à supprimer');
      }
    } catch (error) {
      console.error('Error cleaning up test data:', error);
      setError('Une erreur est survenue lors de la suppression des données de test');
    } finally {
      setCleanupLoading(false);
    }
  };

  const getDirectionLabel = (direction: string) => {
    const directions: Record<string, string> = {
      'FRANCE_TO_GABON': 'France → Gabon',
      'GABON_TO_FRANCE': 'Gabon → France',
      'GABON_TO_CHINA': 'Gabon → Chine',
      'USA_TO_GABON': 'États-Unis → Gabon',
      'GABON_TO_USA': 'Gabon → États-Unis',
      'CANADA_TO_GABON': 'Canada → Gabon',
      'GABON_TO_CANADA': 'Gabon → Canada'
    };
    return directions[direction] || direction;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administration KundaPay</h1>
          <div className="flex gap-4">
            <button
              onClick={() => cleanupTestData()}
              disabled={cleanupLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              {cleanupLoading ? 'Suppression...' : 'Supprimer données test'}
            </button>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700"
            >
              <Home className="h-5 w-5 mr-2" />
              Retour à l'accueil
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques globales */}
        {!loading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Utilisateurs</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.userCount}</p>
              <p className="text-sm text-gray-500">expéditeurs enregistrés</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Bénéficiaires uniques</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.uniqueBeneficiaryCount}</p>
              <p className="text-sm text-gray-500">bénéficiaires distincts</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm col-span-1 md:col-span-2 lg:col-span-1">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Transferts terminés</h3>
              <div className="space-y-3">
                {stats.transferStats.map((stat) => (
                  <div key={stat.direction} className="flex justify-between items-center">
                    <span className="text-gray-600">{getDirectionLabel(stat.direction)}</span>
                    <div className="text-right">
                      <span className="font-medium text-yellow-600">
                        {stat.totalAmount.toLocaleString('fr-FR')} {stat.currency}
                      </span>
                      <span className="text-gray-500 text-sm block">
                        ({stat.count} transfert{stat.count > 1 ? 's' : ''})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white p-1 rounded-lg shadow-sm mb-6">
            <TabsTrigger value="transfers" className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Transferts
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="rates" className="flex items-center">
              <Percent className="h-4 w-4 mr-2" />
              Taux de change
            </TabsTrigger>
            <TabsTrigger value="fees" className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Frais
            </TabsTrigger>
            <TabsTrigger value="promo" className="flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              Codes promo
            </TabsTrigger>
            <TabsTrigger value="conditions" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Conditions
            </TabsTrigger>
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

            <TabsContent value="conditions">
              <TransferConditionsManager />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;