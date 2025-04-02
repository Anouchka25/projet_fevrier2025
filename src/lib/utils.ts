import { supabase } from './supabase';
import type { TransferDirection, PaymentMethod, ReceivingMethod } from './constants';

// Format currency with proper rounding
export function formatCurrency(amount: number, currency: string): string {
  if (!amount || isNaN(amount)) {
    return '0,00';
  }
  
  if (currency === 'XAF') {
    // Round to nearest 5 for FCFA
    const roundedAmount = Math.round(amount / 5) * 5;
    return roundedAmount.toLocaleString('fr-FR');
  }

  // For EUR, USD, CNY, CAD - always show 2 decimal places
  return amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Generate a transfer reference
export function generateTransferReference(): string {
  const prefix = 'KP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// Convert country codes to transfer direction
function getTransferDirection(fromCountry: string, toCountry: string): TransferDirection {
  const directionMap: Record<string, Record<string, TransferDirection>> = {
    'GA': {
      'FR': 'GABON_TO_FRANCE',
      'BE': 'GABON_TO_BELGIUM',
      'DE': 'GABON_TO_GERMANY',
      'CN': 'GABON_TO_CHINA',
      'US': 'GABON_TO_USA',
      'CA': 'GABON_TO_CANADA'
    },
    'FR': {
      'GA': 'FRANCE_TO_GABON'
    },
    'BE': {
      'GA': 'BELGIUM_TO_GABON'
    },
    'DE': {
      'GA': 'GERMANY_TO_GABON'
    },
    'US': {
      'GA': 'USA_TO_GABON'
    },
    'CA': {
      'GA': 'CANADA_TO_GABON'
    }
  };

  const direction = directionMap[fromCountry]?.[toCountry];
  if (!direction) {
    throw new Error('Direction de transfert non valide');
  }

  return direction;
}

// Calculate transfer details
export async function calculateTransferDetails(
  amount: number,
  direction: string,
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

    // Parse direction into from/to countries
    const [fromCountry, toCountry] = direction.split('_TO_').map(part => {
      switch (part) {
        case 'GABON': return 'GA';
        case 'FRANCE': return 'FR';
        case 'BELGIUM': return 'BE';
        case 'GERMANY': return 'DE';
        case 'CHINA': return 'CN';
        case 'USA': return 'US';
        case 'CANADA': return 'CA';
        default: throw new Error('Pays non valide dans la direction');
      }
    });

    // Convert to standard direction format
    const standardDirection = getTransferDirection(fromCountry, toCountry);

    // Determine currencies
    let fromCurrency: string, toCurrency: string;
    switch (fromCountry) {
      case 'FR':
      case 'BE':
      case 'DE':
        fromCurrency = 'EUR';
        break;
      case 'US':
        fromCurrency = 'USD';
        break;
      case 'CA':
        fromCurrency = 'CAD';
        break;
      case 'CN':
        fromCurrency = 'CNY';
        break;
      default:
        fromCurrency = 'XAF';
    }
    
    switch (toCountry) {
      case 'FR':
      case 'BE':
      case 'DE':
        toCurrency = 'EUR';
        break;
      case 'US':
        toCurrency = 'USD';
        break;
      case 'CA':
        toCurrency = 'CAD';
        break;
      case 'CN':
        toCurrency = 'CNY';
        break;
      default:
        toCurrency = 'XAF';
    }

    // Get exchange rate from database
    const { data: exchangeRateData, error: exchangeRateError } = await supabase
      .from('exchange_rates')
      .select('rate')
      .eq('from_currency', fromCurrency)
      .eq('to_currency', toCurrency)
      .single();

    if (exchangeRateError || !exchangeRateData) {
      throw new Error(`Taux de change non disponible (${fromCurrency} → ${toCurrency})`);
    }

    const exchangeRate = exchangeRateData.rate;

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
      throw new Error(`Frais non disponibles pour cette combinaison (${fromCountry} → ${toCountry})`);
    }

    if (!fees) {
      throw new Error(`Frais non disponibles pour cette combinaison (${fromCountry} → ${toCountry})`);
    }

    let feePercentage = fees.fee_percentage;
    let effectiveFeePercentage = feePercentage;

    // Apply promo code if provided
    let promoCodeId = null;
    if (promoCode) {
      try {
        const { data: validation, error: validationError } = await supabase
          .rpc('validate_promo_code', {
            code_text: promoCode,
            transfer_direction: standardDirection
          });

        if (validationError) {
          console.error('Promo code validation error:', validationError);
          throw new Error('Erreur lors de la validation du code promo');
        }

        if (!validation || !validation[0]) {
          throw new Error('Code promo invalide');
        }

        const promoValidation = validation[0];
        if (!promoValidation.valid) {
          throw new Error(promoValidation.message || 'Code promo invalide');
        }

        // Apply discount
        if (promoValidation.discount_type === 'PERCENTAGE') {
          effectiveFeePercentage *= (1 - promoValidation.discount_value / 100);
        } else if (promoValidation.discount_type === 'FIXED') {
          // Pour les réductions fixes, on les convertit en pourcentage basé sur le montant
          const fixedDiscount = promoValidation.discount_value / amount;
          effectiveFeePercentage = Math.max(0, effectiveFeePercentage - fixedDiscount);
        }

        // Get promo code ID for tracking
        const { data: promoData } = await supabase
          .from('promo_codes')
          .select('id')
          .eq('code', promoCode)
          .eq('direction', standardDirection)
          .single();

        if (promoData) {
          promoCodeId = promoData.id;
        }
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        } else {
          throw new Error('Erreur lors de la validation du code promo');
        }
      }
    }

    let amountSent: number;
    let amountReceived: number;

    if (isReceiveAmount) {
      // Calculate from receive amount
      amountReceived = amount;
      amountSent = amount / (exchangeRate * (1 - effectiveFeePercentage));

      // Validate transfer limits
      if (fromCountry === 'GA') {
        // For transfers from Gabon, validate against XAF limit (300 EUR = 196,788 XAF)
        if (amountSent > 196788) {
          throw new Error('Le montant maximum autorisé pour les transferts depuis le Gabon est de 196 788 XAF (300 EUR)');
        }
      } else if (toCountry === 'GA') {
        // For transfers to Gabon, convert received XAF to EUR for validation
        const amountInEUR = amountReceived / 655.96; // Convert XAF to EUR
        if (amountInEUR > 2000) {
          throw new Error('Le montant maximum autorisé pour les transferts vers le Gabon est de 1 311 920 XAF (2000 EUR)');
        }
      }
    } else {
      // Calculate from send amount
      amountSent = amount;
      amountReceived = amount * (1 - effectiveFeePercentage) * exchangeRate;

      // Validate transfer limits
      if (fromCountry === 'GA') {
        // For transfers from Gabon, validate against XAF limit (300 EUR = 196,788 XAF)
        if (amountSent > 196788) {
          throw new Error('Le montant maximum autorisé pour les transferts depuis le Gabon est de 196 788 XAF (300 EUR)');
        }
      } else if (toCountry === 'GA') {
        // For transfers to Gabon, validate against EUR limit
        const amountInEUR = amountSent;
        if (amountInEUR > 2000) {
          throw new Error('Le montant maximum autorisé pour les transferts vers le Gabon est de 2000 EUR');
        }
      }
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
      amountSent: Number(amountSent.toFixed(2)),
      fees: Number(feeAmount.toFixed(2)),
      amountReceived: Number(amountReceived.toFixed(2)),
      senderCurrency: fromCurrency,
      receiverCurrency: toCurrency,
      exchangeRate: Number(exchangeRate.toFixed(4)),
      direction: standardDirection,
      paymentMethod,
      receivingMethod,
      promoCodeId,
      originalFeePercentage: feePercentage,
      effectiveFeePercentage
    };
  } catch (error) {
    console.error('Error in calculateTransferDetails:', error);
    throw error instanceof Error ? error : new Error('Une erreur inattendue est survenue');
  }
}