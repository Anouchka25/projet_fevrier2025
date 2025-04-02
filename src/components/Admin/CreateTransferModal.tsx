import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { calculateTransferDetails } from '../../lib/utils';
import { X } from 'lucide-react';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface CreateTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransferCreated: () => void;
}

const DIRECTIONS = [
  { value: 'FRANCE_TO_GABON', label: 'France → Gabon' },
  { value: 'GABON_TO_FRANCE', label: 'Gabon → France' },
  { value: 'BELGIUM_TO_GABON', label: 'Belgique → Gabon' },
  { value: 'GABON_TO_BELGIUM', label: 'Gabon → Belgique' },
  { value: 'GERMANY_TO_GABON', label: 'Allemagne → Gabon' },
  { value: 'GABON_TO_GERMANY', label: 'Gabon → Allemagne' },
  { value: 'GABON_TO_CHINA', label: 'Gabon → Chine' },
  { value: 'USA_TO_GABON', label: 'États-Unis → Gabon' },
  { value: 'GABON_TO_USA', label: 'Gabon → États-Unis' },
  { value: 'CANADA_TO_GABON', label: 'Canada → Gabon' },
  { value: 'GABON_TO_CANADA', label: 'Gabon → Canada' }
];

const PAYMENT_METHODS = {
  'FRANCE_TO_GABON': ['BANK_TRANSFER', 'WERO', 'CARD', 'PAYPAL'],
  'BELGIUM_TO_GABON': ['BANK_TRANSFER', 'WERO', 'CARD', 'PAYPAL'],
  'GERMANY_TO_GABON': ['BANK_TRANSFER', 'WERO', 'CARD', 'PAYPAL'],
  'GABON_TO_FRANCE': ['AIRTEL_MONEY', 'MOOV_MONEY', 'CASH'],
  'GABON_TO_BELGIUM': ['AIRTEL_MONEY', 'MOOV_MONEY', 'CASH'],
  'GABON_TO_GERMANY': ['AIRTEL_MONEY', 'MOOV_MONEY', 'CASH'],
  'GABON_TO_CHINA': ['AIRTEL_MONEY', 'MOOV_MONEY', 'CASH'],
  'USA_TO_GABON': ['PAYPAL'],
  'GABON_TO_USA': ['AIRTEL_MONEY', 'MOOV_MONEY', 'CASH'],
  'CANADA_TO_GABON': ['PAYPAL'],
  'GABON_TO_CANADA': ['AIRTEL_MONEY', 'MOOV_MONEY', 'CASH']
};

const RECEIVING_METHODS = {
  'FRANCE_TO_GABON': ['AIRTEL_MONEY', 'MOOV_MONEY', 'CASH'],
  'BELGIUM_TO_GABON': ['AIRTEL_MONEY', 'MOOV_MONEY', 'CASH'],
  'GERMANY_TO_GABON': ['AIRTEL_MONEY', 'MOOV_MONEY', 'CASH'],
  'GABON_TO_FRANCE': ['BANK_TRANSFER', 'WERO', 'PAYPAL'],
  'GABON_TO_BELGIUM': ['BANK_TRANSFER', 'WERO', 'PAYPAL'],
  'GABON_TO_GERMANY': ['BANK_TRANSFER', 'WERO', 'PAYPAL'],
  'GABON_TO_CHINA': ['ALIPAY'],
  'USA_TO_GABON': ['AIRTEL_MONEY', 'MOOV_MONEY', 'CASH'],
  'GABON_TO_USA': ['ACH', 'VISA_DIRECT', 'MASTERCARD_SEND'],
  'CANADA_TO_GABON': ['AIRTEL_MONEY', 'MOOV_MONEY', 'CASH'],
  'GABON_TO_CANADA': ['INTERAC', 'VISA_DIRECT', 'MASTERCARD_SEND']
};

const METHOD_LABELS = {
  'BANK_TRANSFER': 'Virement bancaire',
  'WERO': 'Wero ou PayLib',
  'CARD': 'Carte bancaire',
  'PAYPAL': 'PayPal',
  'AIRTEL_MONEY': 'Airtel Money',
  'MOOV_MONEY': 'Moov Money',
  'CASH': 'Espèces',
  'ALIPAY': 'Alipay',
  'ACH': 'Virement ACH',
  'VISA_DIRECT': 'Visa Direct',
  'MASTERCARD_SEND': 'Mastercard Send',
  'INTERAC': 'Virement Interac'
};

