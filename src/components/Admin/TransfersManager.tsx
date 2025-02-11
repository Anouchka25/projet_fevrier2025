import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Check, X, Eye } from 'lucide-react';

interface Transfer {
  id: string;
  reference: string;
  created_at: string;
  amount_sent: number;
  amount_received: number;
  sender_currency: string;
  receiver_currency: string;
  status: string;
  users: {
    first_name: string;
    last_name: string;
    email: string;
  };
  beneficiaries: Array<{
    first_name: string;
    last_name: string;
  }>;
}

const TransfersManager = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    try {
      const { data, error } = await supabase
        .from('transfers')
        .select(`
          *,
          users (id, email, first_name, last_name),
          beneficiaries (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransfers(data);
    } catch (err) {
      console.error('Error fetching transfers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('transfers')
        .update({ 
          status: newStatus,
          validated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      await fetchTransfers();
    } catch (err) {
      console.error('Error updating transfer status:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Transferts</h2>
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
                Expéditeur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bénéficiaire
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
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
              <tr key={transfer.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {transfer.reference}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(transfer.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transfer.users?.first_name} {transfer.users?.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transfer.beneficiaries?.[0]?.first_name} {transfer.beneficiaries?.[0]?.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transfer.amount_sent.toLocaleString('fr-FR')} {transfer.sender_currency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    transfer.status === 'completed' ? 'bg-green-100 text-green-800' :
                    transfer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {transfer.status === 'completed' ? 'Terminé' :
                     transfer.status === 'pending' ? 'En attente' :
                     'Annulé'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {transfer.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(transfer.id, 'completed')}
                          className="text-green-600 hover:text-green-900"
                          title="Valider"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(transfer.id, 'cancelled')}
                          className="text-red-600 hover:text-red-900"
                          title="Annuler"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setSelectedTransfer(transfer)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="Voir les détails"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal des détails */}
      {selectedTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Détails du transfert {selectedTransfer.reference}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Expéditeur</h4>
                  <p className="mt-1">
                    {selectedTransfer.users?.first_name} {selectedTransfer.users?.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{selectedTransfer.users?.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Bénéficiaire</h4>
                  <p className="mt-1">
                    {selectedTransfer.beneficiaries?.[0]?.first_name} {selectedTransfer.beneficiaries?.[0]?.last_name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Montant envoyé</h4>
                  <p className="mt-1">
                    {selectedTransfer.amount_sent.toLocaleString('fr-FR')} {selectedTransfer.sender_currency}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Montant reçu</h4>
                  <p className="mt-1">
                    {selectedTransfer.amount_received.toLocaleString('fr-FR')} {selectedTransfer.receiver_currency}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedTransfer(null)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
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

export default TransfersManager;