import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Initialize Stripe with secret key from environment variable
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Create Supabase client
const supabaseClient = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return response.status(204).end();
  }

  // Verify HTTP method
  if (request.method !== 'POST') {
    return response.status(405).json({ 
      error: 'Method Not Allowed',
      message: 'Only POST requests are allowed'
    });
  }

  try {
    // Verify the token with Supabase
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return response.status(401).json({ error: 'Non autorisé' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return response.status(401).json({ error: 'Token invalide' });
    }

    // Parse request body
    const {
      amount,
      currency,
      direction,
      paymentMethod,
      recipientId,
      transferReference,
      metadata
    } = request.body;

    // Validate required fields
    if (!amount || !currency || !direction || !paymentMethod || !recipientId || !transferReference) {
      return response.status(400).json({ error: 'Données manquantes' });
    }

    // Convert amount to cents for Stripe
    const amountInCents = Math.round(amount * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      payment_method_types: getPaymentMethodTypes(paymentMethod),
      metadata: {
        userId: user.id,
        direction,
        transferReference,
        recipientId,
        ...metadata
      },
      receipt_email: user.email,
      statement_descriptor: 'KUNDAPAY TRANSFER',
      statement_descriptor_suffix: transferReference,
      capture_method: 'automatic',
      setup_future_usage: 'off_session',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always'
      }
    });

    // Record payment intent in database
    const { error: dbError } = await supabaseClient
      .from('payment_intents')
      .insert([{
        id: paymentIntent.id,
        user_id: user.id,
        amount: amountInCents,
        currency: currency,
        status: paymentIntent.status,
        transfer_reference: transferReference,
        recipient_id: recipientId,
        payment_method: paymentMethod,
        direction: direction
      }]);

    if (dbError) {
      console.error('Error recording payment intent:', dbError);
      // Continue even if recording fails
    }

    // Return client secret
    return response.status(200).json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error: any) {
    console.error('Error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return response.status(400).json({ 
        error: 'Payment Error',
        message: error.message
      });
    }
    
    return response.status(500).json({ 
      error: 'Server Error',
      message: 'An unexpected error occurred'
    });
  }
}

// Helper function to get payment method types
function getPaymentMethodTypes(paymentMethod: string): string[] {
  switch (paymentMethod) {
    case 'CARD':
      return ['card'];
    case 'ACH':
      return ['us_bank_account'];
    case 'APPLE_PAY':
      return ['apple_pay'];
    case 'PAYPAL':
      return ['paypal'];
    case 'INTERAC':
      return ['interac_present'];
    default:
      return ['card'];
  }
}