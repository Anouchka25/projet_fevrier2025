import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from './AuthProvider';
import { sendWelcomeEmail } from '../../lib/onesignal';
import Navbar from '../Navbar';

const AuthForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshSession } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('FR');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      // Get redirect URL and transfer details from state
      const state = location.state as { from?: string; transferDetails?: string } | null;
      const from = state?.from || '/dashboard';

      // If coming from a transfer, restore the details
      if (state?.transferDetails) {
        localStorage.setItem('transferDetails', state.transferDetails);
      }

      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const validateForm = () => {
    if (!isLogin) {
      if (!firstName.trim()) {
        setError('Le prénom est requis');
        return false;
      }
      if (!lastName.trim()) {
        setError('Le nom est requis');
        return false;
      }
      if (!phone.trim()) {
        setError('Le numéro de téléphone est requis');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return false;
      }
      if (password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères');
        return false;
      }
      if (!termsAccepted) {
        setError('Vous devez accepter les conditions générales');
        return false;
      }
    }
    return true;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Clear any existing session
      await supabase.auth.signOut();
      
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password
        });

        if (signInError) {
          if (signInError.message === 'Invalid login credentials') {
            throw new Error('Email ou mot de passe incorrect');
          }
          throw signInError;
        }
      } else {
        const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
          email: email.toLowerCase().trim(),
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              country,
              phone,
              terms_accepted: true,
              terms_accepted_at: new Date().toISOString()
            }
          }
        });

        if (signUpError) throw signUpError;

        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: newUser?.id,
            email: email.toLowerCase().trim(),
            first_name: firstName,
            last_name: lastName,
            country,
            phone,
            terms_accepted: true,
            terms_accepted_at: new Date().toISOString()
          }]);

        if (profileError) throw profileError;

        // Send welcome email
        if (newUser) {
          await sendWelcomeEmail(
            newUser.id,
            email.toLowerCase().trim(),
            `${firstName} ${lastName}`
          );
        }

        setSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        setIsLogin(true);
        return;
      }

      // Force refresh session
      await refreshSession();

    } catch (err) {
      console.error('Erreur d\'authentification:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Veuillez entrer votre email');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      setSuccess('Un email de réinitialisation vous a été envoyé. Veuillez vérifier votre boîte de réception.');
      setShowForgotPassword(false);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Une erreur est survenue lors de l\'envoi de l\'email de réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Connexion' : 'Inscription'}
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            {showForgotPassword ? (
              <div>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                    required
                  />
                </div>

                <div className="flex flex-col space-y-4">
                  <button
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                  >
                    {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                  </button>

                  <button
                    onClick={() => setShowForgotPassword(false)}
                    className="text-sm text-yellow-600 hover:text-yellow-500"
                  >
                    Retour à la connexion
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAuth} className="space-y-6">
                {!isLogin && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                          Prénom
                        </label>
                        <input
                          id="firstName"
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                          Nom
                        </label>
                        <input
                          id="lastName"
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Téléphone
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                        placeholder="+33612345678"
                      />
                    </div>

                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                        Pays
                      </label>
                      <select
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
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
                  </>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mot de passe
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                    />
                  </div>
                </div>

                {!isLogin && (
                  <>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirmer le mot de passe
                      </label>
                      <div className="mt-1">
                        <input
                          id="confirmPassword"
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                      />
                      <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                        J'accepte les{' '}
                        <Link
                          to="/conditions-generales"
                          target="_blank"
                          className="font-medium text-yellow-600 hover:text-yellow-500"
                        >
                          conditions générales
                        </Link>
                        {' '}et la{' '}
                        <Link
                          to="/politique-de-confidentialite"
                          target="_blank"
                          className="font-medium text-yellow-600 hover:text-yellow-500"
                        >
                          politique de confidentialité
                        </Link>
                      </label>
                    </div>
                  </>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                  >
                    {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire")}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 flex flex-col space-y-4">
              {isLogin && !showForgotPassword && (
                <button
                  onClick={() => setShowForgotPassword(true)}
                  className="text-center text-sm text-yellow-600 hover:text-yellow-500 cursor-pointer"
                >
                  Mot de passe oublié ?
                </button>
              )}

              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccess(null);
                  setShowForgotPassword(false);
                  // Reset form fields
                  if (isLogin) {
                    setFirstName('');
                    setLastName('');
                    setPhone('');
                    setCountry('FR');
                    setConfirmPassword('');
                    setTermsAccepted(false);
                  }
                }}
                className="text-center text-sm text-yellow-600 hover:text-yellow-500"
              >
                {isLogin ? "Pas de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;