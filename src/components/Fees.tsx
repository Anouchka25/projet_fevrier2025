import React, { useState, useEffect } from 'react';
import { getExchangeRates, getTransferFees } from '../lib/supabase';

interface ExchangeRate {
  from_currency: string;
  to_currency: string;
  rate: number;
}

interface TransferFee {
  from_country: string;
  to_country: string;
  payment_method: string;
  receiving_method: string;
  fee_percentage: number;
}

const countryFlags: { [key: string]: string } = {
  GA: "https://flagcdn.com/ga.svg",
  FR: "https://flagcdn.com/fr.svg",
  CN: "https://flagcdn.com/cn.svg",
  US: "https://flagcdn.com/us.svg",
  CA: "https://flagcdn.com/ca.svg"
};

const countryNames: { [key: string]: string } = {
  GA: "Gabon",
  FR: "France",
  CN: "Chine",
  US: "États-Unis",
  CA: "Canada"
};

const methodNames: { [key: string]: string } = {
  AIRTEL_MONEY: "Airtel Money",
  CASH: "Paiement en espèces",
  BANK_TRANSFER: "Virement bancaire",
  ALIPAY: "Alipay",
  CARD: "Carte bancaire",
  ACH: "Virement ACH",
  INTERAC: "Virement Interac",
  APPLE_PAY: "Apple Pay",
  PAYPAL: "PayPal",
  VISA_DIRECT: "Visa Direct",
  MASTERCARD_SEND: "Mastercard Send",
  WERO: "Wero"
};

const Fees = () => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [transferFees, setTransferFees] = useState<TransferFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer les données
        const [rates, fees] = await Promise.all([
          getExchangeRates(),
          getTransferFees()
        ]);

        // Vérifier si nous avons des données valides
        if (!rates || !fees || rates.length === 0 || fees.length === 0) {
          throw new Error('Données non disponibles');
        }

        // Filtrer et trier les taux de change
        const filteredRates = rates
          .filter(rate => {
            // Exclure les taux EUR/XAF et XAF/EUR car ils sont fixes
            if ((rate.from_currency === 'EUR' && rate.to_currency === 'XAF') ||
                (rate.from_currency === 'XAF' && rate.to_currency === 'EUR')) {
              return false;
            }
            return true;
          })
          .sort((a, b) => {
            // Trier par devise source puis devise cible
            if (a.from_currency !== b.from_currency) {
              return a.from_currency.localeCompare(b.from_currency);
            }
            return a.to_currency.localeCompare(b.to_currency);
          });

        setExchangeRates(filteredRates);
        setTransferFees(fees);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Les informations sur les frais et taux de change sont temporairement indisponibles. Veuillez réessayer ultérieurement.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatRate = (rate: number): string => {
    if (rate < 0.01) {
      return rate.toFixed(6);
    } else if (rate < 1) {
      return rate.toFixed(4);
    } else {
      return rate.toFixed(2);
    }
  };

  if (loading) {
    return (
      <section id="fees" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="space-y-6">
              <div className="h-40 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="fees" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-700">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="fees" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Frais et moyens de paiement
        </h2>
        
        {/* Taux de change */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Taux de change
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Taux fixe EUR/XAF */}
            <div className="bg-yellow-50 rounded-lg p-6 shadow-sm">
              <div className="text-lg text-center">
                <span className="font-medium">
                  1 EUR = 655,96 XAF
                </span>
              </div>
            </div>
            {/* Autres taux de change */}
            {exchangeRates.map((rate, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 shadow-sm">
                <div className="text-lg text-center">
                  <span className="font-medium">
                    1 {rate.from_currency} = {formatRate(rate.rate)} {rate.to_currency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tableau des frais */}
        <div className="mt-8 flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <div className="bg-gray-50 px-6 py-3 text-sm text-gray-500">
                  Note : Le paiement en espèces se fait chez une agence partenaire.
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Origine
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Destination
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Moyen de paiement
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Moyen de réception
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Frais
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transferFees.map((fee, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <img src={countryFlags[fee.from_country]} alt={`Drapeau ${countryNames[fee.from_country]}`} className="h-6 w-8 object-cover rounded mr-2" />
                            {countryNames[fee.from_country]}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <img src={countryFlags[fee.to_country]} alt={`Drapeau ${countryNames[fee.to_country]}`} className="h-6 w-8 object-cover rounded mr-2" />
                            {countryNames[fee.to_country]}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {methodNames[fee.payment_method]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {methodNames[fee.receiving_method]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(fee.fee_percentage * 100).toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Fees;