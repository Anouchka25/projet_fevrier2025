import { Handler } from '@netlify/functions';
import axios from 'axios';

const handler: Handler = async (event) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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
          error: 'Bad Request',
          message: 'Request body is required'
        })
      };
    }

    const { amount, currency, reference } = JSON.parse(event.body);

    // Validate required fields
    if (!amount || !currency) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'Amount and currency are required'
        })
      };
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
    const authToken = process.env.CHECKOUT_SECRET_KEY || 'sk_sbox_nqr2h5z6ahlurjol64na27pez4r';
    
    const requestData = {
      amount: amountInSmallestUnit,
      currency: currency.toLowerCase(),
      billing: {
        address: {
          country: 'FR'
        }
      },
      success_url: `${process.env.URL || 'https://kundapay.com'}/transfer?status=success`,
      failure_url: `${process.env.URL || 'https://kundapay.com'}/transfer?status=failure`,
      cancel_url: `${process.env.URL || 'https://kundapay.com'}/transfer?status=cancelled`,
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

    const response = await axios({
      method: 'post',
      url: checkoutUrl,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: requestData,
      validateStatus: status => true // Don't throw on any status code
    });

    console.log('Checkout.com response status:', response.status);
    console.log('Checkout.com response headers:', JSON.stringify(response.headers, null, 2));
    console.log('Checkout.com response data:', JSON.stringify(response.data, null, 2));

    if (response.status >= 400) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: 'Payment Provider Error',
          message: `Erreur du fournisseur de paiement: ${response.status}`,
          details: response.data
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        sessionId: response.data.id,
        redirectUrl: response.data.redirect_url
      }),
    };
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
    
    return {
      statusCode,
      headers,
      body: JSON.stringify({ 
        error: 'Payment Error',
        message: `Erreur lors de la création de session: ${err.message}`,
        details: errorDetails
      }),
    };
  }
};

export { handler };