const CreateTransferModal: React.FC<CreateTransferModalProps> = ({
  isOpen,
  onClose,
  onTransferCreated
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [direction, setDirection] = useState('FRANCE_TO_GABON');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [receivingMethod, setReceivingMethod] = useState('AIRTEL_MONEY');
  const [recipientFirstName, setRecipientFirstName] = useState('');
  const [recipientLastName, setRecipientLastName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transferDetails, setTransferDetails] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (amount && !isNaN(Number(amount))) {
      calculateTransfer();
    }
  }, [amount, direction, paymentMethod, receivingMethod]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .order('email');

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Erreur lors du chargement des utilisateurs');
    }
  };

  const calculateTransfer = async () => {
    try {
      const result = await calculateTransferDetails(
        Number(amount),
        direction,
        paymentMethod,
        receivingMethod,
        false
      );
      setTransferDetails(result);
    } catch (err) {
      console.error('Error calculating transfer:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du calcul du transfert');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !amount || !transferDetails) return;

    setLoading(true);
    setError(null);

    try {
      // Create transfer
      const { data: newTransfer, error: transferError } = await supabase
        .from('transfers')
        .insert([{
          reference: `KP${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          user_id: selectedUser,
          amount_sent: transferDetails.amountSent,
          fees: transferDetails.fees,
          amount_received: transferDetails.amountReceived,
          sender_currency: transferDetails.senderCurrency,
          receiver_currency: transferDetails.receiverCurrency,
          payment_method: paymentMethod,
          receiving_method: receivingMethod,
          direction,
          status: 'pending',
          funds_origin: 'admin_created',
          transfer_reason: 'admin_created',
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (transferError) throw transferError;

      // Create beneficiary
      const { error: beneficiaryError } = await supabase
        .from('beneficiaries')
        .insert([{
          transfer_id: newTransfer.id,
          first_name: recipientFirstName,
          last_name: recipientLastName,
          email: recipientEmail,
          payment_details: {
            phone: recipientPhone
          }
        }]);

      if (beneficiaryError) throw beneficiaryError;

      onTransferCreated();
      onClose();
    } catch (err) {
      console.error('Error creating transfer:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du transfert');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Créer un transfert</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sélection de l'utilisateur */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Utilisateur
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
              required
            >
              <option value="">Sélectionner un utilisateur</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email} ({user.first_name} {user.last_name})
                </option>
              ))}
            </select>
          </div>

          {/* Direction du transfert */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Direction
            </label>
            <select
              value={direction}
              onChange={(e) => {
                setDirection(e.target.value);
                // Reset payment and receiving methods when direction changes
                setPaymentMethod(PAYMENT_METHODS[e.target.value][0]);
                setReceivingMethod(RECEIVING_METHODS[e.target.value][0]);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
              required
            >
              {DIRECTIONS.map((dir) => (
                <option key={dir.value} value={dir.value}>
                  {dir.label}
                </option>
              ))}
            </select>
          </div>

          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Montant à envoyer
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
              required
              min="0"
              step="0.01"
            />
          </div>

          {/* Méthode de paiement */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Méthode de paiement
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
              required
            >
              {PAYMENT_METHODS[direction]?.map((method) => (
                <option key={method} value={method}>
                  {METHOD_LABELS[method]}
                </option>
              ))}
            </select>
          </div>

          {/* Méthode de réception */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Méthode de réception
            </label>
            <select
              value={receivingMethod}
              onChange={(e) => setReceivingMethod(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
              required
            >
              {RECEIVING_METHODS[direction]?.map((method) => (
                <option key={method} value={method}>
                  {METHOD_LABELS[method]}
                </option>
              ))}
            </select>
          </div>

          {/* Informations du bénéficiaire */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Bénéficiaire</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <input
                  type="text"
                  value={recipientFirstName}
                  onChange={(e) => setRecipientFirstName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  type="text"
                  value={recipientLastName}
                  onChange={(e) => setRecipientLastName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                required
              />
            </div>
          </div>

          {/* Détails du transfert */}
          {transferDetails && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Détails du transfert</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Montant envoyé</span>
                  <span className="font-medium">
                    {transferDetails.amountSent.toLocaleString()} {transferDetails.senderCurrency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Frais</span>
                  <span className="font-medium">
                    {transferDetails.fees.toLocaleString()} {transferDetails.senderCurrency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Montant reçu</span>
                  <span className="font-medium text-green-600">
                    {transferDetails.amountReceived.toLocaleString()} {transferDetails.receiverCurrency}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !transferDetails}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer le transfert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTransferModal;