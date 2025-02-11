import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Edit, Check, X } from 'lucide-react';

interface TransferFee {
  id: string;
  from_country: string;
  to_country: string;
  payment_method: string;
  receiving_method: string;
  fee_percentage: number;
  updated_at: string;
}

const TransferFeesManager = () => {
  const [fees, setFees] = useState<TransferFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('transfer_fees')
        .select('*')
        .order('from_country');

      if (error) throw error;
      setFees(data);
    } catch (err) {
      console.error('Error fetching fees:', err);
      setError('Erreur lors du chargement des frais');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string, newFee: number) => {
    try {
      setError(null);
      if (newFee < 0 || newFee > 100) {
        throw new Error('Le pourcentage doit être entre 0 et 100');
      }

      const { error } = await supabase
        .from('transfer_fees')
        .update({ 
          fee_percentage: newFee / 100,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      setEditingId(null);
      await fetchFees();
    } catch (err) {
      console.error('Error updating fee:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour des frais');
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Frais de transfert</h2>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                De
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vers
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Moyen de paiement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Moyen de réception
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Frais (%)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fees.map((fee) => (
              <tr key={fee.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {fee.from_country}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fee.to_country}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fee.payment_method}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fee.receiving_method}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === fee.id ? (
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-24 rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                      step="0.01"
                      min="0"
                      max="100"
                    />
                  ) : (
                    (fee.fee_percentage * 100).toFixed(2)
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === fee.id ? (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(fee.id, parseFloat(editValue))}
                        className="text-green-600 hover:text-green-900"
                        title="Valider"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-red-600 hover:text-red-900"
                        title="Annuler"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(fee.id);
                        setEditValue((fee.fee_percentage * 100).toString());
                      }}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="Modifier"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransferFeesManager;