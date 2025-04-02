import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    // Verify webhook signature
    const signature = request.headers['stripe-signature'] as string;
    if (!signature || !request.body) {
      return response.status(400).json({ error: 'Missing signature or body' });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return response.status(500).json({ error: 'Missing webhook secret' });
    }

    // Construct the event
    const stripeEvent = stripe.webhooks.constructEvent(
      request.body,
      signature,
      webhookSecret
    );

    // Handle the event
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;
      
      // Update transfer status
      const { error } = await supabase
        .from('transfers')
        .update({ 
          status: 'paid',
          payment_id: session.payment_intent as string,
          paid_at: new Date().toISOString()
        })
        .eq('reference', session.metadata?.transferReference);

      if (error) {
        console.error('Error updating transfer:', error);
        return response.status(500).json({ error: 'Failed to update transfer status' });
      }
    }

    return response.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return response.status(400).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}