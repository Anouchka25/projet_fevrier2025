import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/Auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { Upload, Check, AlertCircle } from 'lucide-react';
import type { Database } from '../lib/database.types';

type User = Database['public']['Tables']['users']['Row'];
type UserDocument = Database['public']['Tables']['user_documents']['Row'];

const ACCEPTED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/jpg'],
  document: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setError(null);
      
      // Récupérer le profil
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Récupérer les documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', user.id);

      if (documentsError) throw documentsError;
      setDocuments(documentsData);
    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err);
      setError('Une erreur est survenue lors du chargement de vos données');
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file: File, type: 'profile' | 'document'): void => {
    // Vérifier le type de fichier
    const acceptedTypes = ACCEPTED_FILE_TYPES[type === 'profile' ? 'image' : 'document'];
    if (!acceptedTypes.includes(file.type.toLowerCase())) {
      throw new Error(`Type de fichier non supporté. Types acceptés : ${acceptedTypes.join(', ')}`);
    }

    // Vérifier la taille du fichier
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`Le fichier est trop volumineux (maximum ${MAX_FILE_SIZE / (1024 * 1024)}MB)`);
    }
  };

  const uploadFile = async (file: File, type: 'profile' | 'document', side?: string) => {
    if (!user) return;

    try {
      setError(null);

      // Valider le fichier
      validateFile(file, type);

      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const fileName = `${type}/${user.id}/${Date.now()}.${fileExt}`;

      // Télécharger le fichier
      const { error: uploadError, data } = await supabase.storage
        .from('user-files')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('user-files')
        .getPublicUrl(fileName);

      if (type === 'profile') {
        // Mettre à jour l'URL de la photo de profil
        const { error: updateError } = await supabase
          .from('users')
          .update({ profile_photo_url: publicUrl })
          .eq('id', user.id);

        if (updateError) throw updateError;

        // Mettre à jour le profil local immédiatement
        setProfile(prev => prev ? { ...prev, profile_photo_url: publicUrl } : null);
      } else {
        // Créer un nouveau document
        const { error: docError } = await supabase
          .from('user_documents')
          .insert([{
            user_id: user.id,
            document_type: type,
            document_url: publicUrl,
            side: side || 'front',
            verified: false
          }]);

        if (docError) throw docError;

        // Rafraîchir la liste des documents
        await fetchUserData();
      }
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du téléchargement');
      throw err;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'document', side?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      await uploadFile(file, type, side);
    } catch (err) {
      // L'erreur est déjà gérée dans uploadFile
      console.error('Erreur lors du changement de fichier:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Photo de profil */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Photo de profil</h2>
            <div className="flex items-center space-x-6">
              <div className="relative">
                {profile?.profile_photo_url ? (
                  <img
                    src={profile.profile_photo_url}
                    alt="Photo de profil"
                    className="h-24 w-24 rounded-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.first_name + ' ' + profile.last_name)}&background=random`;
                    }}
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-xl">
                      {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                    </span>
                  </div>
                )}
                <label
                  htmlFor="profile-photo"
                  className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-lg cursor-pointer hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4 text-gray-600" />
                  <input
                    type="file"
                    id="profile-photo"
                    className="hidden"
                    accept={ACCEPTED_FILE_TYPES.image.join(',')}
                    onChange={(e) => handleFileChange(e, 'profile')}
                  />
                </label>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  Formats acceptés : JPG, PNG. Taille maximale : 5MB
                </p>
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>
            </div>
          </div>

          {/* Documents d'identité */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Documents d'identité</h2>
            
            <div className="space-y-6">
              {/* Carte d'identité */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">Carte d'identité</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Recto */}
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-2">Recto</p>
                    <label className="block">
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-yellow-500">
                        <div className="space-y-1 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor="id-front" className="relative cursor-pointer rounded-md font-medium text-yellow-600 hover:text-yellow-500">
                              <span>Télécharger un fichier</span>
                              <input
                                id="id-front"
                                type="file"
                                className="sr-only"
                                accept={ACCEPTED_FILE_TYPES.document.join(',')}
                                onChange={(e) => handleFileChange(e, 'id_card', 'front')}
                              />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, PDF jusqu'à 5MB</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Verso */}
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-2">Verso</p>
                    <label className="block">
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-yellow-500">
                        <div className="space-y-1 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor="id-back" className="relative cursor-pointer rounded-md font-medium text-yellow-600 hover:text-yellow-500">
                              <span>Télécharger un fichier</span>
                              <input
                                id="id-back"
                                type="file"
                                className="sr-only"
                                accept={ACCEPTED_FILE_TYPES.document.join(',')}
                                onChange={(e) => handleFileChange(e, 'id_card', 'back')}
                              />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, PDF jusqu'à 5MB</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Justificatif de domicile */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">Justificatif de domicile</h3>
                <div className="border rounded-lg p-4">
                  <label className="block">
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-yellow-500">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="proof-address" className="relative cursor-pointer rounded-md font-medium text-yellow-600 hover:text-yellow-500">
                            <span>Télécharger un fichier</span>
                            <input
                              id="proof-address"
                              type="file"
                              className="sr-only"
                              accept={ACCEPTED_FILE_TYPES.document.join(',')}
                              onChange={(e) => handleFileChange(e, 'proof_address')}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, PDF jusqu'à 5MB</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Liste des documents téléchargés */}
            {documents.length > 0 && (
              <div className="mt-6">
                <h3 className="text-base font-medium text-gray-900 mb-4">Documents téléchargés</h3>
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {doc.document_type === 'id_card' ? 'Carte d\'identité' : 'Justificatif de domicile'}
                            {doc.document_type === 'id_card' && ` (${doc.side})`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {doc.verified ? (
                              <span className="flex items-center text-green-600">
                                <Check className="h-4 w-4 mr-1" />
                                Vérifié
                              </span>
                            ) : (
                              <span className="flex items-center text-yellow-600">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                En attente de vérification
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;