import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

// Initialize Stripe with secret key from environment variable
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

const handler: Handler = async (event) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { 
      statusCode: 204, 
      headers,
      body: '' 
    };
  }

  // Verify HTTP method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        error: 'Method Not Allowed',
        message: 'Only POST requests are allowed'
      })
    };
  }

  try {
    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing request body',
          message: 'Request body is required'
        })
      };
    }

    const { 
      amount,
      currency,
      direction,
      paymentMethod,
      recipientId,
      transferReference
    } = JSON.parse(event.body);

    // Validate required fields
    if (!amount || !currency || !direction || !paymentMethod || !recipientId || !transferReference) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required fields',
          message: 'All fields are required'
        })
      };
    }

    // Convert amount to cents
    const amountInCents = Math.round(amount * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      payment_method_types: getPaymentMethodTypes(paymentMethod),
      metadata: {
        direction,
        transferReference,
        recipientId
      },
      statement_descriptor: 'KUNDAPAY',
      statement_descriptor_suffix: transferReference.slice(0, 22),
      capture_method: 'automatic',
      setup_future_usage: 'off_session',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always'
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret
      })
    };
  } catch (error) {
    console.error('Stripe error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Payment Error',
          message: error.message
        })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Server Error',
        message: 'An unexpected error occurred'
      })
    };
  }
};

function getPaymentMethodTypes(paymentMethod: string): string[] {
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

export { handler };