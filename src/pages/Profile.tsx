import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/Auth/AuthProvider';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import { AlertTriangle } from 'lucide-react';
import type { Database } from '../lib/database.types';

type User = Database['public']['Tables']['users']['Row'];
type UserDocument = Database['public']['Tables']['user_documents']['Row'];

interface Address {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

const ACCEPTED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/jpg'],
  document: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<Address>({
    street: '',
    city: '',
    zipCode: '',
    country: 'FR'
  });
  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setError(null);
      
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Parse address from profile data
      if (profileData?.address) {
        setAddress(profileData.address as Address);
      }

      // Set phone number
      if (profileData?.phone) {
        setPhone(profileData.phone);
      }

      // Fetch documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', user.id);

      if (documentsError) throw documentsError;
      setDocuments(documentsData);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Une erreur est survenue lors du chargement de vos données');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newAddress = { ...address, [name]: value };
    setAddress(newAddress);

    try {
      const { error } = await supabase
        .from('users')
        .update({ address: newAddress })
        .eq('id', user?.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating address:', err);
      setError('Erreur lors de la mise à jour de l\'adresse');
    }
  };

  const handlePhoneChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPhone(value);

    try {
      const { error } = await supabase
        .from('users')
        .update({ phone: value })
        .eq('id', user?.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating phone:', err);
      setError('Erreur lors de la mise à jour du numéro de téléphone');
    }
  };

  const validateFile = (file: File, type: 'profile' | 'document'): void => {
    const acceptedTypes = ACCEPTED_FILE_TYPES[type === 'profile' ? 'image' : 'document'];
    if (!acceptedTypes.includes(file.type.toLowerCase())) {
      throw new Error(`Type de fichier non supporté. Types acceptés : ${acceptedTypes.join(', ')}`);
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`Le fichier est trop volumineux (maximum ${MAX_FILE_SIZE / (1024 * 1024)}MB)`);
    }
  };

  const uploadFile = async (file: File, type: 'profile' | 'document', side?: string) => {
    if (!user) return;

    try {
      setError(null);
      validateFile(file, type);

      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const fileName = `${type}/${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('user-files')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-files')
        .getPublicUrl(fileName);

      if (type === 'profile') {
        const { error: updateError } = await supabase
          .from('users')
          .update({ profile_photo_url: publicUrl })
          .eq('id', user.id);

        if (updateError) throw updateError;
        setProfile(prev => prev ? { ...prev, profile_photo_url: publicUrl } : null);
      } else {
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
        await fetchUserData();
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du téléchargement');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'document', side?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadFile(file, type, side);
    } catch (err) {
      console.error('Error handling file:', err);
    }
  };

  const getDocumentStatus = (docType: string, side?: string) => {
    return documents.find(doc => doc.document_type === docType && (!side || doc.side === side));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!profile?.first_name || !profile?.last_name || !address.street || documents.length === 0 && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Veuillez compléter votre profil pour faciliter vos transferts :
                </p>
                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                  {!profile?.first_name || !profile?.last_name && (
                    <li>Renseignez votre nom complet</li>
                  )}
                  {!address.street && (
                    <li>Ajoutez votre adresse</li>
                  )}
                  {documents.length === 0 && (
                    <li>Téléchargez vos documents d'identité</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

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
                  <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
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

          {/* Numéro de téléphone */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Numéro de téléphone</h2>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={phone}
                onChange={handlePhoneChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                placeholder="+33612345678"
              />
            </div>
          </div>

          {/* Adresse */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Adresse</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                  Rue
                </label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={address.street}
                  onChange={handleAddressChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    Ville
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                    Code postal
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={address.zipCode}
                    onChange={handleAddressChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Pays
                </label>
                <select
                  id="country"
                  name="country"
                  value={address.country}
                  onChange={handleAddressChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                >
                  <option value="FR">France</option>
                  <option value="BE">Belgique</option>
                  <option value="DE">Allemagne</option>
                  <option value="GA">Gabon</option>
                  <option value="CN">Chine</option>
                  <option value="US">États-Unis</option>
                  <option value="CA">Canada</option>
                </select>
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
                    {getDocumentStatus('id_card', 'front') ? (
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-green-600">
                          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Document téléchargé
                          {getDocumentStatus('id_card', 'front')?.verified && (
                            <span className="ml-2 text-blue-600">(Vérifié)</span>
                          )}
                        </div>
                        <a
                          href={getDocumentStatus('id_card', 'front')?.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-yellow-600 hover:text-yellow-500 text-sm"
                        >
                          Voir le document
                        </a>
                      </div>
                    ) : (
                      <label className="block">
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-yellow-500">
                          <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
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
                    )}
                  </div>

                  {/* Verso */}
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-2">Verso</p>
                    {getDocumentStatus('id_card', 'back') ? (
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-green-600">
                          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Document téléchargé
                          {getDocumentStatus('id_card', 'back')?.verified && (
                            <span className="ml-2 text-blue-600">(Vérifié)</span>
                          )}
                        </div>
                        <a
                          href={getDocumentStatus('id_card', 'back')?.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-yellow-600 hover:text-yellow-500 text-sm"
                        >
                          Voir le document
                        </a>
                      </div>
                    ) : (
                      <label className="block">
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-yellow-500">
                          <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
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
                    )}
                  </div>
                </div>
              </div>

              {/* Justificatif de domicile */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">Justificatif de domicile</h3>
                <div className="border rounded-lg p-4">
                  {getDocumentStatus('proof_address') ? (
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-green-600">
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Document téléchargé
                        {getDocumentStatus('proof_address')?.verified && (
                          <span className="ml-2 text-blue-600">(Vérifié)</span>
                        )}
                      </div>
                      <a
                        href={getDocumentStatus('proof_address')?.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-600 hover:text-yellow-500 text-sm"
                      >
                        Voir le document
                      </a>
                    </div>
                  ) : (
                    <label className="block">
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-yellow-500">
                        <div className="space-y-1 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
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
                  )}
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
                                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Vérifié
                              </span>
                            ) : (
                              <span className="flex items-center text-yellow-600">
                                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                En attente de vérification
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <a
                        href={doc.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-600 hover:text-yellow-500 text-sm"
                      >
                        Voir le document
                      </a>
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