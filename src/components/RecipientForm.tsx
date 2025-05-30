import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from './Auth/AuthProvider';
import type { TransferDirection, ReceivingMethod } from '../lib/constants';

interface RecipientFormProps {
  transferDetails: {
    direction: TransferDirection;
    receivingMethod: ReceivingMethod;
    amountSent: number;
    amountReceived: number;
    senderCurrency: string;
    receiverCurrency: string;
    fees: number;
    includeWithdrawalFees?: boolean;
  };
  onBack: () => void;
  onSubmit: (recipientData: RecipientData) => void;
}

export interface RecipientData {
  firstName: string;
  lastName: string;
  email?: string; // Email is optional
  phone: string;
  alipayId?: string;
  weroName?: string;
  bitcoinAddress?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  bankDetails?: {
    bankName: string;
    accountNumber: string; // This will be used for IBAN
    routingNumber?: string;
    swiftCode?: string;
  };
  cardDetails?: {
    cardNumber: string;
    expiryDate: string;
    cardholderName: string;
  };
  fundsOrigin: string;
  transferReason: string;
}

interface Beneficiary {
  id: string;
  first_name: string;
  last_name: string;
  email?: string; // Email is optional
  payment_details: any;
  transfer_id: string;
}

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

const RecipientForm: React.FC<RecipientFormProps> = ({ transferDetails, onBack, onSubmit }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<RecipientData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alipayId: '',
    weroName: '',
    bitcoinAddress: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: transferDetails.direction === 'GABON_TO_USA' ? 'US' : 
               transferDetails.direction === 'GABON_TO_CANADA' ? 'CA' : ''
    },
    bankDetails: {
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      swiftCode: ''
    },
    cardDetails: {
      cardNumber: '',
      expiryDate: '',
      cardholderName: ''
    },
    fundsOrigin: '',
    transferReason: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingBeneficiaries, setExistingBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string>('');
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check if the beneficiary is in Gabon (receiving country is Gabon)
  const isBeneficiaryInGabon = () => {
    return transferDetails.direction.includes('_TO_GABON');
  };

  useEffect(() => {
    // Check if screen is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (user) {
      fetchBeneficiaries();
    }
  }, [user]);

  const fetchBeneficiaries = async () => {
    try {
      if (!user?.id) return;
      
      // Get all beneficiaries
      const { data, error } = await supabase
        .from('beneficiaries')
        .select(`
          id,
          first_name,
          last_name,
          email,
          payment_details,
          transfer_id
        `)
        .eq('user_id', user.id) // filtre par utilisateur connecté
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter out duplicates by keeping only the most recent beneficiary with a given name
      const uniqueBeneficiaries = data?.reduce((acc: Beneficiary[], current) => {
        const nameKey = `${current.first_name}-${current.last_name}`.toLowerCase();
        const existingIndex = acc.findIndex(b => 
          `${b.first_name}-${b.last_name}`.toLowerCase() === nameKey
        );
        
        if (existingIndex === -1) {
          acc.push(current);
        }
        
        return acc;
      }, []) || [];
      
      setExistingBeneficiaries(uniqueBeneficiaries);
    } catch (err) {
      console.error('Error fetching beneficiaries:', err);
    }
  };

  const handleBeneficiarySelect = (beneficiaryId: string) => {
    const beneficiary = existingBeneficiaries.find(b => b.id === beneficiaryId);
    if (beneficiary) {
      setFormData({
        ...formData,
        firstName: beneficiary.first_name,
        lastName: beneficiary.last_name,
        email: beneficiary.email || '',
        phone: beneficiary.payment_details?.phone || '',
        alipayId: beneficiary.payment_details?.alipayId || '',
        weroName: beneficiary.payment_details?.weroName || '',
        bitcoinAddress: beneficiary.payment_details?.bitcoinAddress || '',
        address: beneficiary.payment_details?.address || formData.address,
        bankDetails: beneficiary.payment_details?.bankDetails || formData.bankDetails,
        cardDetails: beneficiary.payment_details?.cardDetails || formData.cardDetails,
        fundsOrigin: beneficiary.payment_details?.fundsOrigin || '',
        transferReason: beneficiary.payment_details?.transferReason || ''
      });
      setSelectedBeneficiary(beneficiaryId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof RecipientData],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    // Email validation is optional and not required for Gabon recipients
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    // Validate funds origin and transfer reason
    if (!formData.fundsOrigin) {
      newErrors.fundsOrigin = 'L\'origine des fonds est requise';
    }
    if (!formData.transferReason) {
      newErrors.transferReason = 'La raison du transfert est requise';
    }

    // Phone validation for Airtel Money
    if (transferDetails.receivingMethod === 'AIRTEL_MONEY') {
      if (!formData.phone.trim()) {
        newErrors.phone = 'Le numéro de téléphone est requis';
      } else {
        const phoneRegex = /^0\d{5,8}$/;
        if (!phoneRegex.test(formData.phone)) {
          newErrors.phone = 'Format invalide. Exemple: 0741234567';
        }
      }
    }

    // Phone validation for Moov Money
    if (transferDetails.receivingMethod === 'MOOV_MONEY') {
      if (!formData.phone.trim()) {
        newErrors.phone = 'Le numéro de téléphone est requis';
      } else {
        const phoneRegex = /^0\d{5,8}$/;
        if (!phoneRegex.test(formData.phone)) {
          newErrors.phone = 'Format invalide. Exemple: 0621234567';
        }
      }
    }

    // Validation for Wero
    if (transferDetails.receivingMethod === 'WERO') {
      if (!formData.phone?.trim()) {
        newErrors.phone = 'Le numéro de téléphone Wero est requis';
      } else if (!/^\+33[67][0-9]{8}$/.test(formData.phone)) {
        newErrors.phone = 'Format invalide. Le numéro doit être un numéro français (ex: +33612345678)';
      }
      if (!formData.weroName?.trim()) {
        newErrors.weroName = 'Le nom associé au compte Wero est requis';
      }
    }

       // Validation for Bitcoin address
       if (transferDetails.receivingMethod === 'BITCOIN') {
        if (!formData.bitcoinAddress?.trim()) {
          newErrors.bitcoinAddress = 'L\'adresse Bitcoin est requise';
        } else if (!/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/.test(formData.bitcoinAddress)) {
          newErrors.bitcoinAddress = 'Format d\'adresse Bitcoin invalide';
        }
      }

    // Validation for Alipay ID
    if (transferDetails.receivingMethod === 'ALIPAY') {
      if (!formData.alipayId?.trim()) {
        newErrors.alipayId = 'L\'identifiant Alipay est requis';
      }
    }

    // Bank details validation - simplified for BANK_TRANSFER
    if (transferDetails.receivingMethod === 'BANK_TRANSFER') {
      if (!formData.bankDetails?.bankName.trim()) {
        newErrors['bankDetails.bankName'] = 'Le nom de la banque est requis';
      }
      if (!formData.bankDetails?.accountNumber.trim()) {
        newErrors['bankDetails.accountNumber'] = 'L\'IBAN est requis';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const needsAddress = () => {
    return ['ACH', 'VISA_DIRECT', 'MASTERCARD_SEND'].includes(transferDetails.receivingMethod);
  };

  const needsBankDetails = () => {
    return ['ACH', 'BANK_TRANSFER'].includes(transferDetails.receivingMethod);
  };

  const needsCardDetails = () => {
    return ['VISA_DIRECT', 'MASTERCARD_SEND'].includes(transferDetails.receivingMethod);
  };

  const needsAlipayId = () => {
    return transferDetails.receivingMethod === 'ALIPAY';
  };

  const needsBitcoinAddress = () => {
    return transferDetails.receivingMethod === 'BITCOIN';
  };

  const needsWeroDetails = () => {
    return transferDetails.receivingMethod === 'WERO';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Retour</span>
              </button>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Informations du bénéficiaire</h2>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-4">Détails du transfert</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Montant à envoyer</p>
                  <p className="text-sm sm:text-lg font-medium text-gray-900">
                    {transferDetails.amountSent.toLocaleString('fr-FR')} {transferDetails.senderCurrency}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Frais</p>
                  <p className="text-sm sm:text-lg font-medium text-gray-900">
                    {transferDetails.fees.toLocaleString('fr-FR')} {transferDetails.senderCurrency}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Montant à recevoir</p>
                  <p className="text-sm sm:text-lg font-medium text-green-600">
                    {transferDetails.amountReceived.toLocaleString('fr-FR')} {transferDetails.receiverCurrency}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Existing Beneficiaries Section */}
              {existingBeneficiaries.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Sélectionner un bénéficiaire existant
                  </label>
                  <select
                    value={selectedBeneficiary}
                    onChange={(e) => handleBeneficiarySelect(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                  >
                    <option value="">Nouveau bénéficiaire</option>
                    {existingBeneficiaries.map((beneficiary) => (
                      <option key={beneficiary.id} value={beneficiary.id}>
                        {beneficiary.first_name} {beneficiary.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-2 ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-2 ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Only show email field if beneficiary is not in Gabon */}
                {!isBeneficiaryInGabon() && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email (optionnel)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-2 ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>
                )}

                <div className={!isBeneficiaryInGabon() ? "" : "sm:col-span-2"}>
                  <label className="block text-sm font-medium text-gray-700">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-2 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Funds Origin and Transfer Reason */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Origine des fonds
                  </label>
                  <select
                    name="fundsOrigin"
                    value={formData.fundsOrigin}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-2 ${
                      errors.fundsOrigin ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Sélectionnez l'origine des fonds</option>
                    {FUNDS_ORIGINS.map(origin => (
                      <option key={origin.value} value={origin.value}>
                        {origin.label}
                      </option>
                    ))}
                  </select>
                  {errors.fundsOrigin && (
                    <p className="mt-1 text-xs text-red-600">{errors.fundsOrigin}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Raison du transfert
                  </label>
                  <select
                    name="transferReason"
                    value={formData.transferReason}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-2 ${
                      errors.transferReason ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Sélectionnez la raison du transfert</option>
                    {TRANSFER_REASONS.map(reason => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                  {errors.transferReason && (
                    <p className="mt-1 text-xs text-red-600">{errors.transferReason}</p>
                  )}
                </div>
              </div>

              {/* Method-specific fields */}
              {needsAlipayId() && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Identifiant Alipay
                  </label>
                  <input
                    type="text"
                    name="alipayId"
                    value={formData.alipayId}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-2 ${
                      errors.alipayId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.alipayId && (
                    <p className="mt-1 text-xs text-red-600">{errors.alipayId}</p>
                  )}
                </div>
              )}

              {needsWeroDetails() && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nom associé au compte Wero
                  </label>
                  <input
                    type="text"
                    name="weroName"
                    value={formData.weroName}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-2 ${
                      errors.weroName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.weroName && (
                    <p className="mt-1 text-xs text-red-600">{errors.weroName}</p>
                  )}
                </div>
              )}

              {needsBitcoinAddress() && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Adresse Bitcoin
                  </label>
                  <input
                    type="text"
                    name="bitcoinAddress"
                    value={formData.bitcoinAddress}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-2 ${
                      errors.bitcoinAddress ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="bc1..."
                    required
                  />
                  {errors.bitcoinAddress && (
                    <p className="mt-1 text-xs text-red-600">{errors.bitcoinAddress}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Assurez-vous que l'adresse est correcte. Les transactions Bitcoin sont irréversibles.
                  </p>
                </div>
              )}

              {needsAddress() && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">Adresse</h3>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Rue
                      </label>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address?.street}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-2 ${
                          errors['address.street'] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors['address.street'] && (
                        <p className="mt-1 text-xs text-red-600">{errors['address.street']}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Ville
                        </label>
                        <input
                          type="text"
                          name="address.city"
                          value={formData.address?.city}
                          onChange={handleChange}
                          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-2 ${
                            errors['address.city'] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors['address.city'] && (
                          <p className="mt-1 text-xs text-red-600">{errors['address.city']}</p>
                        )}
                      </div>
                      {transferDetails.direction === 'GABON_TO_USA' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            État
                          </label>
                          <input
                            type="text"
                            name="address.state"
                            value={formData.address?.state}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-2 ${
                              errors['address.state'] ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors['address.state'] && (
                            <p className="mt-1 text-xs text-red-600">{errors['address.state']}</p>
                          )}
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Code postal
                        </label>
                        <input
                          type="text"
                          name="address.zipCode"
                          value={formData.address?.zipCode}
                          onChange={handleChange}
                          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-2 ${
                            errors['address.zipCode'] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors['address.zipCode'] && (
                          <p className="mt-1 text-xs text-red-600">{errors['address.zipCode']}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {needsBankDetails() && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">Informations bancaires</h3>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nom de la banque
                      </label>
                      <input
                        type="text"
                        name="bankDetails.bankName"
                        value={formData.bankDetails?.bankName}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-2 ${
                          errors['bankDetails.bankName'] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors['bankDetails.bankName'] && (
                        <p className="mt-1 text-xs text-red-600">{errors['bankDetails.bankName']}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {transferDetails.receivingMethod === 'BANK_TRANSFER' ? 'IBAN' : 'Numéro de compte'}
                      </label>
                      <input
                        type="text"
                        name="bankDetails.accountNumber"
                        value={formData.bankDetails?.accountNumber}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-2 ${
                          errors['bankDetails.accountNumber'] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors['bankDetails.accountNumber'] && (
                        <p className="mt-1 text-xs text-red-600">{errors['bankDetails.accountNumber']}</p>
                      )}
                    </div>
                    {transferDetails.direction === 'GABON_TO_USA' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Numéro de routage ACH
                        </label>
                        <input
                          type="text"
                          name="bankDetails.routingNumber"
                          value={formData.bankDetails?.routingNumber}
                          onChange={handleChange}
                          placeholder="123456789"
                          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-2 ${
                            errors['bankDetails.routingNumber'] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors['bankDetails.routingNumber'] && (
                          <p className="mt-1 text-xs text-red-600">{errors['bankDetails.routingNumber']}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 sm:pt-6 border-t">
                <button
                  type="submit"
                  className="w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Continuer vers le paiement
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipientForm;