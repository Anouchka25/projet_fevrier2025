import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchTransfers();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non connecté');

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  const fetchTransfers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non connecté');

      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransfers(data);
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profil */}
      <View style={styles.card}>
        <Text style={styles.title}>Mon Profil</Text>
        {profile && (
          <View style={styles.profileInfo}>
            <Text style={styles.label}>Nom complet</Text>
            <Text style={styles.value}>{profile.first_name} {profile.last_name}</Text>
            
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{profile.email}</Text>
            
            <Text style={styles.label}>Pays</Text>
            <Text style={styles.value}>{profile.country}</Text>
          </View>
        )}
      </View>

      {/* Transferts */}
      <View style={styles.card}>
        <Text style={styles.title}>Mes Transferts</Text>
        {transfers.length === 0 ? (
          <Text style={styles.emptyText}>Aucun transfert effectué</Text>
        ) : (
          transfers.map((transfer) => (
            <View key={transfer.id} style={styles.transferCard}>
              <View style={styles.transferHeader}>
                <Text style={styles.transferRef}>{transfer.reference}</Text>
                <Text style={styles.transferDate}>
                  {new Date(transfer.created_at).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.transferDetails}>
                <Text>Montant envoyé: {transfer.amount_sent} {transfer.sender_currency}</Text>
                <Text>Montant reçu: {transfer.amount_received} {transfer.receiver_currency}</Text>
                <Text style={[
                  styles.status,
                  transfer.status === 'completed' ? styles.statusCompleted :
                  transfer.status === 'pending' ? styles.statusPending :
                  styles.statusOther
                ]}>
                  {transfer.status}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Déconnexion</Text>
      </TouchableOpacity>
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
    marginBottom: 16,
  },
  profileInfo: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#4b5563',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 8,
  },
  transferCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  transferHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  transferRef: {
    fontWeight: '600',
  },
  transferDate: {
    color: '#6b7280',
    fontSize: 12,
  },
  transferDetails: {
    gap: 4,
  },
  status: {
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  statusCompleted: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  statusOther: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});