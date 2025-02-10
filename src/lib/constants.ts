// Currency codes
export type CountryCode = 'GA' | 'FR' | 'CN' | 'US' | 'CA';
export type CurrencyCode = 'XAF' | 'EUR' | 'CNY' | 'USD' | 'CAD';
export type PaymentMethod = 'AIRTEL_MONEY' | 'CASH' | 'BANK_TRANSFER' | 'ALIPAY' | 'CARD' | 'ACH' | 'PAYPAL' | 'WERO';
export type ReceivingMethod = 'AIRTEL_MONEY' | 'CASH' | 'BANK_TRANSFER' | 'ALIPAY' | 'CARD' | 'ACH' | 'VISA_DIRECT' | 'MASTERCARD_SEND' | 'WERO';
export type TransferDirection = 'GABON_TO_CHINA' | 'FRANCE_TO_GABON' | 'GABON_TO_FRANCE' | 'USA_TO_GABON' | 'GABON_TO_USA' | 'CANADA_TO_GABON' | 'GABON_TO_CANADA';

// Country information with proper flag URLs
export const COUNTRIES: Record<CountryCode, { name: string; currency: CurrencyCode; flag: string }> = {
  GA: {
    name: 'Gabon',
    currency: 'XAF',
    flag: 'https://flagcdn.com/ga.svg'
  },
  FR: {
    name: 'France',
    currency: 'EUR',
    flag: 'https://flagcdn.com/fr.svg'
  },
  CN: {
    name: 'Chine',
    currency: 'CNY',
    flag: 'https://flagcdn.com/cn.svg'
  },
  US: {
    name: 'États-Unis',
    currency: 'USD',
    flag: 'https://flagcdn.com/us.svg'
  },
  CA: {
    name: 'Canada',
    currency: 'CAD',
    flag: 'https://flagcdn.com/ca.svg'
  }
};

// Payment method names
export const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  AIRTEL_MONEY: 'Airtel Money',
  CASH: 'Espèces',
  BANK_TRANSFER: 'Virement bancaire',
  WERO: 'Wero',
  ALIPAY: 'Alipay',
  CARD: 'Carte bancaire',
  ACH: 'Virement ACH',
  PAYPAL: 'PayPal'
};

// Receiving method names
export const RECEIVING_METHODS: Record<ReceivingMethod, string> = {
  AIRTEL_MONEY: 'Airtel Money',
  CASH: 'Espèces',
  BANK_TRANSFER: 'Virement bancaire',
  ALIPAY: 'Alipay',
  CARD: 'Carte bancaire',
  ACH: 'Dépôt ACH',
  VISA_DIRECT: 'Visa Direct',
  MASTERCARD_SEND: 'Mastercard Send',
  WERO: 'Wero'
};