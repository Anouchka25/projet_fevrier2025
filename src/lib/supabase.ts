import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Get environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pdsiyzpqzqwkqytsitxe.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkc2l5enBxenF3a3F5dHNpdHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNjA2NTAsImV4cCI6MjA1MzgzNjY1MH0.--I0QRj8RZh7jTV9f5m_Kk66XiCVtToOZJKAVP2ZqBc';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please connect to Supabase using the button in the top right corner.');
}

// Create Supabase client with proper configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  }
});

// Add a debug function to check connection
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    console.log('Supabase connection successful');
    return true;
  } catch (err) {
    console.error('Supabase connection check failed:', err);
    return false;
  }
};

// Default values for when data can't be fetched
export const DEFAULT_MAX_AMOUNT = { value: 500, currency: 'EUR' };

// Default exchange rates with exact values
export const DEFAULT_EXCHANGE_RATES = [
  // EUR <-> XAF (fixed rate)
  { from_currency: 'EUR', to_currency: 'XAF', rate: 655.96 },
  { from_currency: 'XAF', to_currency: 'EUR', rate: 0.001524 },  // 1/655.96

  // EUR <-> CNY
  { from_currency: 'EUR', to_currency: 'CNY', rate: 7.5099 },
  { from_currency: 'CNY', to_currency: 'EUR', rate: 0.133157 },  // 1/7.5099

  // XAF <-> CNY
  { from_currency: 'XAF', to_currency: 'CNY', rate: 0.011445 },  // 7.5099/655.96
  { from_currency: 'CNY', to_currency: 'XAF', rate: 87.34 }      // 655.96/7.5099
];

// Default transfer fees with exact values
export const DEFAULT_TRANSFER_FEES = [
  // France -> Gabon (tous à 1%)
  { from_country: 'FR', to_country: 'GA', payment_method: 'BANK_TRANSFER', receiving_method: 'AIRTEL_MONEY', fee_percentage: 0.01 },
  { from_country: 'FR', to_country: 'GA', payment_method: 'BANK_TRANSFER', receiving_method: 'CASH', fee_percentage: 0.01 },
  { from_country: 'FR', to_country: 'GA', payment_method: 'WERO', receiving_method: 'AIRTEL_MONEY', fee_percentage: 0.01 },
  { from_country: 'FR', to_country: 'GA', payment_method: 'WERO', receiving_method: 'CASH', fee_percentage: 0.01 },
  { from_country: 'FR', to_country: 'GA', payment_method: 'CARD', receiving_method: 'AIRTEL_MONEY', fee_percentage: 0.01 },
  { from_country: 'FR', to_country: 'GA', payment_method: 'CARD', receiving_method: 'CASH', fee_percentage: 0.01 },
  { from_country: 'FR', to_country: 'GA', payment_method: 'PAYPAL', receiving_method: 'AIRTEL_MONEY', fee_percentage: 0.01 },
  { from_country: 'FR', to_country: 'GA', payment_method: 'PAYPAL', receiving_method: 'CASH', fee_percentage: 0.01 },

  // Gabon -> France
  { from_country: 'GA', to_country: 'FR', payment_method: 'AIRTEL_MONEY', receiving_method: 'BANK_TRANSFER', fee_percentage: 0.055 },
  { from_country: 'GA', to_country: 'FR', payment_method: 'CASH', receiving_method: 'BANK_TRANSFER', fee_percentage: 0.040 },
  { from_country: 'GA', to_country: 'FR', payment_method: 'AIRTEL_MONEY', receiving_method: 'WERO', fee_percentage: 0.050 },
  { from_country: 'GA', to_country: 'FR', payment_method: 'CASH', receiving_method: 'WERO', fee_percentage: 0.040 },
  { from_country: 'GA', to_country: 'FR', payment_method: 'AIRTEL_MONEY', receiving_method: 'PAYPAL', fee_percentage: 0.052 },

  // Gabon -> Chine
  { from_country: 'GA', to_country: 'CN', payment_method: 'AIRTEL_MONEY', receiving_method: 'ALIPAY', fee_percentage: 0.085 },
  { from_country: 'GA', to_country: 'CN', payment_method: 'CASH', receiving_method: 'ALIPAY', fee_percentage: 0.075 }
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

// Get exchange rate for specific currencies
export async function getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
  // If currencies are the same, return 1
  if (fromCurrency === toCurrency) {
    return 1;
  }

  try {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('rate')
      .eq('from_currency', fromCurrency)
      .eq('to_currency', toCurrency)
      .maybeSingle();

    if (error) throw error;
    
    // If no rate found in database, try default rates
    if (!data) {
      const defaultRate = DEFAULT_EXCHANGE_RATES.find(
        rate => rate.from_currency === fromCurrency && rate.to_currency === toCurrency
      );
      if (defaultRate) {
        return defaultRate.rate;
      }
      throw new Error(`Taux de change non disponible (${fromCurrency} → ${toCurrency})`);
    }
    
    return data.rate;
  } catch (err) {
    console.error('Failed to fetch exchange rate:', err);
    
    // Try to find rate in defaults
    const defaultRate = DEFAULT_EXCHANGE_RATES.find(
      rate => rate.from_currency === fromCurrency && rate.to_currency === toCurrency
    );
    if (defaultRate) {
      return defaultRate.rate;
    }
    throw new Error(`Taux de change non disponible (${fromCurrency} → ${toCurrency})`);
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

// Validate promo code
export async function validate_promo_code(code: string, direction: string) {
  try {
    const { data, error } = await supabase
      .rpc('validate_promo_code', {
        code_text: code,
        transfer_direction: direction
      });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error validating promo code:', err);
    return { data: null, error: err };
  }
}