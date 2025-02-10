import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://your-domain.com/KundaPay.png' }}
        style={styles.logo}
      />
      
      <Text style={styles.title}>KundaPay</Text>
      <Text style={styles.subtitle}>Le transfert en toute confiance</Text>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Transfer')}
      >
        <Text style={styles.buttonText}>Faire un transfert</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate('Auth')}
      >
        <Text style={styles.secondaryButtonText}>Se connecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#d97706',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    width: '100%',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d97706',
  },
  secondaryButtonText: {
    color: '#d97706',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});