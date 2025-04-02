import { VercelRequest, VercelResponse } from '@vercel/node';
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
    // Parse request body
    const { transfer_id } = request.body;

    if (!transfer_id) {
      return response.status(400).json({
        error: 'Missing transfer_id',
        message: 'transfer_id is required'
      });
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
      return response.status(404).json({
        error: 'Transfer not found',
        message: transferError?.message || 'Transfer not found'
      });
    }

    // Verify transfer status
    if (transfer.status !== 'pending') {
      return response.status(400).json({
        error: 'Invalid transfer status',
        message: 'Transfer must be in pending status'
      });
    }

    // Get beneficiary phone number
    const beneficiaryPhone = transfer.beneficiaries[0]?.payment_details?.phone;
    if (!beneficiaryPhone) {
      return response.status(400).json({
        error: 'Invalid beneficiary',
        message: 'Beneficiary phone number not found'
      });
    }

    // Validate Airtel Money number format
    if (!/^0[7][4-9][0-9]{6}$/.test(beneficiaryPhone)) {
      return response.status(400).json({
        error: 'Invalid phone number',
        message: 'Invalid Airtel Money number format'
      });
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

        return response.status(200).json({
          success: true,
          message: 'Transfer completed successfully'
        });
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

    return response.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
}