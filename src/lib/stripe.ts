import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with public key from environment variable
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublicKey) {
  console.warn('Stripe publishable key not found in environment variables');
}

// Create Stripe instance only if key is available
export const stripe = stripePublicKey ? loadStripe(stripePublicKey) : null;

interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  direction: string;
  paymentMethod: string;
  recipientId: string;
  transferReference: string;
}

export async function createPaymentIntent({
  amount,
  currency,
  direction,
  paymentMethod,
  recipientId,
  transferReference
}: CreatePaymentIntentParams): Promise<string> {
  try {
    // Make request to create payment intent
    const response = await fetch('/.netlify/functions/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount,
        currency,
        direction,
        paymentMethod,
        recipientId,
        transferReference
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || `Erreur lors de l'initialisation du paiement (${response.status})`);
    }

    const data = await response.json();
    if (!data?.clientSecret) {
      throw new Error('Le système de paiement est temporairement indisponible');
    }

    return data.clientSecret;
  } catch (error) {
    console.error('Erreur Stripe:', error);
    throw error instanceof Error ? error : new Error('Le système de paiement est temporairement indisponible');
  }
}

export function getPaymentMethodTypes(paymentMethod: string): string[] {
  switch (paymentMethod) {
    case 'CARD':
      return ['card']; // Inclut automatiquement Apple Pay et autres méthodes de paiement par carte
    case 'ACH':
      return ['us_bank_account'];
    case 'PAYPAL':
      return ['paypal'];
    default:
      return ['card'];
  }
}

export function getStripeLocale(direction: string): string {
  if (direction.startsWith('USA')) return 'en-US';
  if (direction.startsWith('CANADA')) return 'en-CA';
  if (direction.startsWith('FRANCE')) return 'fr-FR';
  return 'fr';
}