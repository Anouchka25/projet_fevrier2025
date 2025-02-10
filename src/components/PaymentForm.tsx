import React from 'react';
import { ArrowLeft, AlertTriangle, Phone } from 'lucide-react';
import StripePaymentForm from './StripePaymentForm';
import emailjs from '@emailjs/browser';

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
  };
  recipientDetails: {
    firstName: string;
    lastName: string;
    email: string;
  };
  onBack: () => void;
  onSubmit: () => void;
}

// Constants
const AIRTEL_MONEY_NUMBER = '074036033'; // Format local gabonais
const WHATSAPP_NUMBER = '+33658898531';

// Fonction pour formater les méthodes de paiement
const formatPaymentMethod = (method: string): string => {
  const methods: { [key: string]: string } = {
    'AIRTEL_MONEY': 'Airtel Money',
    'CASH': 'Espèces',
    'BANK_TRANSFER': 'Virement bancaire',
    'ALIPAY': 'Alipay',
    'CARD': 'Carte bancaire',
    'ACH': 'Virement ACH',
    'INTERAC': 'Virement Interac',
    'APPLE_PAY': 'Apple Pay',
    'PAYPAL': 'PayPal',
    'WERO': 'Wero',
    'VISA_DIRECT': 'Visa Direct',
    'MASTERCARD_SEND': 'Mastercard Send'
  };
  return methods[method] || method;
};

const PaymentForm: React.FC<PaymentFormProps> = ({
  transferDetails,
  recipientDetails,
  onBack,
  onSubmit
}) => {
  const showStripePayment = ['CARD', 'ACH', 'APPLE_PAY', 'PAYPAL', 'INTERAC'].includes(transferDetails.paymentMethod);

  const getPaymentInstructions = () => {
    if (transferDetails.paymentMethod === 'AIRTEL_MONEY') {
      return `Veuillez effectuer le transfert Airtel Money au numéro suivant : ${AIRTEL_MONEY_NUMBER} au nom de Anouchka MINKOUE OBAME`;
    }
    if (transferDetails.paymentMethod === 'CASH') {
      return `Les informations pour le dépôt en espèces vous seront communiquées par WhatsApp au ${WHATSAPP_NUMBER}`;
    }
    if (transferDetails.paymentMethod === 'BANK_TRANSFER') {
      return `Les informations bancaires vous seront envoyées par email.`;
    }
    if (transferDetails.paymentMethod === 'WERO') {
      return `Veuillez effectuer le transfert via Wero au numéro suivant : ${WHATSAPP_NUMBER}`;
    }
    return '';
  };

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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Montant à envoyer</p>
                  <p className="text-lg font-medium text-gray-900">
                    {transferDetails.amountSent.toLocaleString('fr-FR')} {transferDetails.senderCurrency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Frais</p>
                  <p className="text-lg font-medium text-gray-900">
                    {transferDetails.fees.toLocaleString('fr-FR')} {transferDetails.senderCurrency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Montant à recevoir</p>
                  <p className="text-lg font-medium text-green-600">
                    {transferDetails.amountReceived.toLocaleString('fr-FR')} {transferDetails.receiverCurrency}
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions de paiement spécifiques */}
            {(transferDetails.paymentMethod === 'AIRTEL_MONEY' || 
              transferDetails.paymentMethod === 'CASH' || 
              transferDetails.paymentMethod === 'BANK_TRANSFER' ||
              transferDetails.paymentMethod === 'WERO') && (
              <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Phone className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Instructions de paiement
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>{getPaymentInstructions()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Important
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      {showStripePayment ? (
                        "Vous allez être redirigé vers une page de paiement sécurisée. Ne fermez pas votre navigateur pendant le processus."
                      ) : (
                        "Les fonds seront transférés au bénéficiaire uniquement après réception et confirmation de votre paiement."
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {showStripePayment ? (
              <StripePaymentForm
                amount={transferDetails.amountSent}
                currency={transferDetails.senderCurrency}
                direction={transferDetails.direction}
                paymentMethod={transferDetails.paymentMethod}
                recipientId={recipientDetails.firstName + ' ' + recipientDetails.lastName}
                transferReference={`TR${Date.now()}`}
                onSuccess={onSubmit}
                onError={(error) => console.error(error)}
              />
            ) : (
              <button
                onClick={onSubmit}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Confirmer le transfert
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;