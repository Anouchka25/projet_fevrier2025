import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/Auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { generateTransferReference } from '../lib/utils';
import RecipientForm from '../components/RecipientForm';
import PaymentForm from '../components/PaymentForm';
import type { RecipientData } from '../components/RecipientForm';

const TransferForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transferDetails, setTransferDetails] = useState<any>(null);
  const [step, setStep] = useState<'recipient' | 'payment'>('recipient');
  const [recipientData, setRecipientData] = useState<RecipientData | null>(null);

  useEffect(() => {
    const loadTransferDetails = () => {
      const savedDetails = localStorage.getItem('transferDetails');
      if (savedDetails) {
        const details = JSON.parse(savedDetails);
        setTransferDetails(details);
      } else {
        navigate('/');
      }
    };

    loadTransferDetails();
  }, [navigate]);

  const handleBack = () => {
    if (step === 'payment') {
      setStep('recipient');
    } else {
      navigate('/');
    }
  };

  const handleRecipientSubmit = async (data: RecipientData) => {
    setRecipientData(data);
    setStep('payment');
  };

  const handlePaymentSubmit = async () => {
    if (!user || !transferDetails || !recipientData) return;

    setLoading(true);
    setError(null);

    try {
      const reference = generateTransferReference();
      
      // Create new transfer
      const { data: newTransfer, error: transferError } = await supabase
        .from('transfers')
        .insert([{
          reference,
          user_id: user.id,
          amount_sent: transferDetails.amountSent,
          fees: transferDetails.fees,
          amount_received: transferDetails.amountReceived,
          sender_currency: transferDetails.senderCurrency,
          receiver_currency: transferDetails.receiverCurrency,
          payment_method: transferDetails.paymentMethod,
          receiving_method: transferDetails.receivingMethod,
          funds_origin: recipientData.fundsOrigin,
          transfer_reason: recipientData.transferReason,
          status: 'pending'
        }])
        .select()
        .single();

      if (transferError) throw transferError;

      // Create beneficiary
      const { error: beneficiaryError } = await supabase
        .from('beneficiaries')
        .insert([{
          transfer_id: newTransfer.id,
          first_name: recipientData.firstName,
          last_name: recipientData.lastName,
          email: recipientData.email,
          payment_details: {
            phone: recipientData.phone,
            address: recipientData.address,
            bankDetails: recipientData.bankDetails,
            alipayId: recipientData.alipayId,
            weroName: recipientData.weroName
          }
        }]);

      if (beneficiaryError) throw beneficiaryError;

      localStorage.removeItem('transferDetails');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating transfer:', err);
      setError('Une erreur est survenue lors de la création du transfert');
    } finally {
      setLoading(false);
    }
  };

  if (!transferDetails) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-center text-gray-500">Aucun détail de transfert trouvé.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {step === 'recipient' ? (
        <RecipientForm
          transferDetails={transferDetails}
          onBack={handleBack}
          onSubmit={handleRecipientSubmit}
        />
      ) : (
        <PaymentForm
          transferDetails={transferDetails}
          recipientDetails={recipientData!}
          onBack={handleBack}
          onSubmit={handlePaymentSubmit}
        />
      )}
    </div>
  );
};

export default TransferForm;