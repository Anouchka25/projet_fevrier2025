import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { Upload, Check, AlertTriangle } from 'lucide-react';

export default function DocumentsScreen() {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);

  const pickDocument = async (type: 'id_card' | 'proof_address', side?: string) => {
    try {
      setLoading(true);
      
      // Demander la permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à vos documents.');
        return;
      }

      // Sélectionner le document
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        // Uploader le document
        const file = result.assets[0];
        const fileExt = file.uri.split('.').pop();
        const fileName = `${type}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('user-files')
          .upload(fileName, {
            uri: file.uri,
            type: `image/${fileExt}`,
            name: fileName,
          });

        if (uploadError) throw uploadError;

        Alert.alert('Succès', 'Document téléchargé avec succès');
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du téléchargement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Documents d'identité</Text>

      {/* Carte d'identité */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Carte d'identité</Text>
        <View style={styles.documentGrid}>
          {/* Recto */}
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={() => pickDocument('id_card', 'front')}
            disabled={loading}
          >
            <Text style={styles.uploadText}>Recto</Text>
            <Text style={styles.uploadSubtext}>Cliquez pour télécharger</Text>
          </TouchableOpacity>

          {/* Verso */}
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={() => pickDocument('id_card', 'back')}
            disabled={loading}
          >
            <Text style={styles.uploadText}>Verso</Text>
            <Text style={styles.uploadSubtext}>Cliquez pour télécharger</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Justificatif de domicile */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Justificatif de domicile</Text>
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={() => pickDocument('proof_address')}
          disabled={loading}
        >
          <Text style={styles.uploadText}>Justificatif de domicile</Text>
          <Text style={styles.uploadSubtext}>Cliquez pour télécharger</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <Text>Chargement...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  documentGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});