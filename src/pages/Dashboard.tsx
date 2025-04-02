import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/Auth/AuthProvider';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import { Eye, ArrowRight, Check, X } from 'lucide-react';
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
  const [selectedTransfer, setSelectedTransfer] = useState<TransferWithBeneficiary | null>(null);
  const [processingTransfer, setProcessingTransfer] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user?.id) {
          throw new Error('Utilisateur non connecté');
        }

        // Récupérer le profil utilisateur
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Erreur profil:', profileError);
          throw new Error('Erreur lors de la récupération du profil');
        }

        if (!profileData) {
          throw new Error('Profil non trouvé');
        }

        setProfile(profileData);
        setIsAdmin(profileData.is_admin || false);

        // Récupérer les transferts avec les bénéficiaires
        const { data: transfersData, error: transfersError } = await supabase
          .from('transfers')
          .select(`
            *,
            beneficiaries (*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (transfersError) {
          console.error('Erreur transferts:', transfersError);
          throw new Error('Erreur lors de la récupération des transferts');
        }

        setTransfers(transfersData as TransferWithBeneficiary[]);
      } catch (err) {
        console.error('Erreur complète:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement de vos données');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const getPaymentMethodDisplay = (method: string) => {
    const methods: { [key: string]: string } = {
      'BANK_TRANSFER': 'Virement bancaire',
      'AIRTEL_MONEY': 'Airtel Money',
      'MOOV_MONEY': 'Moov Money',
      'CASH': 'Espèces',
      'ALIPAY': 'Alipay',
      'CARD': 'Carte bancaire',
      'ACH': 'Virement ACH',
      'PAYPAL': 'PayPal',
      'WERO': 'Wero',
      'VISA_DIRECT': 'Visa Direct',
      'MASTERCARD_SEND': 'Mastercard Send',
      'INTERAC': 'Interac'
    };
    return methods[method] || method;
  };

  const getFundsOriginDisplay = (origin: string) => {
    const origins: { [key: string]: string } = {
      'salary': 'Salaire',
      'savings': 'Épargne',
      'business': 'Revenus d\'entreprise',
      'investment': 'Investissements',
      'gift': 'Don',
      'other': 'Autre',
      'admin_created': 'Créé par l\'administrateur'
    };
    return origins[origin] || origin || 'Non spécifié';
  };

  const getTransferReasonDisplay = (reason: string) => {
    const reasons: { [key: string]: string } = {
      'family_support': 'Soutien familial',
      'business': 'Affaires',
      'education': 'Éducation',
      'medical': 'Frais médicaux',
      'travel': 'Voyage',
      'other': 'Autre',
      'admin_created': 'Créé par l\'administrateur'
    };
    return reasons[reason] || reason || 'Non spécifié';
  };

  const handleStatusChange = async (id: string, newStatus: 'completed' | 'cancelled') => {
    try {
      setProcessingTransfer(id);
      setError(null);
      
      // Get the current user for validation
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Non autorisé');

      // Update the transfer status
      const { error: updateError } = await supabase
        .from('transfers')
        .update({ 
          status: newStatus,
          validated_at: new Date().toISOString(),
          validated_by: currentUser.id
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Refresh the transfers list
      const { data: updatedTransfer, error: fetchError } = await supabase
        .from('transfers')
        .select(`
          *,
          beneficiaries (*)
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Update the selected transfer and transfers list
      setSelectedTransfer(updatedTransfer as TransferWithBeneficiary);
      setTransfers(prev => 
        prev.map(t => t.id === id ? (updatedTransfer as TransferWithBeneficiary) : t)
      );

      // Show success message
      alert(newStatus === 'completed' ? 'Transfert validé avec succès' : 'Transfert annulé avec succès');
    } catch (err) {
      console.error('Error updating transfer status:', err);
      setError('Erreur lors de la mise à jour du statut');
      alert('Une erreur est survenue lors de la mise à jour du statut');
    } finally {
      setProcessingTransfer(null);
    }
  };

  const executeAirtelTransfer = async (transferId: string) => {
    try {
      setProcessingTransfer(transferId);
      setError(null);

      const response = await fetch('/api/execute-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transfer_id: transferId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'exécution du transfert');
      }

      // Refresh the transfers list
      const { data: updatedTransfer, error: fetchError } = await supabase
        .from('transfers')
        .select(`
          *,
          beneficiaries (*)
        `)
        .eq('id', transferId)
        .single();

      if (fetchError) throw fetchError;

      // Update the selected transfer and transfers list
      setSelectedTransfer(updatedTransfer as TransferWithBeneficiary);
      setTransfers(prev => 
        prev.map(t => t.id === transferId ? (updatedTransfer as TransferWithBeneficiary) : t)
      );

      alert('Transfert exécuté avec succès');
    } catch (err) {
      console.error('Error executing transfer:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'exécution du transfert');
      alert('Erreur lors de l\'exécution du transfert');
    } finally {
      setProcessingTransfer(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto p-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto p-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-700">Profil non trouvé. Veuillez vous reconnecter.</p>
            <button
              onClick={() => navigate('/auth')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                 profile.country === 'CN' ? 'Chine' : 
                 profile.country === 'BE' ? 'Belgique' :
                 profile.country === 'DE' ? 'Allemagne' :
                 profile.country === 'US' ? 'États-Unis' :
                 profile.country === 'CA' ? 'Canada' :
                 profile.country}
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
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
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
                        {transfer.amount_sent.toLocaleString('fr-FR')} {transfer.sender_currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transfer.amount_received.toLocaleString('fr-FR')} {transfer.receiver_currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transfer.beneficiaries && transfer.beneficiaries.length > 0 ? (
                          `${transfer.beneficiaries[0].first_name} ${transfer.beneficiaries[0].last_name}`
                        ) : (
                          <span className="text-gray-400 italic">Non spécifié</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transfer.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transfer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          transfer.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusLabel(transfer.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedTransfer(transfer)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Voir les détails"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal des détails */}
      {selectedTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Détails du transfert {selectedTransfer.reference}
            </h3>
            
            <div className="space-y-6">
              {/* Détails du transfert */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Informations générales</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p><span className="font-medium">Référence :</span> {selectedTransfer.reference}</p>
                      <p><span className="font-medium">Date :</span> {new Date(selectedTransfer.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Statut :</span> {getStatusLabel(selectedTransfer.status)}</p>
                      {selectedTransfer.validated_at && (
                        <p><span className="font-medium">Validé le :</span> {new Date(selectedTransfer.validated_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Montants */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Montants</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p><span className="font-medium">Montant envoyé :</span> {selectedTransfer.amount_sent.toLocaleString('fr-FR')} {selectedTransfer.sender_currency}</p>
                      <p><span className="font-medium">Frais :</span> {selectedTransfer.fees.toLocaleString('fr-FR')} {selectedTransfer.sender_currency}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Montant reçu :</span> {selectedTransfer.amount_received.toLocaleString('fr-FR')} {selectedTransfer.receiver_currency}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Méthodes */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Méthodes</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p><span className="font-medium">Mode de paiement :</span> {getPaymentMethodDisplay(selectedTransfer.payment_method)}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Mode de réception :</span> {getPaymentMethodDisplay(selectedTransfer.receiving_method)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations supplémentaires */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Informations supplémentaires</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p><span className="font-medium">Origine des fonds :</span> {getFundsOriginDisplay(selectedTransfer.funds_origin)}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Raison du transfert :</span> {getTransferReasonDisplay(selectedTransfer.transfer_reason)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bénéficiaire */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Bénéficiaire</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedTransfer.beneficiaries && selectedTransfer.beneficiaries.length > 0 ? (
                    <>
                      <p><span className="font-medium">Nom :</span> {selectedTransfer.beneficiaries[0].first_name} {selectedTransfer.beneficiaries[0].last_name}</p>
                      {selectedTransfer.beneficiaries[0].email && (
                        <p><span className="font-medium">Email :</span> {selectedTransfer.beneficiaries[0].email}</p>
                      )}
                      
                      {/* Détails de paiement spécifiques */}
                      {selectedTransfer.beneficiaries[0].payment_details?.phone && (
                        <p><span className="font-medium">Téléphone :</span> {selectedTransfer.beneficiaries[0].payment_details.phone}</p>
                      )}
                      {selectedTransfer.beneficiaries[0].payment_details?.alipayId && (
                        <p><span className="font-medium">ID Alipay :</span> {selectedTransfer.beneficiaries[0].payment_details.alipayId}</p>
                      )}
                      {selectedTransfer.beneficiaries[0].payment_details?.weroName && (
                        <p><span className="font-medium">Nom Wero :</span> {selectedTransfer.beneficiaries[0].payment_details.weroName}</p>
                      )}
                      
                      {/* Adresse si disponible */}
                      {selectedTransfer.beneficiaries[0].payment_details?.address && (
                        <div className="mt-2">
                          <p className="font-medium">Adresse :</p>
                          <p>{selectedTransfer.beneficiaries[0].payment_details.address.street}</p>
                          <p>{selectedTransfer.beneficiaries[0].payment_details.address.city}, {selectedTransfer.beneficiaries[0].payment_details.address.state} {selectedTransfer.beneficiaries[0].payment_details.address.zipCode}</p>
                        </div>
                      )}
                      
                      {/* Détails bancaires si disponibles */}
                      {selectedTransfer.beneficiaries[0].payment_details?.bankDetails && (
                        <div className="mt-2">
                          <p className="font-medium">Informations bancaires :</p>
                          <p>Banque : {selectedTransfer.beneficiaries[0].payment_details.bankDetails.bankName}</p>
                          <p>Compte : {selectedTransfer.beneficiaries[0].payment_details.bankDetails.accountNumber}</p>
                          {selectedTransfer.beneficiaries[0].payment_details.bankDetails.routingNumber && (
                            <p>Routing : {selectedTransfer.beneficiaries[0].payment_details.bankDetails.routingNumber}</p>
                          )}
                          {selectedTransfer.beneficiaries[0].payment_details.bankDetails.swiftCode && (
                            <p>SWIFT/BIC : {selectedTransfer.beneficiaries[0].payment_details.bankDetails.swiftCode}</p>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">Aucune information de bénéficiaire disponible</p>
                  )}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-between mt-6">
                {isAdmin && selectedTransfer.status === 'pending' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        if (window.confirm('Êtes-vous sûr de vouloir valider ce transfert ?')) {
                          handleStatusChange(selectedTransfer.id, 'completed');
                        }
                      }}
                      disabled={processingTransfer === selectedTransfer.id}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      <Check className="h-5 w-5 mr-2 inline-block" />
                      Valider le transfert
                    </button>
                    
                    {selectedTransfer.receiving_method === 'AIRTEL_MONEY' && (
                      <button
                        onClick={() => {
                          if (window.confirm('Êtes-vous sûr de vouloir exécuter ce transfert Airtel Money ?')) {
                            executeAirtelTransfer(selectedTransfer.id);
                          }
                        }}
                        disabled={processingTransfer === selectedTransfer.id}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        Exécuter via Airtel Money
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        if (window.confirm('Êtes-vous sûr de vouloir annuler ce transfert ?')) {
                          handleStatusChange(selectedTransfer.id, 'cancelled');
                        }
                      }}
                      disabled={processingTransfer === selectedTransfer.id}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      <X className="h-5 w-5 mr-2 inline-block" />
                      Annuler le transfert
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setSelectedTransfer(null)}
                  className={`px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 ${isAdmin && selectedTransfer.status === 'pending' ? '' : 'ml-auto'}`}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;