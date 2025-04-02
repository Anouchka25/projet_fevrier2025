import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Eye, UserCheck, UserX } from 'lucide-react';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  country: string;
  phone: string;
  created_at: string;
  is_admin: boolean;
  profile_photo_url?: string;
  address?: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
}

interface UserDocument {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  side: string;
  verified: boolean;
  created_at: string;
}

const UsersManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDocuments = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserDocuments(data || []);
    } catch (err) {
      console.error('Error fetching user documents:', err);
    }
  };

  const handleToggleAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_admin: !isAdmin })
        .eq('id', userId);

      if (error) throw error;
      await fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const handleVerifyDocument = async (docId: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from('user_documents')
        .update({ verified: !verified })
        .eq('id', docId);

      if (error) throw error;
      if (selectedUser) {
        await fetchUserDocuments(selectedUser.id);
      }
    } catch (err) {
      console.error('Error updating document:', err);
    }
  };

  const handleUserSelect = async (user: User) => {
    setSelectedUser(user);
    await fetchUserDocuments(user.id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Utilisateurs</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Téléphone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pays
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date d'inscription
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.phone || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.country === 'GA' ? 'Gabon' :
                   user.country === 'FR' ? 'France' :
                   user.country === 'BE' ? 'Belgique' :
                   user.country === 'DE' ? 'Allemagne' :
                   user.country === 'CN' ? 'Chine' :
                   user.country === 'US' ? 'États-Unis' :
                   user.country === 'CA' ? 'Canada' :
                   user.country}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.is_admin ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.is_admin ? 'Admin' : 'Utilisateur'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                      className={`${
                        user.is_admin ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                      }`}
                      title={user.is_admin ? "Retirer les droits admin" : "Donner les droits admin"}
                    >
                      {user.is_admin ? <UserX className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => handleUserSelect(user)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="Voir les détails"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal des détails */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Détails de l'utilisateur
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Nom complet</h4>
                  <p className="mt-1">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <p className="mt-1">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Téléphone</h4>
                  <p className="mt-1">{selectedUser.phone || '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Pays</h4>
                  <p className="mt-1">
                    {selectedUser.country === 'GA' ? 'Gabon' :
                     selectedUser.country === 'FR' ? 'France' :
                     selectedUser.country === 'BE' ? 'Belgique' :
                     selectedUser.country === 'DE' ? 'Allemagne' :
                     selectedUser.country === 'CN' ? 'Chine' :
                     selectedUser.country === 'US' ? 'États-Unis' :
                     selectedUser.country === 'CA' ? 'Canada' :
                     selectedUser.country}
                  </p>
                </div>
              </div>

              {selectedUser.address && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Adresse</h4>
                  <p className="mt-1">{selectedUser.address.street}</p>
                  <p className="mt-1">
                    {selectedUser.address.city}, {selectedUser.address.zipCode}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-500">Documents</h4>
                <div className="mt-2 space-y-4">
                  {userDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {doc.document_type === 'id_card' ? 'Carte d\'identité' : 'Justificatif de domicile'}
                          {doc.document_type === 'id_card' && ` (${doc.side})`}
                        </p>
                        <a
                          href={doc.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-yellow-600 hover:text-yellow-500"
                        >
                          Voir le document
                        </a>
                      </div>
                      <button
                        onClick={() => handleVerifyDocument(doc.id, doc.verified)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          doc.verified
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }`}
                      >
                        {doc.verified ? 'Vérifié' : 'Valider'}
                      </button>
                    </div>
                  ))}
                  {userDocuments.length === 0 && (
                    <p className="text-sm text-gray-500">Aucun document téléchargé</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManager;