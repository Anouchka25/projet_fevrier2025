import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './Auth/AuthProvider';
import { CircleDollarSign, User, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        buttonRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/KundaPay.svg" alt="KundaPay" className="h-10" />
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-gray-600 hover:text-yellow-500">Accueil</Link>
            <a href="#how-it-works" className="text-gray-600 hover:text-yellow-500">Comment ça marche</a>
            <a href="#contact" className="text-gray-600 hover:text-yellow-500">Contact</a>
            {user ? (
              <div className="relative">
                <button 
                  ref={buttonRef}
                  onClick={() => setShowMenu(!showMenu)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  <User className="h-4 w-4 mr-2" />
                  Mon Compte
                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${showMenu ? 'transform rotate-180' : ''}`} />
                </button>
                
                {showMenu && (
                  <div 
                    ref={menuRef}
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 transform opacity-100 scale-100 transition-all duration-200 ease-out"
                  >
                    <div className="py-1" role="menu">
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                        role="menuitem"
                        onClick={() => setShowMenu(false)}
                      >
                        Tableau de bord
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                        role="menuitem"
                        onClick={() => setShowMenu(false)}
                      >
                        Mon profil
                      </Link>
                      {user.user_metadata?.is_admin && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                          role="menuitem"
                          onClick={() => setShowMenu(false)}
                        >
                          Administration
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors duration-150 flex items-center"
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/auth" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                S'inscrire
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-yellow-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-500"
            >
              {showMobileMenu ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-yellow-500 hover:bg-gray-50"
              onClick={() => setShowMobileMenu(false)}
            >
              Accueil
            </Link>
            <a
              href="#how-it-works"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-yellow-500 hover:bg-gray-50"
              onClick={() => setShowMobileMenu(false)}
            >
              Comment ça marche
            </a>
            <a
              href="#contact"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-yellow-500 hover:bg-gray-50"
              onClick={() => setShowMobileMenu(false)}
            >
              Contact
            </a>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-yellow-500 hover:bg-gray-50"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Tableau de bord
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-yellow-500 hover:bg-gray-50"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Mon profil
                </Link>
                {user.user_metadata?.is_admin && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-yellow-500 hover:bg-gray-50"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Administration
                  </Link>
                )}
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-gray-50"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="block px-3 py-2 rounded-md text-base font-medium text-yellow-600 hover:text-yellow-700 hover:bg-gray-50"
                onClick={() => setShowMobileMenu(false)}
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