import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Check, Clock, X } from 'lucide-react-native';

interface Transfer {
  id: string;
  reference: string;
  amount_sent: number;
  amount_received: number;
  sender_currency: string;
  receiver_currency: string;
  status: string;
  created_at: string;
  beneficiaries: Array<{
    first_name: string;
    last_name: string;
    email: string;
    payment_details: any;
  }>;
}

export default function TransferHistoryScreen() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Format name with first name capitalized and last name uppercase
  const formatName = (firstName: string = '', lastName: string = '') => {
    const formattedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    const formattedLastName = lastName.toUpperCase();
    return `${formattedFirstName} ${formattedLastName}`;
  };

  const fetchTransfers = async () => {
    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Utilisateur non connecté');
        return;
      }

      console.log('Fetching transfers for user:', user.id);

      // Check if user is admin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
      } else {
        setIsAdmin(userData?.is_admin || false);
      }

      // Build query
      let query = supabase
        .from('transfers')
        .select(`
          *,
          beneficiaries (
            first_name,
            last_name,
            email,
            payment_details
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Filter out cancelled transfers for non-admin users
      if (!userData?.is_admin) {
        query = query.neq('status', 'cancelled');
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Supabase error:', fetchError);
        throw fetchError;
      }
      
      console.log('Transfers fetched:', data ? data.length : 0);
      setTransfers(data || []);
    } catch (err) {
      console.error('Error fetching transfers:', err);
      setError('Erreur lors du chargement des transferts');
      Alert.alert('Erreur', 'Impossible de charger vos transferts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchTransfers();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#059669';
      case 'pending':
        return '#d97706';
      case 'cancelled':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check size={16} color="#059669" />;
      case 'pending':
        return <Clock size={16} color="#d97706" />;
      case 'cancelled':
        return <X size={16} color="#dc2626" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const renderTransferItem = ({ item }: { item: Transfer }) => (
    <TouchableOpacity style={styles.transferCard}>
      <View style={styles.transferHeader}>
        <Text style={styles.reference}>{item.reference}</Text>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString('fr-FR')}
        </Text>
      </View>

      <View style={styles.amountsContainer}>
        <View>
          <Text style={styles.amountLabel}>Envoyé</Text>
          <Text style={styles.amount}>
            {item.amount_sent.toLocaleString('fr-FR')} {item.sender_currency}
          </Text>
        </View>
        <View>
          <Text style={styles.amountLabel}>Reçu</Text>
          <Text style={styles.amount}>
            {item.amount_received.toLocaleString('fr-FR')} {item.receiver_currency}
          </Text>
        </View>
      </View>

      {/* Beneficiary information */}
      {item.beneficiaries && item.beneficiaries.length > 0 && (
        <View style={styles.beneficiaryContainer}>
          <Text style={styles.beneficiaryLabel}>Bénéficiaire</Text>
          <Text style={styles.beneficiaryName}>
            {formatName(
              item.beneficiaries[0]?.first_name || '',
              item.beneficiaries[0]?.last_name || ''
            )}
          </Text>
        </View>
      )}

      <View style={[styles.statusContainer, { borderColor: getStatusColor(item.status) }]}>
        {getStatusIcon(item.status)}
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {getStatusText(item.status)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#d97706" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={transfers}
        renderItem={renderTransferItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#d97706']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Aucun transfert trouvé
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  listContainer: {
    padding: 16,
  },
  transferCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transferHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reference: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
  },
  amountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  beneficiaryContainer: {
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  beneficiaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  beneficiaryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    padding: 24,
  },
});