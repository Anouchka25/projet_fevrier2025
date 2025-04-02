import React from 'react';
import { Banknote, ShoppingCart, Building2, Home, Heart, GraduationCap, Package, ArrowUpDown, Globe } from 'lucide-react';

const LocalPayments = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Transferts internationaux simplifiés
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            KundaPay facilite les transferts d'argent entre le Gabon et l'international (France, Belgique, Allemagne, Chine, Canada, USA). 
            Notre plateforme unique permet d'envoyer et de recevoir de l'argent dans les deux sens.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative bg-white p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Soutenir les investissements
            </h3>
            <p className="text-gray-600">
              Les membres de la diaspora et les investisseurs internationaux peuvent facilement envoyer des fonds pour financer leurs projets au Gabon. Idéal pour le développement immobilier et entrepreneurial.
            </p>
          </div>

          <div className="relative bg-white p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <Globe className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Paiements internationaux
            </h3>
            <p className="text-gray-600">
              Les entrepreneurs peuvent effectuer des paiements internationaux en toute simplicité. Parfait pour les achats de marchandises, le paiement de fournisseurs ou de services à l'étranger.
            </p>
          </div>

          <div className="relative bg-white p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Soutien familial
            </h3>
            <p className="text-gray-600">
              Envoyez facilement de l'argent à vos proches pour les dépenses quotidiennes, les frais de scolarité ou les soins médicaux. Vos bénéficiaires reçoivent l'argent instantanément dans leur monnaie locale.
            </p>
          </div>

          <div className="relative bg-white p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Frais de scolarité
            </h3>
            <p className="text-gray-600">
              Réglez les frais d'études à l'international en toute simplicité. Que ce soit pour des études au Gabon, en France, en Belgique, en Allemagne, aux USA ou au Canada, payez directement dans la devise du pays.
            </p>
          </div>

          <div className="relative bg-white p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <ArrowUpDown className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Transferts bidirectionnels
            </h3>
            <p className="text-gray-600">
              Contrairement aux services classiques, KundaPay permet non seulement d'envoyer de l'argent au Gabon, mais aussi d'en transférer depuis le Gabon vers l'étranger. Une flexibilité unique pour tous vos besoins.
            </p>
          </div>

          <div className="relative bg-white p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Optimisation des investissements
            </h3>
            <p className="text-gray-600">
              Les entrepreneurs de la diaspora ayant investi au Gabon peuvent facilement rapatrier leurs bénéfices et les réinjecter dans leurs activités pour financer leur croissance.
            </p>
          </div>
        </div>

        <div className="mt-12 bg-yellow-50 rounded-lg p-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-gray-700 mb-4">
              En ouvrant l'accès à des transactions financières plus fluides, KundaPay soutient activement le développement économique et les échanges entre le Gabon et le reste du monde.
            </p>
            <p className="text-lg text-gray-700">
              Que ce soit pour des investissements, du commerce international, le soutien familial ou l'éducation, 
              notre plateforme rend les transferts d'argent aussi simples qu'un paiement local.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocalPayments;