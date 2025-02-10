import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/Auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { Check, X, Eye, Mail, Edit, CheckCircle, XCircle } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Transfer = Database['public']['Tables']['transfers']['Row'] & {
  sender: Database['public']['Tables']['users']['Row'];
  beneficiary: Database['public']['Tables']['beneficiaries']['Row'];
};

type ExchangeRate = Database['public']['Tables']['exchange_rates']['Row'];
type TransferFee = Database['public']['Tables']['transfer_fees']['Row'];
type TransferCondition = Database['public']['Tables']['transfer_conditions']['Row'];

interface EditingState {
  type: 'rate' | 'fee' | 'condition';
  id: string;
  data: any;
}

const countryNames: { [key: string]: string } = {
  GA: "Gabon",
  FR: "France",
  CN: "Chine"
};

const methodNames: { [key: string]: string } = {
  AIRTEL_MONEY: "Airtel Money",
  CASH: "Paiement en espèces",
  BANK_TRANSFER: "Virement bancaire",
  ALIPAY: "Alipay"
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [fees, setFees] = useState<TransferFee[]>([]);
  const [conditions, setConditions] = useState<TransferCondition[]>([]);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingState | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transfersData, ratesData, feesData, conditionsData] = await Promise.all([
        supabase
          .from('transfers')
          .select(`
            *,
            sender:users!transfers_user_id_fkey(*),
            beneficiary:beneficiaries(*)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('exchange_rates')
          .select('*')
          .order('from_currency'),
        supabase
          .from('transfer_fees')
          .select('*')
          .order('from_country'),
        supabase
          .from('transfer_conditions')
          .select('*')
          .order('name')
      ]);

      if (transfersData.error) throw transfersData.error;
      if (ratesData.error) throw ratesData.error;
      if (feesData.error) throw feesData.error;
      if (conditionsData.error) throw conditionsData.error;

      setTransfers(transfersData.data as Transfer[]);
      setRates(ratesData.data);
      setFees(feesData.data);
      setConditions(conditionsData.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Une erreur est survenue lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (type: 'rate' | 'fee' | 'condition', id: string, data: any) => {
    try {
      let error;
      
      switch (type) {
        case 'rate':
          const { error: rateError } = await supabase
            .from('exchange_rates')
            .update({ 
              rate: parseFloat(data.rate),
              updated_at: new Date().toISOString()
            })
            .eq('id', id);
          error = rateError;
          break;

        case 'fee':
          const { error: feeError } = await supabase
            .from('transfer_fees')
            .update({ 
              fee_percentage: parseFloat(data.fee_percentage) / 100,
              updated_at: new Date().toISOString()
            })
            .eq('id', id);
          error = feeError;
          break;

        case 'condition':
          const { error: conditionError } = await supabase
            .from('transfer_conditions')
            .update({ 
              value: parseFloat(data.value),
              updated_at: new Date().toISOString()
            })
            .eq('id', id);
          error = conditionError;
          break;
      }

      if (error) throw error;
      
      setEditing(null);
      fetchData();
    } catch (err) {
      console.error('Error updating:', err);
      setError('Une erreur est survenue lors de la mise à jour');
    }
  };

  const handleTransferStatus = async (transferId: string, status: 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('transfers')
        .update({ 
          status,
          validated_at: new Date().toISOString(),
          validated_by: user?.id
        })
        .eq('id', transferId);

      if (error) throw error;
      
      // Refresh data
      fetchData();
      setSelectedTransfer(null);
    } catch (err) {
      console.error('Error updating transfer status:', err);
      setError('Une erreur est survenue lors de la mise à jour du statut');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Taux de change */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Taux de change</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                {rates.map((rate) => (
                  <div key={rate.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    {editing?.type === 'rate' && editing.id === rate.id ? (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleEdit('rate', rate.id, editing.data);
                        }}
                        className="w-full flex items-center space-x-4"
                      >
                        <div className="flex-1">
                          <label className="block text-sm text-gray-500">
                            1 {rate.from_currency} =
                          </label>
                          <input
                            type="number"
                            step="0.0001"
                            value={editing.data.rate}
                            onChange={(e) => setEditing({
                              ...editing,
                              data: { ...editing.data, rate: e.target.value }
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="submit"
                            className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditing(null)}
                            className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <span className="text-gray-900">
                          1 {rate.from_currency} = {rate.rate.toLocaleString('fr-FR', { maximumFractionDigits: 4 })} {rate.to_currency}
                        </span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">
                            Mis à jour le {new Date(rate.updated_at).toLocaleDateString('fr-FR')}
                          </span>
                          <button
                            onClick={() => setEditing({
                              type: 'rate',
                              id: rate.id,
                              data: { rate: rate.rate }
                            })}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Frais de transfert */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Frais de transfert</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                {fees.map((fee) => (
                  <div key={fee.id} className="p-3 bg-gray-50 rounded-lg">
                    {editing?.type === 'fee' && editing.id === fee.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleEdit('fee', fee.id, editing.data);
                        }}
                        className="space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-gray-900">
                            {countryNames[fee.from_country]} → {countryNames[fee.to_country]}
                          </span>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              step="0.01"
                              value={editing.data.fee_percentage}
                              onChange={(e) => setEditing({
                                ...editing,
                                data: { ...editing.data, fee_percentage: e.target.value }
                              })}
                              className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                            />
                            <span className="text-gray-500">%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            {methodNames[fee.payment_method]} → {methodNames[fee.receiving_method]}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              type="submit"
                              className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditing(null)}
                              className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-900">
                            {countryNames[fee.from_country]} → {countryNames[fee.to_country]}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-yellow-600">
                              {(fee.fee_percentage * 100).toFixed(2)}%
                            </span>
                            <button
                              onClick={() => setEditing({
                                type: 'fee',
                                id: fee.id,
                                data: { fee_percentage: (fee.fee_percentage * 100).toFixed(2) }
                              })}
                              className="text-yellow-600 hover:text-yellow-700"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {methodNames[fee.payment_method]} → {methodNames[fee.receiving_method]}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Conditions de transfert */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Conditions de transfert</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {conditions.map((condition) => (
                  <div key={condition.id} className="p-4 bg-gray-50 rounded-lg">
                    {editing?.type === 'condition' && editing.id === condition.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleEdit('condition', condition.id, editing.data);
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">{condition.name}</h4>
                          <p className="mt-1 text-sm text-gray-500">{condition.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            step={condition.currency === 'COUNT' ? '1' : '0.01'}
                            value={editing.data.value}
                            onChange={(e) => setEditing({
                              ...editing,
                              data: { ...editing.data, value: e.target.value }
                            })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                          />
                          <span className="text-sm text-gray-500">{condition.currency}</span>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            type="submit"
                            className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditing(null)}
                            className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{condition.name}</h4>
                            <p className="mt-1 text-sm text-gray-500">{condition.description}</p>
                            <p className="mt-2 text-lg font-medium text-yellow-600">
                              {condition.currency === 'COUNT' 
                                ? condition.value.toFixed(0)
                                : condition.value.toLocaleString('fr-FR')} {condition.currency}
                            </p>
                          </div>
                          <button
                            onClick={() => setEditing({
                              type: 'condition',
                              id: condition.id,
                              data: { value: condition.value }
                            })}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Liste des transferts */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Transferts récents</h3>
            </div>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        {transfer.sender.first_name} {transfer.sender.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transfer.beneficiary?.first_name} {transfer.beneficiary?.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transfer.amount_sent.toLocaleString('fr-FR')} {transfer.sender_currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transfer.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transfer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          transfer.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {transfer.status === 'completed' ? 'Terminé' :
                           transfer.status === 'pending' ? 'En attente' :
                           transfer.status === 'cancelled' ? 'Annulé' :
                           transfer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          {transfer.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleTransferStatus(transfer.id, 'completed')}
                                className="text-green-600 hover:text-green-700"
                                title="Valider"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleTransferStatus(transfer.id, 'cancelled')}
                                className="text-red-600 hover:text-red-700"
                                title="Annuler"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedTransfer(transfer)}
                            className="text-yellow-600 hover:text-yellow-700"
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
          </div>
        </div>
      </div>

      {/* Modal des détails du transfert */}
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
                    {selectedTransfer.sender.first_name} {selectedTransfer.sender.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{selectedTransfer.sender.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Bénéficiaire</h4>
                  <p className="mt-1">
                    {selectedTransfer.beneficiary?.first_name} {selectedTransfer.beneficiary?.last_name}
                  </p>
                  {selectedTransfer.beneficiary?.email && (
                    <p className="text-sm text-gray-500">{selectedTransfer.beneficiary.email}</p>
                  )}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Mode de paiement</h4>
                  <p className="mt-1">{methodNames[selectedTransfer.payment_method]}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Mode de réception</h4>
                  <p className="mt-1">{methodNames[selectedTransfer.receiving_method]}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date de création</h4>
                  <p className="mt-1">
                    {new Date(selectedTransfer.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
                {selectedTransfer.validated_at && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Date de validation</h4>
                    <p className="mt-1">
                      {new Date(selectedTransfer.validated_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                {selectedTransfer.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleTransferStatus(selectedTransfer.id, 'completed')}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Valider
                    </button>
                    <button
                      onClick={() => handleTransferStatus(selectedTransfer.id, 'cancelled')}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      Annuler
                    </button>
                  </>
                )}
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

export default AdminDashboard;