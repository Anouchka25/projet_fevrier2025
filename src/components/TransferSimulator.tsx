import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './Auth/AuthProvider';
import { ArrowRight, ArrowUpDown } from 'lucide-react';
import { calculateTransferDetails, formatCurrency } from '../lib/utils';
import { validate_promo_code } from '../lib/supabase';
import { COUNTRIES, type CountryCode } from '../lib/constants';

const TRANSFER_ROUTES: Record<CountryCode, CountryCode[]> = {
  GA: ['FR', 'BE', 'DE', 'CN', 'US', 'CA'], // Gabon can send to all these countries
  FR: ['GA'], // France can only send to Gabon
  BE: ['GA'], // Belgium can only send to Gabon
  DE: ['GA'], // Germany can only send to Gabon
  US: ['GA'], // USA can only send to Gabon
  CA: ['GA'], // Canada can only send to Gabon
  CN: [] // China can't send (only receive)
};

const PAYMENT_METHODS = {
  'GA': {
    'FR': [
      { value: 'AIRTEL_MONEY', label: 'Airtel Money', icon: '/airtel-money.png' },
      { value: 'MOOV_MONEY', label: 'Moov Money', icon: '/moov-money.png' }
    ],
    'BE': [
      { value: 'AIRTEL_MONEY', label: 'Airtel Money', icon: '/airtel-money.png' },
      { value: 'MOOV_MONEY', label: 'Moov Money', icon: '/moov-money.png' }
    ],
    'DE': [
      { value: 'AIRTEL_MONEY', label: 'Airtel Money', icon: '/airtel-money.png' },
      { value: 'MOOV_MONEY', label: 'Moov Money', icon: '/moov-money.png' }
    ],
    'CN': [
      { value: 'AIRTEL_MONEY', label: 'Airtel Money', icon: '/airtel-money.png' },
      { value: 'MOOV_MONEY', label: 'Moov Money', icon: '/moov-money.png' }
    ],
    'US': [
      { value: 'AIRTEL_MONEY', label: 'Airtel Money', icon: '/airtel-money.png' },
      { value: 'MOOV_MONEY', label: 'Moov Money', icon: '/moov-money.png' }
    ],
    'CA': [
      { value: 'AIRTEL_MONEY', label: 'Airtel Money', icon: '/airtel-money.png' },
      { value: 'MOOV_MONEY', label: 'Moov Money', icon: '/moov-money.png' }
    ]
  },
  'FR': {
    'GA': [
     // { value: 'CARD', label: 'Carte Bancaire', icon: '/cb.png' },
      { value: 'WERO', label: 'Wero ou PayLib', icon: '/wero.png' },
      { value: 'PAYPAL', label: 'PayPal', icon: '/paypal.png' },
      { value: 'BANK_TRANSFER', label: 'Virement bancaire', icon: '/virement-bancaire.jpg' }
    ]
  },
  'BE': {
    'GA': [
      { value: 'BANK_TRANSFER', label: 'Virement bancaire', icon: '/virement-bancaire.jpg' },
      { value: 'WERO', label: 'Wero ou PayLib', icon: '/wero.png' },
      { value: 'PAYPAL', label: 'PayPal', icon: '/paypal.png' }
    ]
  },
  'DE': {
    'GA': [
      { value: 'BANK_TRANSFER', label: 'Virement bancaire', icon: '/virement-bancaire.jpg' },
      { value: 'WERO', label: 'Wero ou PayLib', icon: '/wero.png' },
      { value: 'PAYPAL', label: 'PayPal', icon: '/paypal.png' }
    ]
  },
  'US': {
    'GA': [
      { value: 'PAYPAL', label: 'PayPal', icon: '/paypal.png' }
    ]
  },
  'CA': {
    'GA': [
      { value: 'PAYPAL', label: 'PayPal', icon: '/paypal.png' }
    ]
  }
};

