import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_3x87tsg';
const EMAILJS_TEMPLATE_ID = 'template_1lu86mp';
const EMAILJS_USER_ID = 'OkSsdAcVb0auKpjI-';

interface TransferNotificationData {
  reference: string;
  amountSent: number;
  amountReceived: number;
  senderCurrency: string;
  receiverCurrency: string;
  senderName: string;
  senderEmail: string;
  fees: number;
  beneficiaryName: string;
  beneficiaryEmail: string;
  paymentMethod: string;
  receivingMethod: string;
  fundsOrigin: string;
  transferReason: string;
}

export const sendTransferNotification = async (data: TransferNotificationData) => {
  try {
    // Formater les modes de paiement et réception pour l'affichage
    const getPaymentMethodDisplay = (method: string) => {
      switch (method) {
        case 'BANK_TRANSFER': return 'Virement bancaire';
        case 'AIRTEL_MONEY': return 'Airtel Money';
        case 'MOOV_MONEY': return 'Moov Money';
        case 'CASH': return 'Espèces';
        case 'ALIPAY': return 'Alipay';
        case 'CARD': return 'Carte bancaire';
        case 'ACH': return 'Virement ACH';
        case 'PAYPAL': return 'PayPal';
        case 'WERO': return 'Wero';
        case 'VISA_DIRECT': return 'Visa Direct';
        case 'MASTERCARD_SEND': return 'Mastercard Send';
        case 'INTERAC': return 'Interac';
        case 'APPLE_PAY': return 'Apple Pay';
        default: return method;
      }
    };

    // Formater l'origine des fonds pour l'affichage
    const getFundsOriginDisplay = (origin: string) => {
      switch (origin) {
        case 'salary': return 'Salaire';
        case 'savings': return 'Épargne';
        case 'business': return 'Revenus d\'entreprise';
        case 'investment': return 'Investissements';
        case 'gift': return 'Don';
        case 'other': return 'Autre';
        default: return origin || 'Non spécifié';
      }
    };

    // Formater la raison du transfert pour l'affichage
    const getTransferReasonDisplay = (reason: string) => {
      switch (reason) {
        case 'family_support': return 'Soutien familial';
        case 'business': return 'Affaires';
        case 'education': return 'Éducation';
        case 'medical': return 'Frais médicaux';
        case 'travel': return 'Voyage';
        case 'other': return 'Autre';
        default: return reason || 'Non spécifié';
      }
    };

    // Envoyer l'email à l'administrateur
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: 'kundapay@gmail.com',
        to_name: 'Admin KundaPay',
        transfer_reference: data.reference,
        amount_sent: `${data.amountSent.toLocaleString('fr-FR')} ${data.senderCurrency}`,
        amount_received: `${data.amountReceived.toLocaleString('fr-FR')} ${data.receiverCurrency}`,
        fees: `${data.fees.toLocaleString('fr-FR')} ${data.senderCurrency}`,
        sender_name: data.senderName,
        sender_email: data.senderEmail,
        beneficiary_name: data.beneficiaryName,
        beneficiary_email: data.beneficiaryEmail,
        payment_method: getPaymentMethodDisplay(data.paymentMethod),
        receiving_method: getPaymentMethodDisplay(data.receivingMethod),
        funds_origin: getFundsOriginDisplay(data.fundsOrigin),
        transfer_reason: getTransferReasonDisplay(data.transferReason),
        date: new Date().toLocaleString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      EMAILJS_USER_ID
    );

    // Envoyer une copie à l'expéditeur
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: data.senderEmail,
        to_name: data.senderName,
        transfer_reference: data.reference,
        amount_sent: `${data.amountSent.toLocaleString('fr-FR')} ${data.senderCurrency}`,
        amount_received: `${data.amountReceived.toLocaleString('fr-FR')} ${data.receiverCurrency}`,
        fees: `${data.fees.toLocaleString('fr-FR')} ${data.senderCurrency}`,
        beneficiary_name: data.beneficiaryName,
        beneficiary_email: data.beneficiaryEmail,
        payment_method: getPaymentMethodDisplay(data.paymentMethod),
        receiving_method: getPaymentMethodDisplay(data.receivingMethod),
        funds_origin: getFundsOriginDisplay(data.fundsOrigin),
        transfer_reason: getTransferReasonDisplay(data.transferReason),
        date: new Date().toLocaleString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      EMAILJS_USER_ID
    );

    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
};