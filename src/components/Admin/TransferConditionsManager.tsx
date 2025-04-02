import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Edit, Check, X } from 'lucide-react';

interface TransferCondition {
  id: string;
  name: string;
  value: number;
  currency: string;
  description: string;
  updated_at: string;
}

const TransferConditionsManager = () => {
  const [conditions, setConditions] = useState<TransferCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConditions();
  }, []);

  const fetchConditions = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('transfer_conditions')
        .select('*')
        .order('name');

      if (error) throw error;
      setConditions(data);
    } catch (err) {
      console.error('Error fetching conditions:', err);
      setError('Erreur lors du chargement des conditions de transfert');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string, newValue: number) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('transfer_conditions')
        .update({ 
          value: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      setEditingId(null);
      await fetchConditions();
    } catch (err) {
      console.error('Error updating condition:', err);
      setError('Erreur lors de la mise à jour de la condition');
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Conditions de transfert</h2>

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
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valeur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Devise
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dernière mise à jour
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {conditions.map((condition) => (
              <tr key={condition.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {condition.name === 'MAX_AMOUNT_FROM_GABON' ? 'Maximum depuis le Gabon' :
                   condition.name === 'MAX_AMOUNT_TO_GABON' ? 'Maximum vers le Gabon' :
                   condition.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === condition.id ? (
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-32 rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                      step="1"
                      min="0"
                    />
                  ) : (
                    condition.value.toLocaleString('fr-FR')
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {condition.currency}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {condition.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(condition.updated_at).toLocaleString('fr-FR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === condition.id ? (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(condition.id, parseFloat(editValue))}
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
                        setEditingId(condition.id);
                        setEditValue(condition.value.toString());
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

export default TransferConditionsManager;