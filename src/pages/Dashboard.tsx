import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/Auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { ArrowRight } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Transfer = Database['public']['Tables']['transfers']['Row'];
type User = Database['public']['Tables']['users']['Row'];
type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];

interface TransferWithBeneficiary extends Transfer {
  beneficiaries: Beneficiary[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [transfers, setTransfers] = useState<TransferWithBeneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user?.id) return;

        // Récupérer le profil utilisateur
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Récupérer les transferts avec les bénéficiaires
        const { data: transfersData, error: transfersError } = await supabase
          .from('transfers')
          .select(`
            *,
            beneficiaries (*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (transfersError) throw transfersError;
        setTransfers(transfersData as TransferWithBeneficiary[]);
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError('Une erreur est survenue lors du chargement de vos données');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bouton pour faire un nouveau transfert */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Faire un nouveau transfert
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>

        {/* Informations du profil */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Mon Profil</h2>
          {profile && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Nom complet</p>
                <p className="text-lg font-medium text-gray-900">
                  {profile.first_name} {profile.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-lg font-medium text-gray-900">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pays</p>
                <p className="text-lg font-medium text-gray-900">
                  {profile.country === 'GA' ? 'Gabon' : 
                   profile.country === 'FR' ? 'France' : 
                   profile.country === 'CN' ? 'Chine' : profile.country}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Membre depuis</p>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(profile.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Historique des transferts */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Historique des transferts</h2>
          </div>
          
          {transfers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Vous n'avez pas encore effectué de transfert
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Référence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant envoyé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant reçu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bénéficiaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transfers.map((transfer) => (
                    <tr key={transfer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transfer.reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transfer.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(transfer.amount_sent, transfer.sender_currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(transfer.amount_received, transfer.receiver_currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transfer.beneficiaries && transfer.beneficiaries[0] ? (
                          `${transfer.beneficiaries[0].first_name} ${transfer.beneficiaries[0].last_name}`
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transfer.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transfer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {transfer.status === 'completed' ? 'Terminé' :
                           transfer.status === 'pending' ? 'En attente' :
                           transfer.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;