const RECEIVING_METHODS = {
  'GA': {
    'FR': [
      { value: 'AIRTEL_MONEY', label: 'Airtel Money', icon: '/airtel-money.png' },
      { value: 'MOOV_MONEY', label: 'Moov Money', icon: '/moov-money.png' }
    ],
    'BE': [
      { value: 'AIRTEL_MONEY', label: 'Airtel Money', icon: '/airtel-money.png' },
      { value: 'MOOV_MONEY', label: 'Moov Money', icon: '/moov-money.png' }
    ],
    'DE': [
      { value: 'AIRTEL_MONEY', label: 'Airtel Money', icon: '/airtel-money.png' },
      { value: 'MOOV_MONEY', label: 'Moov Money', icon: '/moov-money.png' }
    ],
    'US': [
      { value: 'AIRTEL_MONEY', label: 'Airtel Money', icon: '/airtel-money.png' },
      { value: 'MOOV_MONEY', label: 'Moov Money', icon: '/moov-money.png' }
    ],
    'CA': [
      { value: 'AIRTEL_MONEY', label: 'Airtel Money', icon: '/airtel-money.png' },
      { value: 'MOOV_MONEY', label: 'Moov Money', icon: '/moov-money.png' }
    ]
  },
  'FR': {
    'GA': [
      { value: 'BANK_TRANSFER', label: 'Virement bancaire', icon: '/virement-bancaire.jpg' },
      { value: 'WERO', label: 'Wero ou PayLib', icon: '/wero.png' },
      { value: 'PAYPAL', label: 'PayPal', icon: '/paypal.png' }
    ]
  },
  'BE': {
    'GA': [
      { value: 'BANK_TRANSFER', label: 'Virement bancaire', icon: '/virement-bancaire.jpg' },
      { value: 'WERO', label: 'Wero ou PayLib', icon: '/wero.png' },
      { value: 'PAYPAL', label: 'PayPal', icon: '/paypal.png' }
    ]
  },
  'DE': {
    'GA': [
      { value: 'BANK_TRANSFER', label: 'Virement bancaire', icon: '/virement-bancaire.jpg' },
      { value: 'WERO', label: 'Wero ou PayLib', icon: '/wero.png' },
      { value: 'PAYPAL', label: 'PayPal', icon: '/paypal.png' }
    ]
  },
  'CN': {
    'GA': [
      { value: 'ALIPAY', label: 'Alipay', icon: '/1000133611.6795ed4372fe81.90775491.png' }
    ]
  },
  'US': {
    'GA': [
      { value: 'PAYPAL', label: 'PayPal', icon: '/paypal.png' }
    ]
  },
  'CA': {
    'GA': [
      { value: 'PAYPAL', label: 'PayPal', icon: '/paypal.png' }
    ]
  }
};

const getDefaultPaymentMethod = (fromCountry: CountryCode, toCountry: CountryCode) => {
  const methods = PAYMENT_METHODS[fromCountry]?.[toCountry];
  if (!methods?.length) return '';
  return methods[0].value;
};

const getDefaultReceivingMethod = (fromCountry: CountryCode, toCountry: CountryCode) => {
  const methods = RECEIVING_METHODS[toCountry]?.[fromCountry];
  if (!methods?.length) return '';
  return methods[0].value;
};

const getDirectionFromCountries = (fromCountry: CountryCode, toCountry: CountryCode): string => {
  const countryNameMap: Record<CountryCode, string> = {
    'GA': 'GABON',
    'FR': 'FRANCE',
    'BE': 'BELGIUM',
    'DE': 'GERMANY', 
    'CN': 'CHINA',
    'US': 'USA',
    'CA': 'CANADA'
  };

  return `${countryNameMap[fromCountry]}_TO_${countryNameMap[toCountry]}`;
};

