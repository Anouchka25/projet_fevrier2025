import React from 'react';
import { Phone, Mail, MessageCircle } from 'lucide-react';

const contacts = [
  {
    country: "France",
    flag: "https://flagcdn.com/fr.svg",
    phone: "+33 6 58 89 85 31",
    icon: Phone
  },
  {
    country: "Gabon",
    flag: "https://flagcdn.com/ga.svg",
    phone: "+241 77 57 17 11",
    icon: Phone
  },
  {
    country: "Chine",
    flag: "https://flagcdn.com/cn.svg",
    phone: "+86 130 8516 4047",
    icon: Phone
  }
];

const Contact = () => {
  return (
    <section id="contact" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Contactez-nous
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Notre équipe est à votre disposition pour vous aider
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact, index) => {
            const Icon = contact.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center">
                  <Icon className="h-6 w-6 text-yellow-500" />
                  <img src={contact.flag} alt={`Drapeau ${contact.country}`} className="h-4 ml-2" />
                  <h3 className="ml-3 text-lg font-medium text-gray-900">{contact.country}</h3>
                </div>
                <p className="mt-2 text-base text-gray-500">{contact.phone}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center justify-center">
              <a 
                href="https://www.facebook.com/kundapay" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-base text-gray-500 hover:text-yellow-500"
              >
                <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Suivez-nous sur Facebook
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;