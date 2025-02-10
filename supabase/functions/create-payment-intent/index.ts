import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import Stripe from 'https://esm.sh/stripe@13.11.0';

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

// Créer le client Supabase
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_ANON_KEY') || ''
);

serve(async (req) => {
  try {
    // Vérifier la méthode
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Méthode non autorisée' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Récupérer et valider le token JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Vérifier le token avec Supabase
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Token invalide' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Récupérer les données du corps de la requête
    const {
      amount,
      currency,
      direction,
      paymentMethod,
      recipientId,
      transferReference,
      metadata
    } = await req.json();

    // Valider les données requises
    if (!amount || !currency || !direction || !paymentMethod || !recipientId || !transferReference) {
      return new Response(JSON.stringify({ error: 'Données manquantes' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Convertir le montant en centimes pour Stripe
    const amountInCents = Math.round(amount * 100);

    // Créer l'intention de paiement
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

    // Enregistrer l'intention de paiement dans la base de données
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
      console.error('Erreur lors de l\'enregistrement de l\'intention de paiement:', dbError);
      // On continue même si l'enregistrement échoue
    }

    // Retourner le client secret
    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});

// Fonction utilitaire pour obtenir les types de paiement
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