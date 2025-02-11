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

// Calculate transfer details
export async function calculateTransferDetails(
  amount: number,
  direction: TransferDirection,
  paymentMethod: PaymentMethod,
  receivingMethod: ReceivingMethod,
  isReceiveAmount: boolean = false,
  promoCode?: string
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

    if (feesError || !fees) {
      console.error('Error fetching fees:', feesError);
      throw new Error(`Frais non disponibles pour cette combinaison (${fromCountry} → ${toCountry})`);
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

    // Get exchange rate
    const exchangeRate = await getExchangeRate(fromCurrency, toCurrency);

    // Apply promo code if provided
    let effectiveFeePercentage = fees.fee_percentage;
    let promoCodeId = null;

    if (promoCode) {
      try {
        const { data: validation, error: validationError } = await supabase
          .rpc('validate_promo_code', {
            code_text: promoCode,
            transfer_direction: direction
          })
          .single();

        if (validationError) {
          console.error('Promo code validation error:', validationError);
          throw new Error('Erreur lors de la validation du code promo');
        }

        if (!validation) {
          throw new Error('Code promo invalide');
        }

        if (validation.valid) {
          if (validation.discount_type === 'PERCENTAGE') {
            effectiveFeePercentage *= (1 - validation.discount_value / 100);
          } else if (validation.discount_type === 'FIXED') {
            // Pour les réductions fixes, on les convertit en pourcentage basé sur le montant
            const fixedDiscount = validation.discount_value / amount;
            effectiveFeePercentage = Math.max(0, effectiveFeePercentage - fixedDiscount);
          }

          // Get promo code ID for tracking
          const { data: promoData } = await supabase
            .from('promo_codes')
            .select('id')
            .eq('code', promoCode)
            .eq('direction', direction)
            .single();

          if (promoData) {
            promoCodeId = promoData.id;
          }
        } else {
          throw new Error(validation.message || 'Code promo invalide');
        }
      } catch (error) {
        console.error('Error validating promo code:', error);
        throw error;
      }
    }

    let amountSent: number;
    let amountReceived: number;

    if (isReceiveAmount) {
      // Calculate from receive amount
      amountReceived = amount;
      amountSent = amount / (exchangeRate * (1 - effectiveFeePercentage));
    } else {
      // Calculate from send amount
      amountSent = amount;
      amountReceived = amount * (1 - effectiveFeePercentage) * exchangeRate;
    }

    // Round amounts according to currency
    if (fromCurrency === 'XAF') {
      amountSent = Math.ceil(amountSent / 5) * 5;
    }
    if (toCurrency === 'XAF') {
      amountReceived = Math.floor(amountReceived / 5) * 5;
    }

    const feeAmount = amountSent * effectiveFeePercentage;

    return {
      amountSent,
      fees: feeAmount,
      amountReceived,
      senderCurrency: fromCurrency,
      receiverCurrency: toCurrency,
      exchangeRate,
      direction,
      paymentMethod,
      receivingMethod,
      promoCodeId,
      originalFeePercentage: fees.fee_percentage,
      effectiveFeePercentage
    };
  } catch (error) {
    console.error('Error in calculateTransferDetails:', error);
    throw error;
  }
}

// Get exchange rate for specific currencies
async function getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
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
      .single();

    if (error) throw error;
    if (!data) throw new Error('Exchange rate not found');
    
    return data.rate;
  } catch (err) {
    console.error('Failed to fetch exchange rate:', err);
    throw new Error(`Taux de change non disponible (${fromCurrency} → ${toCurrency})`);
  }
}

// Generate a transfer reference
export function generateTransferReference(): string {
  const prefix = 'KP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}