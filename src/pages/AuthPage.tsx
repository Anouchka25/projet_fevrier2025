import React from 'react';
import { useLocation } from 'react-router-dom';
import AuthForm from '../components/Auth/AuthForm';

const AuthPage = () => {
  const location = useLocation();
  const state = location.state as { message?: string } | null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Bienvenue sur KundaPay
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Le transfert d'argent en toute confiance
        </p>
      </div>

      {state?.message && (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {state.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <AuthForm />
      </div>
    </div>
  );
};

export default AuthPage;