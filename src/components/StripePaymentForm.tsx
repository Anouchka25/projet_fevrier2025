import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripe, createPaymentIntent, getPaymentMethodTypes, getStripeLocale } from '../lib/stripe';

interface CheckoutFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSuccess, onError }) => {
  const stripeInstance = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripeInstance || !elements) {
      setError('Le système de paiement n\'est pas initialisé');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await stripeInstance.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
      });

      if (submitError) {
        setError(submitError.message || 'Le paiement a échoué');
        onError(submitError.message || 'Le paiement a échoué');
      } else {
        onSuccess();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Le paiement a échoué';
      setError(message);
      onError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {error && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripeInstance || loading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Traitement en cours...' : 'Payer maintenant'}
      </button>
    </form>
  );
};

interface StripePaymentFormProps {
  amount: number;
  currency: string;
  direction: string;
  paymentMethod: string;
  recipientId: string;
  transferReference: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  currency,
  direction,
  paymentMethod,
  recipientId,
  transferReference,
  onSuccess,
  onError
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!stripe) {
          throw new Error('Le système de paiement n\'est pas disponible pour le moment');
        }

        const secret = await createPaymentIntent({
          amount,
          currency,
          direction,
          paymentMethod,
          recipientId,
          transferReference
        });
        setClientSecret(secret);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'L\'initialisation du paiement a échoué';
        setError(message);
        onError(message);
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [amount, currency, direction, paymentMethod, recipientId, transferReference]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-50 border border-red-200">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="p-4 rounded-md bg-red-50 border border-red-200">
        <p className="text-sm text-red-600">Impossible d'initialiser le paiement</p>
      </div>
    );
  }

  if (!stripe) {
    return (
      <div className="p-4 rounded-md bg-yellow-50 border border-yellow-200">
        <p className="text-sm text-yellow-800">
          Le système de paiement est temporairement indisponible. Veuillez réessayer plus tard ou contacter le support.
        </p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripe}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#d97706',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
          },
        },
        paymentMethodTypes: getPaymentMethodTypes(paymentMethod),
        locale: getStripeLocale(direction)
      }}
    >
      <div className="bg-white p-6 rounded-lg shadow">
        <CheckoutForm onSuccess={onSuccess} onError={onError} />
      </div>
    </Elements>
  );
};

export default StripePaymentForm;