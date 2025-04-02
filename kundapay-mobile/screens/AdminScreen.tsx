import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { supabase } from '../lib/supabase';

export default function AdminScreen() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transfers')
        .select(`
          *,
          users (id, email, first_name, last_name),
          beneficiaries (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransfers(data);
    } catch (error) {
      console.error('Error fetching transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchTransfers().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('transfers')
        .update({ 
          status: newStatus,
          validated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      fetchTransfers();
    } catch (error) {
      console.error('Error updating transfer status:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Transferts</Text>
      
      {transfers.map((transfer) => (
        <View key={transfer.id} style={styles.transferCard}>
          <View style={styles.transferHeader}>
            <Text style={styles.reference}>{transfer.reference}</Text>
            <Text style={styles.date}>
              {new Date(transfer.created_at).toLocaleDateString('fr-FR')}
            </Text>
          </View>

          <View style={styles.transferDetails}>
            <Text>Expéditeur: {transfer.users?.first_name} {transfer.users?.last_name}</Text>
            <Text>Bénéficiaire: {transfer.beneficiaries?.[0]?.first_name} {transfer.beneficiaries?.[0]?.last_name}</Text>
            <Text>Montant: {transfer.amount_sent} {transfer.sender_currency}</Text>
            <Text>Reçu: {transfer.amount_received} {transfer.receiver_currency}</Text>
            
            <View style={[
              styles.statusBadge,
              transfer.status === 'completed' ? styles.statusCompleted :
              transfer.status === 'pending' ? styles.statusPending :
              styles.statusCancelled
            ]}>
              <Text style={styles.statusText}>
                {transfer.status === 'completed' ? 'Terminé' :
                 transfer.status === 'pending' ? 'En attente' :
                 'Annulé'}
              </Text>
            </View>
          </View>

          {transfer.status === 'pending' && (
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.validateButton]}
                onPress={() => handleStatusChange(transfer.id, 'completed')}
              >
                <Text style={styles.actionButtonText}>Valider</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleStatusChange(transfer.id, 'cancelled')}
              >
                <Text style={styles.actionButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  transferCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transferHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reference: {
    fontWeight: '600',
  },
  date: {
    color: '#6b7280',
    fontSize: 12,
  },
  transferDetails: {
    gap: 4,
  },
  statusBadge: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusCompleted: {
    backgroundColor: '#d1fae5',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusCancelled: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  validateButton: {
    backgroundColor: '#059669',
  },
  cancelButton: {
    backgroundColor: '#dc2626',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});