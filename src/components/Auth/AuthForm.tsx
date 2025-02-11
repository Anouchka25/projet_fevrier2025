import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').optional(),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  country: z.enum(['GA', 'FR', 'CN', 'US', 'CA'], 'Pays non valide').optional()
});

type UserFormData = z.infer<typeof userSchema>;

const AuthForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    country: 'GA'
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData | 'auth', string>>>({});
  const [loading, setLoading] = useState(false);

  // Reset form when switching between login/signup
  useEffect(() => {
    setErrors({});
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      country: 'GA'
    });
  }, [isLogin]);

  const validateForm = () => {
    try {
      if (isLogin) {
        z.object({
          email: userSchema.shape.email,
          password: userSchema.shape.password,
        }).parse({
          email: formData.email,
          password: formData.password,
        });
      } else {
        userSchema.parse(formData);
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: typeof errors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof UserFormData] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email.toLowerCase().trim(),
          password: formData.password
        });

        if (signInError) {
          if (signInError.message === 'Invalid login credentials') {
            setErrors({ auth: 'Email ou mot de passe incorrect' });
          } else {
            setErrors({ auth: 'Une erreur est survenue lors de la connexion' });
          }
          return;
        }

        if (!data.user) {
          setErrors({ auth: 'Utilisateur non trouvé' });
          return;
        }

        // Get user profile
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError) {
          setErrors({ auth: 'Erreur lors de la récupération des données utilisateur' });
          return;
        }

        // Redirect to appropriate page
        const pendingTransfer = localStorage.getItem('transferDetails');
        navigate(pendingTransfer ? '/transfer' : '/dashboard');
      } else {
        // Sign up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName?.trim(),
              last_name: formData.lastName?.trim(),
              country: formData.country
            }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('User already registered')) {
            setErrors({ auth: 'Cet email est déjà utilisé' });
          } else {
            setErrors({ auth: 'Une erreur est survenue lors de l\'inscription' });
          }
          return;
        }

        if (!data.user) {
          setErrors({ auth: 'Une erreur est survenue lors de l\'inscription' });
          return;
        }

        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: data.user.id,
            email: formData.email.toLowerCase().trim(),
            first_name: formData.firstName?.trim(),
            last_name: formData.lastName?.trim(),
            country: formData.country
          }]);

        if (profileError) {
          // If profile creation fails, sign out
          await supabase.auth.signOut();
          setErrors({ auth: 'Erreur lors de la création du profil' });
          return;
        }

        // Redirect to appropriate page
        const pendingTransfer = localStorage.getItem('transferDetails');
        navigate(pendingTransfer ? '/transfer' : '/dashboard');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setErrors({
        auth: 'Une erreur inattendue est survenue. Veuillez réessayer.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is modified
    if (errors[name as keyof UserFormData]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof UserFormData];
        return newErrors;
      });
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        {isLogin ? 'Connexion' : 'Inscription'}
      </h2>

      {errors.auth && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{errors.auth}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-2 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="votre@email.com"
            required
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-2 ${
              errors.password ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="••••••••"
            required
          />
          {errors.password && (
            <p className="mt-2 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {!isLogin && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-2 ${
                  errors.firstName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="John"
                required
              />
              {errors.firstName && (
                <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-2 ${
                  errors.lastName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Doe"
                required
              />
              {errors.lastName && (
                <p className="mt-2 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pays
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-2 ${
                  errors.country ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              >
                <option value="GA">Gabon</option>
                <option value="FR">France</option>
                <option value="CN">Chine</option>
                <option value="US">États-Unis</option>
                <option value="CA">Canada</option>
              </select>
              {errors.country && (
                <p className="mt-2 text-sm text-red-600">{errors.country}</p>
              )}
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire")}
        </button>
      </form>

      <div className="mt-6 text-center space-y-4">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-base text-yellow-600 hover:text-yellow-500"
        >
          {isLogin ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
        </button>

        {isLogin && (
          <div>
            <Link
              to="/forgot-password"
              className="text-base text-yellow-600 hover:text-yellow-500"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;