const TransferSimulator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [fromCountry, setFromCountry] = useState<CountryCode>('FR');
  const [toCountry, setToCountry] = useState<CountryCode>('GA');
  const [paymentMethod, setPaymentMethod] = useState(getDefaultPaymentMethod('FR', 'GA'));
  const [receivingMethod, setReceivingMethod] = useState(getDefaultReceivingMethod('FR', 'GA'));
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReceiveAmount, setIsReceiveAmount] = useState<boolean>(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeValid, setPromoCodeValid] = useState(false);
  const [promoCodeMessage, setPromoCodeMessage] = useState('');
  const [suggestedPromoCode, setSuggestedPromoCode] = useState<string | null>(null);

  // Update payment and receiving methods when countries change
  useEffect(() => {

   // Vérifie que `toCountry` est bien une destination valide pour `fromCountry`
  const validDestinations = TRANSFER_ROUTES[fromCountry] || [];
  if (!validDestinations.includes(toCountry)) {
    setToCountry(validDestinations[0] || 'GA'); // Sélectionne le premier pays valide
  }
    
    setPaymentMethod(getDefaultPaymentMethod(fromCountry, toCountry));
    setReceivingMethod(getDefaultReceivingMethod(fromCountry, toCountry));
  }, [fromCountry, toCountry]);

  useEffect(() => {
    const calculateAmount = async () => {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        setCalculation(null);
        setError(null);
        setSuggestedPromoCode(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Check if we should suggest a promo code
        if (toCountry === 'GA' && !isReceiveAmount) {
          const amountNum = Number(amount);
          if (amountNum >= 1000) {
            setSuggestedPromoCode('WELCOME75');
          } else if (amountNum >= 500) {
            setSuggestedPromoCode('WELCOME50');
          } else {
            setSuggestedPromoCode(null);
          }
        } else {
          setSuggestedPromoCode(null);
        }

        const direction = getDirectionFromCountries(fromCountry, toCountry);
        const result = await calculateTransferDetails(
          Number(amount),
          direction,
          paymentMethod,
          receivingMethod,
          isReceiveAmount,
          promoCodeValid ? promoCode : undefined
        );
        
        setCalculation(result);
        setError(null);
      } catch (err) {
        setCalculation(null);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Une erreur inattendue est survenue');
        }
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(calculateAmount, 500);
    return () => clearTimeout(timeoutId);
  }, [amount, fromCountry, toCountry, paymentMethod, receivingMethod, isReceiveAmount, promoCode, promoCodeValid]);

  const handlePromoCodeChange = async (code: string) => {
    setPromoCode(code);
    if (!code) {
      setPromoCodeValid(false);
      setPromoCodeMessage('');
      return;
    }

    try {
      const direction = getDirectionFromCountries(fromCountry, toCountry);
      const { data, error } = await validate_promo_code(code, direction);
      if (error) throw error;

      if (data && data.length > 0) {
        const validation = data[0];
        setPromoCodeValid(validation.valid);
        setPromoCodeMessage(validation.message);
      }
    } catch (err) {
      console.error('Error validating promo code:', err);
      setPromoCodeValid(false);
      setPromoCodeMessage('Erreur lors de la validation du code promo');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculation) {
      localStorage.setItem('transferDetails', JSON.stringify({
        ...calculation,
        direction: getDirectionFromCountries(fromCountry, toCountry),
        paymentMethod,
        receivingMethod,
        promoCode: promoCodeValid ? promoCode : undefined
      }));
      navigate('/transfer');
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Effectuer un transfert d'argent
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Country Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fromCountry" className="block text-sm font-medium text-gray-700 mb-2">
                    Pays d'envoi
                  </label>
                  <div className="relative">
                    <select
                      id="fromCountry"
                      value={fromCountry}
                      onChange={(e) => setFromCountry(e.target.value as CountryCode)}
                      className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 rounded-lg"
                    >
                      {Object.entries(COUNTRIES)
                        .filter(([code]) => TRANSFER_ROUTES[code as CountryCode]?.length > 0)
                        .map(([code, country]) => (
                          <option key={code} value={code}>
                            {country.name}
                          </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <img 
                        src={COUNTRIES[fromCountry].flag} 
                        alt={COUNTRIES[fromCountry].name} 
                        className="w-6 h-4 rounded shadow-sm" 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="toCountry" className="block text-sm font-medium text-gray-700 mb-2">
                    Pays de réception
                  </label>
                  <div className="relative">
                    <select
                      id="toCountry"
                      value={toCountry}
                      onChange={(e) => setToCountry(e.target.value as CountryCode)}
                      className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 rounded-lg"
                    >
                      {TRANSFER_ROUTES[fromCountry]?.map((code) => (
                        <option key={code} value={code}>
                          {COUNTRIES[code].name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <img 
                        src={COUNTRIES[toCountry].flag} 
                        alt={COUNTRIES[toCountry].name} 
                        className="w-6 h-4 rounded shadow-sm" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    {isReceiveAmount ? "Montant à recevoir" : "Montant à envoyer"}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsReceiveAmount(!isReceiveAmount);
                      setAmount('');
                      setCalculation(null);
                    }}
                    className="inline-flex items-center text-sm text-yellow-600 hover:text-yellow-700"
                  >
                    <ArrowUpDown className="h-4 w-4 mr-1" />
                    Inverser le calcul
                  </button>
                </div>
                {fromCountry === 'GA' && (
                  <p className="text-red-600 text-sm mb-2">
                    Attention, tous les transferts <strong>depuis le Gabon</strong> sont limités pour l'instant à 100 000 XAF par utilisateur et par semaine.
                  </p>
                )}
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full pr-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 pl-4 py-3 text-lg"
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                      {COUNTRIES[isReceiveAmount ? toCountry : fromCountry].currency}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de paiement
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {PAYMENT_METHODS[fromCountry]?.[toCountry]?.map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentMethod(method.value)}
                      className={`flex items-center justify-center p-4 border-2 rounded-lg ${
                        paymentMethod === method.value
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-200 hover:border-yellow-200'
                      }`}
                    >
                      <img src={method.icon} alt={method.label} className="h-6 w-6 mr-2 object-contain" />
                      <span className="text-sm font-medium">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="receivingMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de réception
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {RECEIVING_METHODS[toCountry]?.[fromCountry]?.map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setReceivingMethod(method.value)}
                      className={`flex items-center justify-center p-4 border-2 rounded-lg ${
                        receivingMethod === method.value
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-200 hover:border-yellow-200'
                      }`}
                    >
                      <img src={method.icon} alt={method.label} className="h-6 w-6 mr-2 object-contain" />
                      <span className="text-sm font-medium">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggestion de code promo */}
              {suggestedPromoCode && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Utilisez le code promo <strong>{suggestedPromoCode}</strong> pour bénéficier d'une réduction de {suggestedPromoCode === 'WELCOME75' ? '75%' : '50%'} sur les frais !
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="promoCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Code promo (optionnel)
                </label>
                <input
                  type="text"
                  id="promoCode"
                  value={promoCode}
                  onChange={(e) => handlePromoCodeChange(e.target.value)}
                  className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-2 ${
                    promoCodeValid ? 'border-green-300' : promoCode ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Entrez votre code promo"
                />
                {promoCodeMessage && (
                  <p className={`mt-2 text-sm ${promoCodeValid ? 'text-green-600' : 'text-red-600'}`}>
                    {promoCodeMessage}
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {calculation && (
                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Montant à envoyer</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(calculation.amountSent, calculation.senderCurrency)} {calculation.senderCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Frais</span>
                    <span className="text-sm text-gray-900">
                      {formatCurrency(calculation.fees, calculation.senderCurrency)} {calculation.senderCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Montant à recevoir</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(calculation.amountReceived, calculation.receiverCurrency)} {calculation.receiverCurrency}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!calculation || loading}
              >
                {loading ? 'Chargement...' : 'Continuer'} <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </form>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Taux de change
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <p className="text-lg font-medium">
                  1 EUR = 655,96 XAF
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <p className="text-lg font-medium">
                  1 EUR = 7,51 CNY
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <p className="text-lg font-medium">
                  1 EUR = 1,45 CAD
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <p className="text-lg font-medium">
                  1 EUR = 1,08 USD
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransferSimulator;