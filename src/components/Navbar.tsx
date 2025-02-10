import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './Auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { ChevronDown, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const menuItems = [
    { label: 'Accueil', path: '/' },
    { label: 'Comment ça marche', path: '#how-it-works' },
    { label: 'Frais', path: '/fees' },
    { label: 'Contact', path: '#contact' }
  ];

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/KundaPay.svg" 
                alt="KundaPay Logo" 
                className="h-10"
              />
            </Link>
          </div>

          {/* Menu mobile burger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-500"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Menu desktop */}
          <div className="hidden md:flex space-x-8 items-center">
            {menuItems.map((item) => (
              <a 
                key={item.path} 
                href={item.path === '/' ? item.path : item.path}
                className="nav-link"
                onClick={() => {
                  if (item.path.startsWith('#')) {
                    const element = document.querySelector(item.path);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }
                  closeAllMenus();
                }}
              >
                {item.label}
              </a>
            ))}
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                >
                  Mon Compte
                  <ChevronDown className="ml-2 h-4 w-4" />
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu">
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={closeAllMenus}
                      >
                        Tableau de bord
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={closeAllMenus}
                      >
                        Mon profil
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          closeAllMenus();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/auth" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                onClick={closeAllMenus}
              >
                S'inscrire
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {menuItems.map((item) => (
              <a
                key={item.path}
                href={item.path === '/' ? item.path : item.path}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => {
                  if (item.path.startsWith('#')) {
                    const element = document.querySelector(item.path);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }
                  closeAllMenus();
                }}
              >
                {item.label}
              </a>
            ))}
            
            {user ? (
              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="px-3">
                  <p className="text-base font-medium text-gray-800">Mon compte</p>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={closeAllMenus}
                  >
                    Tableau de bord
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={closeAllMenus}
                  >
                    Mon profil
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeAllMenus();
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/auth"
                className="block w-full text-center mt-4 px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                onClick={closeAllMenus}
              >
                S'inscrire
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;