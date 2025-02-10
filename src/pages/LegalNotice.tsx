import React from 'react';

const LegalNotice = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Mentions Légales</h1>
      
      <div className="prose prose-yellow">
        <h2>1. Informations légales</h2>
        <p>
          <strong>Nom commercial :</strong> KundaPay<br />
          <strong>Raison sociale :</strong> Anouchka MINKOUE OBAME<br />
          <strong>SIRET :</strong> 794 069 997 00029<br />
          <strong>Siège social :</strong> 319 Route de la Chapelle, 76640 Cléville, France<br />
          <strong>Représentant légal :</strong> Anouchka MINKOUE OBAME<br />
          <strong>Immatriculation :</strong> RCS Rouen
        </p>

        <h2>2. Activité</h2>
        <p>KundaPay est un service de transfert d'argent international opérant entre le Gabon, la Chine et la France.</p>

        <h2>3. Contact</h2>
        <p>Pour toute question ou réclamation, vous pouvez nous contacter :</p>
        <ul>
          <li>
            Par téléphone : 
            <ul>
              <li>France : +33 6 58 89 85 31</li>
              <li>Gabon : +241 07 57 17 11</li>
              <li>Chine : +86 130 8516 4047</li>
            </ul>
          </li>
          <li>
            Par mail : 
            <ul>
              <li>kundapay@gmail.com</li>
            </ul>
          </li>
          <li>Par courrier : 319 Route de la Chapelle, 76640 Cléville, France</li>
        </ul>

        <h2>4. Hébergement</h2>
        <p>Ce site est hébergé par Netlify - netlify.com</p>

        <h2>5. Propriété intellectuelle</h2>
        <p>L'ensemble du contenu de ce site est protégé par le droit d'auteur. Toute reproduction sans autorisation préalable est interdite.</p>
      </div>
    </div>
  );
}

export default LegalNotice;