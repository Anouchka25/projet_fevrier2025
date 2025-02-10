{/* Ajouter ces imports au début du fichier */}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/Auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { generateTransferReference } from '../lib/utils';
import { ArrowLeft, Plus, AlertTriangle, Phone } from 'lucide-react';
import InstallPWA from '../components/InstallPWA';
import emailjs from '@emailjs/browser';

// Ajouter ces constantes
const FUNDS_ORIGINS = [
  { value: 'salary', label: 'Salaire' },
  { value: 'savings', label: 'Épargne' },
  { value: 'business', label: 'Revenus d\'entreprise' },
  { value: 'investment', label: 'Investissements' },
  { value: 'gift', label: 'Don' },
  { value: 'other', label: 'Autre' }
];

const TRANSFER_REASONS = [
  { value: 'family_support', label: 'Soutien familial' },
  { value: 'business', label: 'Affaires' },
  { value: 'education', label: 'Éducation' },
  { value: 'medical', label: 'Frais médicaux' },
  { value: 'travel', label: 'Voyage' },
  { value: 'other', label: 'Autre' }
];

interface BeneficiaryFormData {
  firstName: string;
  lastName: string;
  paymentDetails: {
    [key: string]: string;
  };
  fundsOrigin: string;
  transferReason: string;
}

{/* Modifier le composant pour ajouter les nouveaux champs et l'envoi d'email */}
const TransferForm = () => {
  // ... (garder le code existant jusqu'à la définition de beneficiaryForm)

  const [beneficiaryForm, setBeneficiaryForm] = useState<BeneficiaryFormData>({
    firstName: '',
    lastName: '',
    paymentDetails: {},
    fundsOrigin: '',
    transferReason: ''
  });

  // ... (garder le code existant jusqu'à handleSubmit)

  const sendConfirmationEmails = async (transferData: any) => {
    try {
      // Email à l'expéditeur
      await emailjs.send(
        'service_3x87tsg',
        'template_1lu86mp',
        {
          to_email: user?.email,
          to_name: `${user?.user_metadata.first_name} ${user?.user_metadata.last_name}`,
          transfer_reference: transferData.reference,
          amount_sent: `${transferData.amount_sent} ${transferData.sender_currency}`,
          amount_received: `${transferData.amount_received} ${transferData.receiver_currency}`,
          beneficiary_name: `${beneficiaryForm.firstName} ${beneficiaryForm.lastName}`,
          payment_method: transferData.payment_method,
          receiving_method: transferData.receiving_method,
          funds_origin: FUNDS_ORIGINS.find(f => f.value === beneficiaryForm.fundsOrigin)?.label,
          transfer_reason: TRANSFER_REASONS.find(r => r.value === beneficiaryForm.transferReason)?.label,
          date: new Date().toLocaleDateString('fr-FR'),
        },
        'OkSsdAcVb0auKpjI-'
      );

      // Email à l'administrateur
      await emailjs.send(
        'service_3x87tsg',
        'template_1lu86mp',
        {
          to_email: 'kundapay@gmail.com',
          to_name: 'Admin KundaPay',
          transfer_reference: transferData.reference,
          amount_sent: `${transferData.amount_sent} ${transferData.sender_currency}`,
          amount_received: `${transferData.amount_received} ${transferData.receiver_currency}`,
          sender_name: `${user?.user_metadata.first_name} ${user?.user_metadata.last_name}`,
          sender_email: user?.email,
          beneficiary_name: `${beneficiaryForm.firstName} ${beneficiaryForm.lastName}`,
          payment_method: transferData.payment_method,
          receiving_method: transferData.receiving_method,
          funds_origin: FUNDS_ORIGINS.find(f => f.value === beneficiaryForm.fundsOrigin)?.label,
          transfer_reason: TRANSFER_REASONS.find(r => r.value === beneficiaryForm.transferReason)?.label,
          date: new Date().toLocaleDateString('fr-FR'),
        },
        'OkSsdAcVb0auKpjI-'
      );
    } catch (error) {
      console.error('Erreur lors de l\'envoi des emails:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !transferDetails) return;

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const reference = generateTransferReference();
      
      // Créer le nouveau transfert
      const { data: newTransfer, error: newTransferError } = await supabase
        .from('transfers')
        .insert([{
          reference,
          user_id: user.id,
          amount_sent: transferDetails.amountSent,
          fees: transferDetails.fees,
          amount_received: transferDetails.amountReceived,
          sender_currency: transferDetails.senderCurrency,
          receiver_currency: transferDetails.receiverCurrency,
          payment_method: transferDetails.paymentMethod,
          receiving_method: transferDetails.receivingMethod,
          status: 'pending'
        }])
        .select()
        .single();

      if (newTransferError) throw newTransferError;

      // Créer le bénéficiaire
      const { error: beneficiaryError } = await supabase
        .from('beneficiaries')
        .insert([{
          transfer_id: newTransfer.id,
          first_name: beneficiaryForm.firstName,
          last_name: beneficiaryForm.lastName,
          payment_details: {
            ...beneficiaryForm.paymentDetails,
            funds_origin: beneficiaryForm.fundsOrigin,
            transfer_reason: beneficiaryForm.transferReason
          }
        }]);

      if (beneficiaryError) throw beneficiaryError;

      // Envoyer les emails de confirmation
      await sendConfirmationEmails(newTransfer);

      // Nettoyer le localStorage et rediriger
      localStorage.removeItem('transferDetails');
      navigate('/dashboard');
    } catch (err) {
      console.error('Erreur lors de la création du transfert:', err);
      setError('Une erreur est survenue lors de la création du transfert');
    } finally {
      setLoading(false);
    }
  };

  // ... (garder le code existant jusqu'à la section du formulaire des bénéficiaires)

  {/* Ajouter ces champs juste après les champs du bénéficiaire */}
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Origine des fonds
      </label>
      <select
        name="fundsOrigin"
        value={beneficiaryForm.fundsOrigin}
        onChange={handleBeneficiaryChange}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
        required
      >
        <option value="">Sélectionnez l'origine des fonds</option>
        {FUNDS_ORIGINS.map(origin => (
          <option key={origin.value} value={origin.value}>
            {origin.label}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700">
        Raison du transfert
      </label>
      <select
        name="transferReason"
        value={beneficiaryForm.transferReason}
        onChange={handleBeneficiaryChange}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
        required
      >
        <option value="">Sélectionnez la raison du transfert</option>
        {TRANSFER_REASONS.map(reason => (
          <option key={reason.value} value={reason.value}>
            {reason.label}
          </option>
        ))}
      </select>
    </div>
  </div>

  // ... (garder le reste du code existant)