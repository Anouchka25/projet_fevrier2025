export function calculateTransferDetails(
  amount: number,
  direction: string,
  paymentMethod: string,
  receivingMethod: string,
  isReceiveAmount: boolean = false
) {
  // Taux de change simplifiés pour la démo
  const exchangeRates = {
    'EUR_XAF': 655.96,
    'XAF_EUR': 1/655.96,
    'EUR_CNY': 7.5099,
    'CNY_EUR': 1/7.5099,
    'XAF_CNY': 0.011445,
    'CNY_XAF': 87.34
  };

  // Frais simplifiés pour la démo
  const fees = {
    'GABON_TO_CHINA': 0.085,
    'FRANCE_TO_GABON': 0.005,
    'GABON_TO_FRANCE': 0.055
  };

  // Déterminer les devises
  let fromCurrency, toCurrency;
  switch (direction) {
    case 'GABON_TO_CHINA':
      fromCurrency = 'XAF';
      toCurrency = 'CNY';
      break;
    case 'FRANCE_TO_GABON':
      fromCurrency = 'EUR';
      toCurrency = 'XAF';
      break;
    case 'GABON_TO_FRANCE':
      fromCurrency = 'XAF';
      toCurrency = 'EUR';
      break;
    default:
      throw new Error('Direction non supportée');
  }

  // Calculer le taux de change
  const exchangeRate = exchangeRates[`${fromCurrency}_${toCurrency}`];
  const fee = fees[direction];

  let amountSent, amountReceived;
  if (isReceiveAmount) {
    amountReceived = amount;
    amountSent = amount / (exchangeRate * (1 - fee));
  } else {
    amountSent = amount;
    amountReceived = amount * (1 - fee) * exchangeRate;
  }

  // Arrondir les montants
  if (fromCurrency === 'XAF') {
    amountSent = Math.ceil(amountSent / 5) * 5;
  }
  if (toCurrency === 'XAF') {
    amountReceived = Math.floor(amountReceived / 5) * 5;
  }

  const feeAmount = amountSent * fee;

  return {
    amountSent,
    fees: feeAmount,
    amountReceived,
    senderCurrency: fromCurrency,
    receiverCurrency: toCurrency,
    exchangeRate,
    direction,
    paymentMethod,
    receivingMethod
  };
}