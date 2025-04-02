import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function BeneficiaryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { transferDetails } = route.params;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alipayId: '',
    weroName: '',
    fundsOrigin: '',
    transferReason: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    }
    if (!formData.fundsOrigin) {
      newErrors.fundsOrigin = 'L\'origine des fonds est requise';
    }
    if (!formData.transferReason) {
      newErrors.transferReason = 'La raison du transfert est requise';
    }

    // Validation spécifique selon le mode de réception
    if (transferDetails.receivingMethod === 'AIRTEL_MONEY') {
      if (!formData.phone.trim()) {
        newErrors.phone = 'Le numéro de téléphone est requis';
      } else if (!/^0(74|77)[0-9]{6}$/.test(formData.phone)) {
        newErrors.phone = 'Format invalide. Exemple: 074123456';
      }
    }

    if (transferDetails.receivingMethod === 'ALIPAY' && !formData.alipayId?.trim()) {
      newErrors.alipayId = 'L\'identifiant Alipay est requis';
    }

    if (transferDetails.receivingMethod === 'WERO') {
      if (!formData.weroName?.trim()) {
        newErrors.weroName = 'Le nom associé au compte Wero est requis';
      }
      if (!formData.phone?.trim()) {
        newErrors.phone = 'Le numéro de téléphone Wero est requis';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      navigation.navigate('Payment', {
        transferDetails,
        beneficiaryData: formData
      });
    } else {
      Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Informations du bénéficiaire</Text>

        {/* Informations de base */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Prénom</Text>
          <TextInput
            style={[styles.input, errors.firstName && styles.inputError]}
            value={formData.firstName}
            onChangeText={(text) => setFormData({...formData, firstName: text})}
            placeholder="Prénom du bénéficiaire"
          />
          {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
          }
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nom</Text>
          <TextInput
            style={[styles.input, errors.lastName && styles.inputError]}
            value={formData.lastName}
            onChangeText={(text) => setFormData({...formData, lastName: text})}
            placeholder="Nom du bénéficiaire"
          />
          {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
          }
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            placeholder="Email du bénéficiaire"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          }
        </View>

        {/* Champs spécifiques selon le mode de réception */}
        {(transferDetails.receivingMethod === 'AIRTEL_MONEY' || transferDetails.receivingMethod === 'WERO') && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Numéro de téléphone</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={formData.phone}
              onChangeText={(text) => setFormData({...formData, phone: text})}
              placeholder={transferDetails.receivingMethod === 'AIRTEL_MONEY' ? "074XXXXXX" : "+33XXXXXXXXX"}
              keyboardType="phone-pad"
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            }
          </View>
        )}

        {transferDetails.receivingMethod === 'ALIPAY' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Identifiant Alipay</Text>
            <TextInput
              style={[styles.input, errors.alipayId && styles.inputError]}
              value={formData.alipayId}
              onChangeText={(text) => setFormData({...formData, alipayId: text})}
              placeholder="Identifiant Alipay"
            />
            {errors.alipayId && <Text style={styles.errorText}>{errors.alipayId}</Text>}
            }
          </View>
        )}

        {transferDetails.receivingMethod === 'WERO' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom sur Wero</Text>
            <TextInput
              style={[styles.input, errors.weroName && styles.inputError]}
              value={formData.weroName}
              onChangeText={(text) => setFormData({...formData, weroName: text})}
              placeholder="Nom associé au compte Wero"
            />
            {errors.weroName && <Text style={styles.errorText}>{errors.weroName}</Text>}
            }
          </View>
        )}

        {/* Origine des fonds et raison du transfert */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Origine des fonds</Text>
          <TextInput
            style={[styles.input, errors.fundsOrigin && styles.inputError]}
            value={formData.fundsOrigin}
            onChangeText={(text) => setFormData({...formData, fundsOrigin: text})}
            placeholder="Origine des fonds"
          />
          {errors.fundsOrigin && <Text style={styles.errorText}>{errors.fundsOrigin}</Text>}
          }
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Raison du transfert</Text>
          <TextInput
            style={[styles.input, errors.transferReason && styles.inputError]}
            value={formData.transferReason}
            onChangeText={(text) => setFormData({...formData, transferReason: text})}
            placeholder="Raison du transfert"
          />
          {errors.transferReason && <Text style={styles.errorText}>{errors.transferReason}</Text>}
          }
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Continuer vers le paiement</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#d97706',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});