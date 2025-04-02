import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
    // Parse request body
    const { amount, currency, reference } = request.body;

    // Validate required fields
    if (!amount || !currency) {
      return response.status(400).json({
        error: 'Bad Request',
        message: 'Amount and currency are required'
      });
    }

    // Convert amount to cents/smallest currency unit
    const amountInSmallestUnit = Math.round(amount * 100);
    
    // Generate a unique reference if not provided
    const paymentReference = reference || `KP-${Date.now()}`;

    console.log('Creating checkout session with:', {
      amount: amountInSmallestUnit,
      currency: currency.toLowerCase(),
      reference: paymentReference
    });

    // Create checkout session with Checkout.com
    // Using the correct API endpoint for Checkout.com hosted payments
    const checkoutUrl = 'https://api.checkout.com/hosted-payments';
    const authToken = process.env.CHECKOUT_SECRET_KEY;
    
    const requestData = {
      amount: amountInSmallestUnit,
      currency: currency.toLowerCase(),
      billing: {
        address: {
          country: 'FR'
        }
      },
      success_url: `${process.env.VERCEL_URL || 'https://kundapay.com'}/transfer?status=success`,
      failure_url: `${process.env.VERCEL_URL || 'https://kundapay.com'}/transfer?status=failure`,
      cancel_url: `${process.env.VERCEL_URL || 'https://kundapay.com'}/transfer?status=cancelled`,
      reference: paymentReference,
      // Add these fields to improve the payment experience
      capture: true,
      payment_type: "Regular",
      "3ds": {
        enabled: true
      },
      locale: "fr-FR"
    };

    console.log('Request to Checkout.com:', JSON.stringify(requestData, null, 2));

    const checkoutResponse = await axios({
      method: 'post',
      url: checkoutUrl,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: requestData,
      validateStatus: status => true // Don't throw on any status code
    });

    console.log('Checkout.com response status:', checkoutResponse.status);
    console.log('Checkout.com response data:', JSON.stringify(checkoutResponse.data, null, 2));

    if (checkoutResponse.status >= 400) {
      return response.status(checkoutResponse.status).json({ 
        error: 'Payment Provider Error',
        message: `Erreur du fournisseur de paiement: ${checkoutResponse.status}`,
        details: checkoutResponse.data
      });
    }

    return response.status(200).json({ 
      sessionId: checkoutResponse.data.id,
      redirectUrl: checkoutResponse.data.redirect_url
    });
  } catch (err: any) {
    console.error('Checkout.com error:', err);
    
    // Ensure we always return a valid JSON response
    let errorDetails = 'Unknown error';
    let statusCode = 500;
    
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', err.response.data);
      console.error('Error response status:', err.response.status);
      statusCode = err.response.status;
      errorDetails = JSON.stringify(err.response.data) || err.message;
    } else if (err.request) {
      // The request was made but no response was received
      console.error('Error request:', err.request);
      errorDetails = 'No response received from payment server';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', err.message);
      errorDetails = err.message;
    }
    
    return response.status(statusCode).json({ 
      error: 'Payment Error',
      message: `Erreur lors de la création de session: ${err.message}`,
      details: errorDetails
    });
  }
}