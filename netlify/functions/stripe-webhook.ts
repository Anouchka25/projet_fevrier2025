import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const handler: Handler = async (event) => {
  try {
    // Verify webhook signature
    const signature = event.headers['stripe-signature'];
    if (!signature || !event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing signature or body' })
      };
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing webhook secret' })
      };
    }

    // Construct the event
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body,
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
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to update transfer status' })
        };
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };