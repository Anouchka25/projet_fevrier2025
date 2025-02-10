import { supabase } from './supabase';
import type { TransferDirection, PaymentMethod, ReceivingMethod } from './constants';

// Format currency with proper rounding
export function formatCurrency(amount: number, currency: string): string {
  if (!amount || isNaN(amount)) {
    return '0';
  }
  
  if (currency === 'XAF') {
    // Round to nearest 5 for FCFA
    const roundedAmount = Math.round(amount / 5) * 5;
    return `${roundedAmount.toLocaleString('fr-FR')} FCFA`;
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Default values for transfer conditions
const DEFAULT_CONDITIONS = {
  MAX_AMOUNT_PER_TRANSFER: { value: 500, currency: 'EUR' },
  MAX_AMOUNT_PER_YEAR: { value: 5000, currency: 'EUR' },
  MAX_TRANSFERS_WITHOUT_ID: { value: 10, currency: 'COUNT' }
};

// Get transfer conditions with fallback to defaults
export async function getTransferConditions() {
  try {
    const { data, error } = await supabase
      .from('transfer_conditions')
      .select('name, value, currency')
      .eq('name', 'MAX_AMOUNT_PER_TRANSFER')
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch transfer conditions:', error);
      return DEFAULT_CONDITIONS.MAX_AMOUNT_PER_TRANSFER;
    }

    if (!data) {
      console.warn('No transfer conditions found, using defaults');
      return DEFAULT_CONDITIONS.MAX_AMOUNT_PER_TRANSFER;
    }

    return {
      value: data.value,
      currency: data.currency
    };
  } catch (err) {
    console.error('Error fetching transfer conditions:', err);
    return DEFAULT_CONDITIONS.MAX_AMOUNT_PER_TRANSFER;
  }
}

// Generate a transfer reference
export function generateTransferReference(): string {
  const prefix = 'KP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// Calculate transfer details
export async function calculateTransferDetails(
  amount: number,
  direction: TransferDirection,
  paymentMethod: PaymentMethod,
  receivingMethod: ReceivingMethod,
  isReceiveAmount: boolean = false
) {
  try {
    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error('Le montant doit être supérieur à 0');
    }

    // Determine source and destination countries
    let fromCountry: string, toCountry: string;
    switch (direction) {
      case 'GABON_TO_CHINA':
        fromCountry = 'GA'; toCountry = 'CN';
        break;
      case 'FRANCE_TO_GABON':
        fromCountry = 'FR'; toCountry = 'GA';
        break;
      case 'GABON_TO_FRANCE':
        fromCountry = 'GA'; toCountry = 'FR';
        break;
      case 'USA_TO_GABON':
        fromCountry = 'US'; toCountry = 'GA';
        break;
      case 'GABON_TO_USA':
        fromCountry = 'GA'; toCountry = 'US';
        break;
      case 'CANADA_TO_GABON':
        fromCountry = 'CA'; toCountry = 'GA';
        break;
      case 'GABON_TO_CANADA':
        fromCountry = 'GA'; toCountry = 'CA';
        break;
      default:
        throw new Error('Direction de transfert non valide');
    }

    // Get fees from database
    const { data: fees, error: feesError } = await supabase
      .from('transfer_fees')
      .select('fee_percentage')
      .eq('from_country', fromCountry)
      .eq('to_country', toCountry)
      .eq('payment_method', paymentMethod)
      .eq('receiving_method', receivingMethod)
      .single();

    if (feesError) {
      console.error('Error fetching fees:', feesError);
      throw new Error(`Frais non disponibles pour cette combinaison (${fromCountry} -> ${toCountry})`);
    }

    if (!fees) {
      console.error('No fees found for:', {
        fromCountry,
        toCountry,
        paymentMethod,
        receivingMethod
      });
      throw new Error(`Frais non disponibles pour cette combinaison (${fromCountry} -> ${toCountry})`);
    }

    // Determine currencies
    let fromCurrency: string, toCurrency: string;
    switch (fromCountry) {
      case 'FR': fromCurrency = 'EUR'; break;
      case 'US': fromCurrency = 'USD'; break;
      case 'CA': fromCurrency = 'CAD'; break;
      case 'CN': fromCurrency = 'CNY'; break;
      default: fromCurrency = 'XAF';
    }
    
    switch (toCountry) {
      case 'FR': toCurrency = 'EUR'; break;
      case 'US': toCurrency = 'USD'; break;
      case 'CA': toCurrency = 'CAD'; break;
      case 'CN': toCurrency = 'CNY'; break;
      default: toCurrency = 'XAF';
    }

    // Get exchange rate from database
    const { data: rate, error: rateError } = await supabase
      .from('exchange_rates')
      .select('rate')
      .eq('from_currency', fromCurrency)
      .eq('to_currency', toCurrency)
      .single();

    if (rateError) {
      console.error('Error fetching exchange rate:', rateError);
      throw new Error(`Taux de change non disponible (${fromCurrency} -> ${toCurrency})`);
    }

    if (!rate) {
      console.error('No exchange rate found for:', {
        fromCurrency,
        toCurrency
      });
      throw new Error(`Taux de change non disponible (${fromCurrency} -> ${toCurrency})`);
    }

    let amountSent: number;
    let amountReceived: number;

    if (isReceiveAmount) {
      // Calculate from receive amount
      amountReceived = amount;
      amountSent = amount / (rate.rate * (1 - fees.fee_percentage));
    } else {
      // Calculate from send amount
      amountSent = amount;
      amountReceived = amount * (1 - fees.fee_percentage) * rate.rate;
    }

    // Round amounts according to currency
    if (fromCurrency === 'XAF') {
      amountSent = Math.ceil(amountSent / 5) * 5;
    }
    if (toCurrency === 'XAF') {
      amountReceived = Math.floor(amountReceived / 5) * 5;
    }

    const feeAmount = amountSent * fees.fee_percentage;

    return {
      amountSent,
      fees: feeAmount,
      amountReceived,
      senderCurrency: fromCurrency,
      receiverCurrency: toCurrency,
      exchangeRate: rate.rate,
      direction,
      paymentMethod,
      receivingMethod
    };
  } catch (error) {
    console.error('Error in calculateTransferDetails:', error);
    throw error;
  }
}