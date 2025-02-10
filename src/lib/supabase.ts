import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Get environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please connect to Supabase using the button in the top right corner.');
}

// Create Supabase client with proper configuration
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storage: window.localStorage,
      storageKey: 'supabase.auth.token',
      flowType: 'pkce'
    }
  }
);

// Default values for when data can't be fetched
export const DEFAULT_MAX_AMOUNT = { value: 500, currency: 'EUR' };
export const DEFAULT_EXCHANGE_RATES = [
  { from_currency: 'EUR', to_currency: 'XAF', rate: 655.96 },
  { from_currency: 'XAF', to_currency: 'EUR', rate: 0.001524 },
  { from_currency: 'EUR', to_currency: 'CNY', rate: 7.5099 },
  { from_currency: 'CNY', to_currency: 'EUR', rate: 0.133157 },
  { from_currency: 'XAF', to_currency: 'CNY', rate: 0.011445 },
  { from_currency: 'CNY', to_currency: 'XAF', rate: 87.34 }
];
export const DEFAULT_TRANSFER_FEES = [
  { from_country: 'GA', to_country: 'CN', payment_method: 'AIRTEL_MONEY', receiving_method: 'ALIPAY', fee_percentage: 0.085 },
  { from_country: 'GA', to_country: 'CN', payment_method: 'CASH', receiving_method: 'ALIPAY', fee_percentage: 0.075 },
  { from_country: 'FR', to_country: 'GA', payment_method: 'BANK_TRANSFER', receiving_method: 'AIRTEL_MONEY', fee_percentage: 0.005 },
  { from_country: 'FR', to_country: 'GA', payment_method: 'BANK_TRANSFER', receiving_method: 'CASH', fee_percentage: 0.004 },
  { from_country: 'GA', to_country: 'FR', payment_method: 'AIRTEL_MONEY', receiving_method: 'BANK_TRANSFER', fee_percentage: 0.055 },
  { from_country: 'GA', to_country: 'FR', payment_method: 'CASH', receiving_method: 'BANK_TRANSFER', fee_percentage: 0.04 }
];

// Get exchange rates with fallback
export async function getExchangeRates() {
  try {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .order('from_currency');

    if (error) throw error;
    return data || DEFAULT_EXCHANGE_RATES;
  } catch (err) {
    console.error('Failed to fetch exchange rates:', err);
    return DEFAULT_EXCHANGE_RATES;
  }
}

// Get transfer fees with fallback
export async function getTransferFees() {
  try {
    const { data, error } = await supabase
      .from('transfer_fees')
      .select('*')
      .order('from_country');

    if (error) throw error;
    return data || DEFAULT_TRANSFER_FEES;
  } catch (err) {
    console.error('Failed to fetch transfer fees:', err);
    return DEFAULT_TRANSFER_FEES;
  }
}

// Get transfer conditions with fallback
export async function getTransferConditions() {
  try {
    const { data, error } = await supabase
      .from('transfer_conditions')
      .select('*')
      .eq('name', 'MAX_AMOUNT_PER_TRANSFER')
      .maybeSingle();

    if (error) throw error;
    return data || DEFAULT_MAX_AMOUNT;
  } catch (err) {
    console.error('Error fetching max amount:', err);
    return DEFAULT_MAX_AMOUNT;
  }
}