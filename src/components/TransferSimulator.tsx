import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/Auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { calculateTransferDetails } from '../lib/utils';
import { ArrowRight, ArrowUpDown } from 'lucide-react';
import type { MaxAmount } from '../lib/types';
import type { TransferDirection, PaymentMethod, ReceivingMethod, CountryCode } from '../lib/constants';
import { COUNTRIES, PAYMENT_METHODS, RECEIVING_METHODS } from '../lib/constants';

const TransferSimulator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [senderCountry, setSenderCountry] = useState<CountryCode>(user?.user_metadata?.country || 'GA');
  const [receiverCountry, setReceiverCountry] = useState<CountryCode>('GA');
  const [direction, setDirection] = useState<TransferDirection>('FRANCE_TO_GABON');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [receivingMethod, setReceivingMethod] = useState<ReceivingMethod>('AIRTEL_MONEY');
  const [calculation, setCalculation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [maxAmount, setMaxAmount] = useState<MaxAmount | null>(null);
  const [isReceiveAmount, setIsReceiveAmount] = useState<boolean>(false);
  const [currentExchangeRate, setCurrentExchangeRate] = useState<number | null>(null);

  useEffect(() => {
    if (user?.user_metadata?.country) {
      setSenderCountry(user.user_metadata.country);
      if (user.user_metadata.country === 'FR') {
        setReceiverCountry('GA');
        setDirection('FRANCE_TO_GABON');
        setPaymentMethod('BANK_TRANSFER');
        setReceivingMethod('AIRTEL_MONEY');
      } else if (user.user_metadata.country === 'GA') {
        setReceiverCountry('CN');
        setDirection('GABON_TO_CHINA');
        setPaymentMethod('AIRTEL_MONEY');
        setReceivingMethod('ALIPAY');
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchMaxAmount = async () => {
      try {
        const { data: conditions, error } = await supabase
          .from('transfer_conditions')
          .select('*')
          .eq('name', 'MAX_AMOUNT_PER_TRANSFER')
          .single();

        if (error) throw error;
        
        if (conditions) {
          setMaxAmount({
            value: conditions.value,
            currency: conditions.currency
          });
        }
      } catch (err) {
        console.error('Error fetching max amount:', err);
      }
    };

    fetchMaxAmount();
  }, []);

  useEffect(() => {
    const newDirection = getDirection(senderCountry, receiverCountry);
    if (newDirection) {
      setDirection(newDirection);
      const defaultMethods = getDefaultMethods(newDirection);
      setPaymentMethod(defaultMethods.payment);
      setReceivingMethod(defaultMethods.receiving);
    }
  }, [senderCountry, receiverCountry]);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const { data: rates, error } = await supabase
          .from('exchange_rates')
          .select('rate')
          .eq('from_currency', getSenderCurrency())
          .eq('to_currency', getReceiverCurrency())
          .single();

        if (error) throw error;
        setCurrentExchangeRate(rates.rate);
      } catch (err) {
        console.error('Error fetching exchange rate:', err);
        setCurrentExchangeRate(null);
      }
    };

    if (senderCountry && receiverCountry) {
      fetchExchangeRate();
    }
  }, [senderCountry, receiverCountry]);

  const getDefaultMethods = (dir: TransferDirection): { payment: PaymentMethod; receiving: ReceivingMethod } => {
    switch (dir) {
      case 'FRANCE_TO_GABON':
        return { payment: 'BANK_TRANSFER', receiving: 'AIRTEL_MONEY' };
      case 'GABON_TO_CHINA':
        return { payment: 'AIRTEL_MONEY', receiving: 'ALIPAY' };
      case 'GABON_TO_FRANCE':
        return { payment: 'AIRTEL_MONEY', receiving: 'BANK_TRANSFER' };
      case 'USA_TO_GABON':
        return { payment: 'CARD', receiving: 'AIRTEL_MONEY' };
      case 'GABON_TO_USA':
        return { payment: 'AIRTEL_MONEY', receiving: 'ACH' };
      case 'CANADA_TO_GABON':
        return { payment: 'CARD', receiving: 'AIRTEL_MONEY' };
      case 'GABON_TO_CANADA':
        return { payment: 'AIRTEL_MONEY', receiving: 'INTERAC' };
      default:
        return { payment: 'BANK_TRANSFER', receiving: 'AIRTEL_MONEY' };
    }
  };

  const getDirection = (from: CountryCode, to: CountryCode): TransferDirection | null => {
    if (from === 'GA') {
      if (to === 'CN') return 'GABON_TO_CHINA';
      if (to === 'FR') return 'GABON_TO_FRANCE';
      if (to === 'US') return 'GABON_TO_USA';
      if (to === 'CA') return 'GABON_TO_CANADA';
    } else if (to === 'GA') {
      if (from === 'FR') return 'FRANCE_TO_GABON';
      if (from === 'US') return 'USA_TO_GABON';
      if (from === 'CA') return 'CANADA_TO_GABON';
    }
    return null;
  };

  const getAvailableDestinations = () => {
    if (!senderCountry) return [];
    
    switch (senderCountry) {
      case 'GA':
        return [
          { code: 'CN', name: 'Chine' },
          { code: 'FR', name: 'France' },
          { code: 'US', name: 'États-Unis' },
          { code: 'CA', name: 'Canada' }
        ];
      case 'FR':
        return [{ code: 'GA', name: 'Gabon' }];
      case 'US':
        return [{ code: 'GA', name: 'Gabon' }];
      case 'CA':
        return [{ code: 'GA', name: 'Gabon' }];
      case 'CN':
        return [{ code: 'GA', name: 'Gabon' }];
      default:
        return [];
    }
  };

  const getSenderCurrency = () => {
    switch (senderCountry) {
      case 'FR':
        return 'EUR';
      case 'US':
        return 'USD';
      case 'CA':
        return 'CAD';
      case 'CN':
        return 'CNY';
      default:
        return 'XAF';
    }
  };

  const getReceiverCurrency = () => {
    switch (receiverCountry) {
      case 'FR':
        return 'EUR';
      case 'US':
        return 'USD';
      case 'CA':
        return 'CAD';
      case 'CN':
        return 'CNY';
      default:
        return 'XAF';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (calculation) {
      localStorage.setItem('transferDetails', JSON.stringify({
        ...calculation,
        direction,
        paymentMethod,
        receivingMethod
      }));
      
      if (user) {
        navigate('/transfer');
      } else {
        navigate('/auth');
      }
    }
  };

  const handleSenderCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSenderCountry = e.target.value as CountryCode;
    setSenderCountry(newSenderCountry);
    
    if (newSenderCountry === 'GA') {
      setReceiverCountry('CN');
    } else {
      setReceiverCountry('GA');
    }
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newReceiverCountry = e.target.value as CountryCode;
    setReceiverCountry(newReceiverCountry);
  };

  const getAvailablePaymentMethods = () => {
    switch (direction) {
      case 'GABON_TO_CHINA':
        return [
          { value: 'AIRTEL_MONEY', label: PAYMENT_METHODS.AIRTEL_MONEY },
          { value: 'CASH', label: PAYMENT_METHODS.CASH }
        ];
      case 'FRANCE_TO_GABON':
        return [
          { value: 'BANK_TRANSFER', label: PAYMENT_METHODS.BANK_TRANSFER },
          { value: 'CARD', label: PAYMENT_METHODS.CARD },
          { value: 'PAYPAL', label: PAYMENT_METHODS.PAYPAL },
          { value: 'WERO', label: PAYMENT_METHODS.WERO }
        ];
      case 'USA_TO_GABON':
        return [
          { value: 'CARD', label: PAYMENT_METHODS.CARD },
          { value: 'ACH', label: PAYMENT_METHODS.ACH },
          { value: 'APPLE_PAY', label: PAYMENT_METHODS.APPLE_PAY },
          { value: 'PAYPAL', label: PAYMENT_METHODS.PAYPAL }
        ];
      case 'CANADA_TO_GABON':
        return [
          { value: 'CARD', label: PAYMENT_METHODS.CARD },
          { value: 'INTERAC', label: PAYMENT_METHODS.INTERAC },
          { value: 'PAYPAL', label: PAYMENT_METHODS.PAYPAL }
        ];
      case 'GABON_TO_USA':
      case 'GABON_TO_CANADA':
      case 'GABON_TO_FRANCE':
        return [
          { value: 'AIRTEL_MONEY', label: PAYMENT_METHODS.AIRTEL_MONEY },
          { value: 'CASH', label: PAYMENT_METHODS.CASH }
        ];
      default:
        return [];
    }
  };

  const getAvailableReceivingMethods = () => {
    switch (direction) {
      case 'GABON_TO_CHINA':
        return [{ value: 'ALIPAY', label: RECEIVING_METHODS.ALIPAY }];
      case 'FRANCE_TO_GABON':
      case 'USA_TO_GABON':
      case 'CANADA_TO_GABON':
        return [
          { value: 'AIRTEL_MONEY', label: RECEIVING_METHODS.AIRTEL_MONEY },
          { value: 'CASH', label: RECEIVING_METHODS.CASH }
        ];
      case 'GABON_TO_FRANCE':
        return [
          { value: 'WERO', label: RECEIVING_METHODS.WERO },
          { value: 'BANK_TRANSFER', label: RECEIVING_METHODS.BANK_TRANSFER }
        ];
      case 'GABON_TO_USA':
        return [
          { value: 'ACH', label: RECEIVING_METHODS.ACH },
          { value: 'VISA_DIRECT', label: RECEIVING_METHODS.VISA_DIRECT },
          { value: 'MASTERCARD_SEND', label: RECEIVING_METHODS.MASTERCARD_SEND }
        ];
      case 'GABON_TO_CANADA':
        return [
          { value: 'INTERAC', label: RECEIVING_METHODS.INTERAC },
          { value: 'VISA_DIRECT', label: RECEIVING_METHODS.VISA_DIRECT },
          { value: 'MASTERCARD_SEND', label: RECEIVING_METHODS.MASTERCARD_SEND }
        ];
      default:
        return [];
    }
  };

  useEffect(() => {
    const calculateAmount = async () => {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        setCalculation(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await calculateTransferDetails(
          Number(amount),
          direction,
          paymentMethod,
          receivingMethod,
          isReceiveAmount
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
  }, [amount, direction, paymentMethod, receivingMethod, isReceiveAmount]);

  const formatNumber = (value: number): string => {
    return value.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Envoyer de l'argent</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {!user && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pays de l'expéditeur
                      </label>
                      <div className="relative">
                        <select
                          value={senderCountry}
                          onChange={handleSenderCountryChange}
                          className="mt-1 block w-full pl-10 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 rounded-md shadow-sm"
                        >
                          <option value="GA">Gabon</option>
                          <option value="FR">France</option>
                          <option value="US">États-Unis</option>
                          <option value="CA">Canada</option>
                        </select>
                        <img 
                          src={COUNTRIES[senderCountry].flag}
                          alt={`Drapeau ${COUNTRIES[senderCountry].name}`}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-3"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pays de destination
                    </label>
                    <div className="relative">
                      <select
                        value={receiverCountry}
                        onChange={handleDestinationChange}
                        className="mt-1 block w-full pl-10 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 rounded-md shadow-sm"
                      >
                        {getAvailableDestinations().map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                      <img 
                        src={COUNTRIES[receiverCountry].flag}
                        alt={`Drapeau ${COUNTRIES[receiverCountry].name}`}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-3"
                      />
                    </div>
                  </div>
                </div>

                {!error && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mode de paiement
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {getAvailablePaymentMethods().map((method) => (
                          <label key={method.value} className="flex items-center p-4 border rounded-md hover:bg-gray-50 cursor-pointer">
                            <input
                              type="radio"
                              value={method.value}
                              checked={paymentMethod === method.value}
                              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                              className="h-4 w-4 text-yellow-500 focus:ring-yellow-500"
                            />
                            <span className="ml-3 text-sm">{method.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mode de réception
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {getAvailableReceivingMethods().map((method) => (
                          <label key={method.value} className="flex items-center p-4 border rounded-md hover:bg-gray-50 cursor-pointer">
                            <input
                              type="radio"
                              value={method.value}
                              checked={receivingMethod === method.value}
                              onChange={(e) => setReceivingMethod(e.target.value as ReceivingMethod)}
                              className="h-4 w-4 text-yellow-500 focus:ring-yellow-500"
                            />
                            <span className="ml-3 text-sm">{method.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Right column */}
              <div className="space-y-6">
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
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="amount"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="block w-full py-3 pr-12 border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 shadow-sm text-lg"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-lg">
                        {isReceiveAmount ? getReceiverCurrency() : getSenderCurrency()}
                      </span>
                    </div>
                  </div>
                  {maxAmount && (
                    <p className="mt-2 text-sm text-gray-500">
                      Montant maximum autorisé : {maxAmount.value.toLocaleString()} {maxAmount.currency}
                     - Contactez-nous pour des montants supérieurs.</p>
                  )}
                </div>

                {currentExchangeRate && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Taux de change actuel :</p>
                    <p className="text-lg font-medium text-gray-900">
                      1 {getSenderCurrency()} = {currentExchangeRate.toFixed(2)} {getReceiverCurrency()}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {calculation && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Montant à envoyer</span>
                      <span className="text-lg font-bold text-gray-900">
                        {formatNumber(calculation.amountSent)} {calculation.senderCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Frais</span>
                      <span className="text-sm text-gray-900">
                        {formatNumber(calculation.fees)} {calculation.senderCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Montant à recevoir</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatNumber(calculation.amountReceived)} {calculation.receiverCurrency}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t">
              <button
                type="submit"
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!calculation || loading}
              >
                {loading ? 'Chargement...' : 'Continuer'} <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransferSimulator;