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

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: getPaymentMethodTypes(paymentMethod),
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: 'Transfert KundaPay',
            description: `Référence: ${transferReference}`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.URL || 'http://localhost:5173'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || 'http://localhost:5173'}/transfer`,
      metadata: {
        direction,
        transferReference,
        recipientId
      },
      locale: 'fr'
    });

    if (!session?.url) {
      throw new Error('Failed to create checkout session');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        sessionUrl: session.url,
        sessionId: session.id
      })
    };
  } catch (error) {
    console.error('Stripe error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Payment initialization failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    };
  }
};

function getPaymentMethodTypes(paymentMethod: string): Stripe.Checkout.SessionCreateParams.PaymentMethodType[] {
  switch (paymentMethod) {
    case 'CARD':
      return ['card'];
    case 'ACH':
      return ['us_bank_account'];
    case 'PAYPAL':
      return ['paypal'];
    default:
      return ['card'];
  }
}

export { handler };