import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './Auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { generateTransferReference } from '../lib/utils';
import RecipientForm from './RecipientForm';
import PaymentForm from './PaymentForm';
import type { RecipientData } from './RecipientForm';

const TransferForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transferDetails, setTransferDetails] = useState<any>(null);
  const [step, setStep] = useState<'recipient' | 'payment'>('recipient');
  const [recipientData, setRecipientData] = useState<RecipientData | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [transferComplete, setTransferComplete] = useState(false);
  const [transferId, setTransferId] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

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
    
    // Check for payment status in URL (for card payment return)
    const urlParams = new URLSearchParams(location.search);
    const status = urlParams.get('status');
    
    if (status === 'success') {
      setTransferComplete(true);
      // Clear transfer details from localStorage after successful payment
      localStorage.removeItem('transferDetails');
    } else if (status === 'failure' || status === 'cancelled') {
      setError(status === 'failure' 
        ? 'Le paiement a échoué. Veuillez réessayer ou choisir un autre moyen de paiement.' 
        : 'Le paiement a été annulé.');
    }
  }, [navigate, location]);

  const handleBack = () => {
    if (step === 'payment') {
      setStep('recipient');
    } else {
      navigate('/');
    }
  };

  const validateTransferData = (data: any) => {
    if (!data.amountSent || data.amountSent <= 0) {
      throw new Error('Le montant envoyé est invalide');
    }
    if (!data.senderCurrency || !data.receiverCurrency) {
      throw new Error('Les devises sont invalides');
    }
    if (!data.paymentMethod || !data.receivingMethod) {
      throw new Error('Les méthodes de paiement sont invalides');
    }
  };

  const validateRecipientData = (data: RecipientData) => {
    if (!data.firstName?.trim() || !data.lastName?.trim()) {
      throw new Error('Le nom du bénéficiaire est incomplet');
    }
    if (!data.email?.trim()) {
     throw new Error('L\'email du bénéficiaire est requis');
   }
    if (!data.fundsOrigin?.trim()) {
      throw new Error('L\'origine des fonds est requise');
    }
    if (!data.transferReason?.trim()) {
      throw new Error('La raison du transfert est requise');
    }
  };

  const handleRecipientSubmit = async (data: RecipientData) => {
    try {
      if (!user) {
        navigate('/auth', { 
          state: { 
            from: '/transfer',
            transferDetails: localStorage.getItem('transferDetails')
          }
        });
        return;
      }

      if (!termsAccepted) {
        setError('Vous devez accepter les conditions générales pour continuer');
        return;
      }

      validateRecipientData(data);
      setRecipientData(data);
      setStep('payment');
      setError(null);
    } catch (err) {
      console.error('Erreur de validation:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la validation des données');
    }
  };

  const handlePaymentSubmit = async () => {
    if (!user || !transferDetails || !recipientData) {
      setError('Données manquantes pour créer le transfert');
      return;
    }

    if (!termsAccepted) {
      setError('Vous devez accepter les conditions générales pour continuer');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      validateTransferData(transferDetails);
      
      const reference = generateTransferReference();
      setReference(reference);
      
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
          direction: transferDetails.direction,
          status: 'pending',
          promo_code_id: transferDetails.promoCodeId,
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (transferError) {
        console.error('Erreur lors de la création du transfert:', transferError);
        throw new Error('Erreur lors de la création du transfert. Veuillez réessayer.');
      }

      if (!newTransfer) {
        throw new Error('Erreur lors de la création du transfert. Aucune donnée retournée.');
      }

      // Save transfer ID for later use (especially for card payments)
      setTransferId(newTransfer.id);

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

      if (beneficiaryError) {
        console.error('Erreur lors de la création du bénéficiaire:', beneficiaryError);
        // Annuler le transfert si le bénéficiaire n'a pas pu être créé
        await supabase
          .from('transfers')
          .delete()
          .eq('id', newTransfer.id);
        throw new Error('Erreur lors de la création du bénéficiaire. Veuillez réessayer.');
      }

      // For non-card payments, set transfer as complete immediately
      if (transferDetails.paymentMethod !== 'CARD') {
        setTransferComplete(true);
        // Clear transfer details from localStorage for non-card payments
        localStorage.removeItem('transferDetails');
      }
      // For card payments, the completion will be handled by the redirect from the payment provider

    } catch (err) {
      console.error('Erreur complète:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la création du transfert');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    // Clear any remaining transfer details
    localStorage.removeItem('transferDetails');
    navigate('/dashboard');
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
        <div className="py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <RecipientForm
                  transferDetails={transferDetails}
                  onBack={handleBack}
                  onSubmit={handleRecipientSubmit}
                />

                {/* Terms and Conditions Acceptance */}
                <div className="mt-6 border-t pt-6">
                  <div className="flex items-center">
                    <input
                      id="transfer-terms"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <label htmlFor="transfer-terms" className="ml-2 block text-sm text-gray-900">
                      J'accepte les{' '}
                      <a
                        href="/conditions-generales"
                        target="_blank"
                        className="font-medium text-yellow-600 hover:text-yellow-500"
                      >
                        conditions générales
                      </a>
                      {' '}et la{' '}
                      <a
                        href="/politique-de-confidentialite"
                        target="_blank"
                        className="font-medium text-yellow-600 hover:text-yellow-500"
                      >
                        politique de confidentialité
                      </a>
                    </label>
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <PaymentForm
          transferDetails={transferDetails}
          recipientDetails={recipientData!}
          onBack={handleBack}
          onSubmit={handlePaymentSubmit}
          onComplete={handleComplete}
          transferComplete={transferComplete}
        />
      )}

      {error && !error.includes('conditions générales') && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferForm;