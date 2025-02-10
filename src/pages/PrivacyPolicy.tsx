import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Politique de Confidentialité</h1>
      
      <div className="prose prose-yellow">
        <h2>1. Collecte des données</h2>
        <p>KundaPay collecte les informations nécessaires pour :</p>
        <ul>
          <li>Effectuer les transferts d'argent</li>
          <li>Vérifier l'identité des utilisateurs</li>
          <li>Respecter les obligations légales</li>
          <li>Améliorer nos services</li>
        </ul>

        <h2>2. Utilisation des données</h2>
        <p>Vos données sont utilisées pour :</p>
        <ul>
          <li>Traiter vos transactions</li>
          <li>Vous contacter concernant vos transferts</li>
          <li>Prévenir la fraude</li>
          <li>Respecter nos obligations légales</li>
        </ul>

        <h2>3. Protection des données</h2>
        <p>Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données personnelles contre tout accès non autorisé, modification, divulgation ou destruction.</p>

        <h2>4. Vos droits</h2>
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul>
          <li>Droit d'accès à vos données</li>
          <li>Droit de rectification</li>
          <li>Droit à l'effacement</li>
          <li>Droit à la portabilité</li>
          <li>Droit d'opposition</li>
        </ul>

        <h2>5. Contact</h2>
        <p>Pour toute question concernant vos données personnelles, contactez-nous à l'adresse email : kundapay@gmail.com</p>
      </div>
    </div>
  );
}

export default PrivacyPolicy;