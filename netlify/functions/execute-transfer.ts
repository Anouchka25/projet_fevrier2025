import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Airtel Money API configuration
const AIRTEL_API_URL = 'https://openapi.airtel.africa';
const SENDER_AIRTEL_NUMBER = '074186037';

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

    const { transfer_id } = JSON.parse(event.body);

    if (!transfer_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing transfer_id',
          message: 'transfer_id is required'
        })
      };
    }

    // Get transfer details from Supabase
    const { data: transfer, error: transferError } = await supabase
      .from('transfers')
      .select(`
        *,
        beneficiaries (*)
      `)
      .eq('id', transfer_id)
      .single();

    if (transferError || !transfer) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: 'Transfer not found',
          message: transferError?.message || 'Transfer not found'
        })
      };
    }

    // Verify transfer status
    if (transfer.status !== 'pending') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid transfer status',
          message: 'Transfer must be in pending status'
        })
      };
    }

    // Get beneficiary phone number
    const beneficiaryPhone = transfer.beneficiaries[0]?.payment_details?.phone;
    if (!beneficiaryPhone) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid beneficiary',
          message: 'Beneficiary phone number not found'
        })
      };
    }

    // Validate Airtel Money number format
    if (!/^0[7][4-9][0-9]{6}$/.test(beneficiaryPhone)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid phone number',
          message: 'Invalid Airtel Money number format'
        })
      };
    }

    try {
      // Get Airtel Money access token
      const tokenResponse = await axios.post(
        `${AIRTEL_API_URL}/auth/oauth2/token`,
        {
          client_id: process.env.AIRTEL_CLIENT_ID,
          client_secret: process.env.AIRTEL_CLIENT_SECRET,
          grant_type: 'client_credentials'
        }
      );

      const accessToken = tokenResponse.data.access_token;

      // Execute Airtel Money transfer
      const transferResponse = await axios.post(
        `${AIRTEL_API_URL}/merchant/v1/payments/transfer`,
        {
          payee: {
            msisdn: beneficiaryPhone
          },
          reference: transfer.reference,
          transaction: {
            amount: transfer.amount_received,
            currency: 'XAF'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Country': 'GA',
            'X-Currency': 'XAF'
          }
        }
      );

      if (transferResponse.data.status === 'SUCCESS') {
        // Update transfer status
        const { error: updateError } = await supabase
          .from('transfers')
          .update({ 
            status: 'completed',
            validated_at: new Date().toISOString()
          })
          .eq('id', transfer_id);

        if (updateError) throw updateError;

        // Create notification
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([{
            type: 'transfer_completed',
            transfer_id: transfer_id,
            recipient_id: transfer.user_id,
            message: `Votre transfert ${transfer.reference} a été effectué avec succès`
          }]);

        if (notificationError) {
          console.error('Error creating notification:', notificationError);
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Transfer completed successfully'
          })
        };
      } else {
        throw new Error('Transfer failed');
      }
    } catch (airtelError) {
      // Update transfer status to failed
      await supabase
        .from('transfers')
        .update({ status: 'failed' })
        .eq('id', transfer_id);

      // Create failure notification
      await supabase
        .from('notifications')
        .insert([{
          type: 'transfer_failed',
          transfer_id: transfer_id,
          recipient_id: transfer.user_id,
          message: `Votre transfert ${transfer.reference} a échoué. Notre équipe va vous contacter.`
        }]);

      throw airtelError;
    }
  } catch (error) {
    console.error('Error executing transfer:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    };
  }
};

export { handler };