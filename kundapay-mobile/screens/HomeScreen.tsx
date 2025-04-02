import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, User } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#d97706', '#b45309']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Image
            source={require('../assets/KundaPay.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>Le transfert en toute confiance</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Transfer')}
          >
            <Send size={24} color="#d97706" />
            <Text style={styles.actionText}>Faire un transfert</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Auth')}
          >
            <User size={24} color="#d97706" />
            <Text style={styles.actionText}>Se connecter</Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <Text style={styles.sectionTitle}>Nos avantages</Text>
          
          <View style={styles.featureCard}>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Taux compétitifs</Text>
              <Text style={styles.featureDescription}>
                Profitez des meilleurs taux de change du marché
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Transferts sécurisés</Text>
              <Text style={styles.featureDescription}>
                Vos transferts sont protégés et garantis
              </Text>
            </View>
          </View>
        </View>

        {/* Countries */}
        <View style={styles.countries}>
          <Text style={styles.sectionTitle}>Pays disponibles</Text>
          <View style={styles.flagsContainer}>
            <View style={styles.flagItem}>
              <Image 
                source={{ uri: 'https://flagcdn.com/w160/ga.png' }}
                style={styles.flag}
              />
              <Text style={styles.countryName}>Gabon</Text>
            </View>
            <View style={styles.flagItem}>
              <Image 
                source={{ uri: 'https://flagcdn.com/w160/fr.png' }}
                style={styles.flag}
              />
              <Text style={styles.countryName}>France</Text>
            </View>
            <View style={styles.flagItem}>
              <Image 
                source={{ uri: 'https://flagcdn.com/w160/cn.png' }}
                style={styles.flag}
              />
              <Text style={styles.countryName}>Chine</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 60,
    marginBottom: 10,
  },
  tagline: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -40,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: CARD_WIDTH * 0.45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginTop: 8,
    color: '#374151',
    fontWeight: '500',
  },
  features: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  countries: {
    marginBottom: 20,
  },
  flagsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flagItem: {
    alignItems: 'center',
  },
  flag: {
    width: 60,
    height: 40,
    borderRadius: 4,
    marginBottom: 8,
  },
  countryName: {
    fontSize: 12,
    color: '#374151',
  },
});