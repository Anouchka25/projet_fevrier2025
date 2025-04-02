import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, Phone, CheckCircle } from 'lucide-react';
import { sendTransferConfirmationEmail } from '../lib/onesignal';
import { useAuth } from './Auth/AuthProvider';

interface PaymentFormProps {
  transferDetails: {
    amountSent: number;
    amountReceived: number;
    senderCurrency: string;
    receiverCurrency: string;
    fees: number;
    direction: string;
    paymentMethod: string;
    receivingMethod: string;
    fundsOrigin?: string;
    transferReason?: string;
    originalFeePercentage?: number;
    effectiveFeePercentage?: number;
  };
  recipientDetails: {
    firstName: string;
    lastName: string;
    email: string;
  };
  onBack: () => void;
  onSubmit: () => void;
  onComplete: () => void;
  transferComplete: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  transferDetails,
  recipientDetails,
  onBack,
  onSubmit,
  onComplete,
  transferComplete
}) => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      setError(null);
      setLoading(true);

      // Generate a unique reference
      const newReference = `KP${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setReference(newReference);

      if (transferDetails.paymentMethod === 'CARD') {
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: transferDetails.amountSent,
            currency: transferDetails.senderCurrency,
            reference: newReference
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Erreur lors de la création de session de paiement (${response.status})`);
        }

        const data = await response.json();

        // Redirect to Checkout.com hosted payment page
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else if (data.sessionId) {
          window.location.href = `https://pay.checkout.com/page/${data.sessionId}`;
        } else {
          throw new Error('Aucune URL de redirection reçue du serveur de paiement');
        }
        return;
      }

      // Call onSubmit to create the transfer in the database
      await onSubmit();

      // Send confirmation email
      if (user) {
        await sendTransferConfirmationEmail(newReference);
      }

    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentInstructions = () => {
    if (transferDetails.paymentMethod === 'AIRTEL_MONEY') {
      return (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Phone className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Instructions de paiement Airtel Money
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Pour finaliser votre transfert, veuillez :
                </p>
                <ol className="mt-2 list-decimal list-inside">
                  <li>Ouvrir l'application Airtel Money sur votre téléphone</li>
                  <li>Envoyer <strong>{transferDetails.amountSent.toLocaleString('fr-FR')} {transferDetails.senderCurrency}</strong> au numéro <strong>074186037</strong></li>
                  <li>Le compte est au nom de <strong>Anouchka MINKOUE OBAME</strong></li>
                  <li>Ensuite <strong>Confirmez le transfert</strong></li>
                  <li className="flex items-center text-yellow-700 mt-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    <span>Le transfert ne sera traité qu'après réception et validation de votre paiement.</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (transferDetails.paymentMethod === 'MOOV_MONEY') {
      return (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Phone className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Instructions de paiement Moov Money
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Pour finaliser votre transfert, veuillez :
                </p>
                <ol className="mt-2 list-decimal list-inside">
                  <li>Ouvrir l'application Moov Money sur votre téléphone</li>
                  <li>Envoyer <strong>{transferDetails.amountSent.toLocaleString('fr-FR')} {transferDetails.senderCurrency}</strong> au numéro <strong>062 60 94 41</strong></li>
                  <li>Le compte est au nom de <strong>Anouchka MINKOUE OBAME</strong></li>
                  <li>Ensuite <strong>Confirmez le transfert</strong></li>
                  <li className="flex items-center text-yellow-700 mt-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    <span>Le transfert ne sera traité qu'après réception et validation de votre paiement.</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (transferDetails.paymentMethod === 'WERO') {
      return (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Phone className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Instructions de paiement Wero
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Pour finaliser votre transfert, veuillez :
                </p>
                <ol className="mt-2 list-decimal list-inside">
                  <li>Ouvrir l'application Wero/Paylib sur votre téléphone</li>
                  <li>Envoyer <strong>{transferDetails.amountSent.toLocaleString('fr-FR')} {transferDetails.senderCurrency}</strong> au numéro <strong>+33 6 58 89 85 31</strong></li>
                  <li>Le compte est au nom de <strong>Anouchka MINKOUE OBAME</strong></li>
                  <li>Ensuite <strong>Confirmez le transfert</strong></li>
                  <li className="flex items-center text-yellow-700 mt-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    <span>Le transfert ne sera traité qu'après réception et validation de votre paiement.</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (transferDetails.paymentMethod === 'PAYPAL') {
      return (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Instructions de paiement PayPal
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Pour finaliser votre transfert, veuillez :
                </p>
                <ol className="mt-2 list-decimal list-inside">
                  <li>Connectez-vous à votre compte PayPal</li>
                  <li>Envoyez <strong>{transferDetails.amountSent.toLocaleString('fr-FR')} {transferDetails.senderCurrency}</strong> à l'une des options suivantes :
                    <ul className="ml-8 mt-2 list-disc">
                      <li>Email : <strong>minkoueobamea@gmail.com</strong></li>
                      <li>Numéro : <strong>+33 6 58 89 85 31</strong></li>
                    </ul>
                  </li>
                  <li>Le compte est au nom de <strong>Anouchka MINKOUE OBAME</strong></li>
                  <li>
                    Sélectionnez l'option <strong>"Envoyer à un ami"</strong> pour éviter les frais PayPal.
                  </li>
                  <li>Ensuite <strong>Confirmez le transfert</strong></li>
                  <li className="flex items-center text-yellow-700 mt-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    <span>Le transfert ne sera traité qu'après réception et validation de votre paiement.</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (transferDetails.paymentMethod === 'BANK_TRANSFER') {
      return (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Instructions de paiement par Virement bancaire
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Pour finaliser votre transfert, veuillez effectuer un virement bancaire aux coordonnées suivantes :
                </p>
                <ul className="mt-2 list-disc list-inside">
                  <li><strong>Titulaire du compte :</strong> M Anouchka MINKOUE OBAME</li>
                  <li><strong>IBAN :</strong> FR76 1142 5009 0004 2564 3497 042</li>
                  <li><strong>BIC :</strong> CEPAFRPP142</li>
                  <li><strong>Banque :</strong> 36 LE MAIL, 76190 YVETOT</li>
                </ul>
                <p className="mt-2">
                  Montant à envoyer : <strong>{transferDetails.amountSent.toLocaleString('fr-FR')} {transferDetails.senderCurrency}</strong>
                </p>
                <p className="flex items-center text-yellow-700 mt-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                  <span>Le transfert ne sera traité qu'après réception et validation de votre paiement.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  // Calculer la réduction des frais si applicable
  const showFeeReduction = transferDetails.originalFeePercentage && transferDetails.effectiveFeePercentage;
  const feeReductionPercentage = showFeeReduction
    ? Math.round((1 - transferDetails.effectiveFeePercentage! / transferDetails.originalFeePercentage!) * 100)
    : 0;

  if (transferComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              {/* Confirmation message */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Transfert confirmé !
                </h2>
                <p className="text-gray-600">
                  Votre demande de transfert a été enregistrée avec succès.
                </p>
                {reference && (
                  <p className="text-sm text-gray-500 mt-2">
                    Référence : <span className="font-mono">{reference}</span>
                  </p>
                )}
              </div>

              {/* Transfer details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Détails du transfert</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Montant à envoyer</span>
                    <span className="text-lg font-medium text-gray-900">
                      {transferDetails.amountSent.toLocaleString('fr-FR')} {transferDetails.senderCurrency}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500">Frais</span>
                      {showFeeReduction && feeReductionPercentage > 0 && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          -{feeReductionPercentage}%
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-medium text-gray-900">
                      {transferDetails.fees.toLocaleString('fr-FR')} {transferDetails.senderCurrency}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-sm text-gray-500">Montant à recevoir</span>
                    <span className="text-lg font-bold text-green-600">
                      {transferDetails.amountReceived.toLocaleString('fr-FR')} {transferDetails.receiverCurrency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment instructions */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Instructions de paiement</h3>
                {getPaymentInstructions()}
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={onComplete}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                >
                  Aller au tableau de bord
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </button>
              <h2 className="text-2xl font-bold text-gray-900">Paiement</h2>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Détails du transfert</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Montant à envoyer</span>
                  <span className="text-lg font-medium text-gray-900">
                    {transferDetails.amountSent.toLocaleString('fr-FR')} {transferDetails.senderCurrency}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500">Frais</span>
                    {showFeeReduction && feeReductionPercentage > 0 && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        -{feeReductionPercentage}%
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-medium text-gray-900">
                    {transferDetails.fees.toLocaleString('fr-FR')} {transferDetails.senderCurrency}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-500">Montant à recevoir</span>
                  <span className="text-lg font-bold text-green-600">
                    {transferDetails.amountReceived.toLocaleString('fr-FR')} {transferDetails.receiverCurrency}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {getPaymentInstructions()}

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Chargement...' : 'Confirmer le transfert'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;