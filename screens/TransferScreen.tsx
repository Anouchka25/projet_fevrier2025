import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { calculateTransferDetails } from '../utils/transfer';

export default function TransferScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState('GABON_TO_CHINA');
  const [calculation, setCalculation] = useState(null);

  const handleCalculate = () => {
    if (amount && !isNaN(Number(amount))) {
      const result = calculateTransferDetails(
        Number(amount),
        direction,
        'AIRTEL_MONEY',
        'ALIPAY'
      );
      setCalculation(result);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Simuler un transfert</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Montant à envoyer</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            onEndEditing={handleCalculate}
          />
        </View>

        {calculation && (
          <View style={styles.resultCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Montant envoyé</Text>
              <Text style={styles.resultValue}>
                {calculation.amountSent.toLocaleString()} {calculation.senderCurrency}
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Frais</Text>
              <Text style={styles.resultValue}>
                {calculation.fees.toLocaleString()} {calculation.senderCurrency}
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Montant reçu</Text>
              <Text style={[styles.resultValue, styles.highlight]}>
                {calculation.amountReceived.toLocaleString()} {calculation.receiverCurrency}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Auth')}
        >
          <Text style={styles.buttonText}>Continuer</Text>
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
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
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
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  resultCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultLabel: {
    color: '#4b5563',
  },
  resultValue: {
    fontWeight: '600',
  },
  highlight: {
    color: '#059669',
  },
  button: {
    backgroundColor: '#d97706',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});