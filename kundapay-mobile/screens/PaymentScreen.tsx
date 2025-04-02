import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function PaymentScreen() {
  const route = useRoute();
  const { transferDetails, beneficiaryData } = route.params;

  const handlePayment = async () => {
    try {
      // Créer le transfert dans la base de données
      const { data: newTransfer, error: transferError } = await supabase
        .from('transfers')
        .insert([{
          reference: generateTransferReference(),
          amount_sent: transferDetails.amountSent,
          amount_received: transferDetails.amountReceived,
          sender_currency: transferDetails.senderCurrency,
          receiver_currency: transferDetails.receiverCurrency,
          payment_method: transferDetails.paymentMethod,
          receiving_method: transferDetails.receivingMethod,
          status: 'pending',
          funds_origin: beneficiaryData.fundsOrigin,
          transfer_reason: beneficiaryData.transferReason
        }])
        .select()
        .single();

      if (transferError) throw transferError;

      // Créer le bénéficiaire
      const { error: beneficiaryError } = await supabase
        .from('beneficiaries')
        .insert([{
          transfer_id: newTransfer.id,
          first_name: beneficiaryData.firstName,
          last_name: beneficiaryData.lastName,
          email: beneficiaryData.email,
          payment_details: {
            phone: beneficiaryData.phone,
            alipayId: beneficiaryData.alipayId,
            weroName: beneficiaryData.weroName
          }
        }]);

      if (beneficiaryError) throw beneficiaryError;

      // Gérer le paiement selon la méthode
      if (transferDetails.paymentMethod === 'PAYPAL') {
        Alert.alert(
          'Instructions de paiement PayPal',
          'Veuillez envoyer le paiement à l\'une des options suivantes :\n\n' +
          '- Email : minkoueobamea@gmail.com\n' +
          '- Numéro : +33 6 58 89 85 31\n\n' +
          'Le compte est au nom de Anouchka MINKOUE OBAME',
          [
            {
              text: 'Ouvrir PayPal',
              onPress: () => Linking.openURL('https://paypal.me/kundapay')
            },
            {
              text: 'OK',
              style: 'cancel'
            }
          ]
        );
      } else if (transferDetails.paymentMethod === 'AIRTEL_MONEY') {
        Alert.alert(
          'Instructions de paiement Airtel Money',
          'Veuillez envoyer le paiement au :\n\n' +
          'Numéro : 074186037\n' +
          'Nom : Anouchka MINKOUE OBAME'
        );
      } else if (transferDetails.paymentMethod === 'WERO') {
        Alert.alert(
          'Instructions de paiement Wero',
          'Veuillez envoyer le paiement au :\n\n' +
          'Numéro : +33 6 58 89 85 31\n' +
          'Nom : Anouchka MINKOUE OBAME'
        );
      }

      Alert.alert(
        'Transfert créé',
        'Votre transfert a été créé avec succès. Vous recevrez une confirmation une fois le paiement validé.'
      );
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création du transfert');
    }
  };

  const generateTransferReference = () => {
    const prefix = 'KP';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Paiement</Text>

        {/* Détails du transfert */}
        <View style={styles.detailsCard}>
          <Text style={styles.subtitle}>Détails du transfert</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Montant à envo yer</Text>
            <Text style={styles.detailValue}>
              {transferDetails.amountSent.toLocaleString('fr-FR')} {transferDetails.senderCurrency}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Frais</Text>
            <Text style={styles.detailValue}>
              {transferDetails.fees.toLocaleString('fr-FR')} {transferDetails.senderCurrency}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Montant à recevoir</Text>
            <Text style={[styles.detailValue, styles.highlightedValue]}>
              {transferDetails.amountReceived.toLocaleString('fr-FR')} {transferDetails.receiverCurrency}
            </Text>
          </View>
        </View>

        {/* Instructions de paiement */}
        <View style={styles.instructionsCard}>
          <Text style={styles.subtitle}>Instructions de paiement</Text>
          
          {transferDetails.paymentMethod === 'AIRTEL_MONEY' && (
            <View>
              <Text style={styles.instructionText}>
                Pour finaliser votre transfert, veuillez :
              </Text>
              <View style={styles.instructionsList}>
                <Text style={styles.instruction}>1. Ouvrir l'application Airtel Money</Text>
                <Text style={styles.instruction}>2. Envoyer {transferDetails.amountSent.toLocaleString('fr-FR')} {transferDetails.senderCurrency} au numéro 074186037</Text>
                <Text style={styles.instruction}>3. Le compte est au nom de Anouchka MINKOUE OBAME</Text>
              </View>
            </View>
          )}

          {transferDetails.paymentMethod === 'WERO' && (
            <View>
              <Text style={styles.instructionText}>
                Pour finaliser votre transfert, veuillez :
              </Text>
              <View style={styles.instructionsList}>
                <Text style={styles.instruction}>1. Ouvrir l'application Wero</Text>
                <Text style={styles.instruction}>2. Envoyer {transferDetails.amountSent.toLocaleString('fr-FR')} {transferDetails.senderCurrency} au numéro +33 6 58 89 85 31</Text>
                <Text style={styles.instruction}>3. Le compte est au nom de Anouchka MINKOUE OBAME</Text>
              </View>
            </View>
          )}

          {transferDetails.paymentMethod === 'PAYPAL' && (
            <View>
              <Text style={styles.instructionText}>
                Pour finaliser votre transfert, veuillez :
              </Text>
              <View style={styles.instructionsList}>
                <Text style={styles.instruction}>1. Connectez-vous à votre compte PayPal</Text>
                <Text style={styles.instruction}>2. Envoyez {transferDetails.amountSent.toLocaleString('fr-FR')} {transferDetails.senderCurrency} à :</Text>
                <Text style={styles.instruction}>   - Email : minkoueobamea@gmail.com</Text>
                <Text style={styles.instruction}>   - Numéro : +33 6 58 89 85 31</Text>
                <Text style={styles.instruction}>3. Le compte est au nom de Anouchka MINKOUE OBAME</Text>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handlePayment}
        >
          <Text style={styles.submitButtonText}>
            Confirmer le transfert
          </Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailsCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#6b7280',
  },
  detailValue: {
    fontWeight: '600',
  },
  highlightedValue: {
    color: '#059669',
    fontWeight: 'bold',
  },
  instructionsCard: {
    backgroundColor: '#fff7ed',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#d97706',
  },
  instructionText: {
    marginBottom: 8,
  },
  instructionsList: {
    marginLeft: 8,
  },
  instruction: {
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: '#d97706',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});