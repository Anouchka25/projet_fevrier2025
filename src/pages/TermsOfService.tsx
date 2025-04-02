import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">Conditions Générales de Vente</h1>
          
          <div className="prose prose-yellow">
            <h2>1. Présentation de l'entreprise</h2>
            <p>
              KundaPay est une entreprise fondée par Anouchka MINKOUE OBAME.<br />
              Immatriculée sous le SIRET 794 069 997 00029, l'entreprise est enregistrée au RCS de Rouen, France.<br />
              Son siège social est situé au 319 Route de la Chapelle, 76640 Cléville, France.<br />
              Représentant légal : Anouchka MINKOUE OBAME.
            </p>

            <h2>2. Moyens de paiement et sécurité</h2>
            <p>
              KundaPay s'associe à des partenaires de confiance pour assurer la sécurité et la fiabilité des transactions :
            </p>
            <ul>
              <li>
                <strong>Airtel Money et Moov Money</strong> : Pour les transferts d'argent mobile au Gabon
              </li>
              <li>
                <strong>Wero</strong> : Solution de paiement mobile pour les transferts entre la France et le Gabon
              </li>
              <li>
                <strong>Alipay</strong> : Pour les transferts vers la Chine
              </li>
              <li>
                <strong>PayPal</strong> : Pour les transferts avec la France, le Canada et les USA
              </li>
              <li>
                <strong>Interac</strong> : Pour les transferts avec le Canada
              </li>
              <li>
                <strong>ACH</strong> : Pour les virements bancaires aux États-Unis
              </li>
            </ul>

            <h2>3. Irrévocabilité des transferts</h2>
            <p className="font-semibold text-red-600">
              IMPORTANT : Une fois qu'un transfert est validé et que les fonds ont été transférés au bénéficiaire, l'opération est définitive et irrévocable. Aucun remboursement ou annulation ne sera possible après la validation du transfert.
            </p>

            <h2>4. Responsabilité de l'expéditeur</h2>
            <p>
              L'expéditeur est seul responsable :
            </p>
            <ul>
              <li>Du choix du bénéficiaire et de l'exactitude des informations fournies le concernant</li>
              <li>De la vérification de l'identité du bénéficiaire avant d'effectuer le transfert</li>
              <li>De s'assurer que le bénéficiaire est bien la personne à qui il souhaite envoyer l'argent</li>
              <li>Des conséquences d'une erreur dans les informations fournies</li>
            </ul>
            <p className="text-red-600">
              KundaPay ne pourra être tenu responsable des erreurs commises par l'expéditeur dans le choix du bénéficiaire ou dans les informations fournies.
            </p>

            <h2>5. Processus de transfert</h2>
            <p>Le processus de transfert se déroule en plusieurs étapes :</p>
            <ol>
              <li>Saisie des informations du transfert (pays, montant)</li>
              <li>Choix du mode de paiement et de réception</li>
              <li>Vérification des informations</li>
              <li>Validation et paiement sécurisé via nos partenaires (Airtel Money, Moov Money, etc.)</li>
              <li>Confirmation du transfert</li>
            </ol>
            <p className="bg-yellow-50 p-4 border-l-4 border-yellow-500">
              Une fois ces étapes complétées et le transfert validé, l'opération devient définitive et ne peut être annulée.
            </p>

            <h2>6. Tarification</h2>
            <p>
              Les frais de transfert sont clairement indiqués avant la validation de chaque transaction. Ces frais varient selon :
            </p>
            <ul>
              <li>Le pays de destination</li>
              <li>Le montant transféré</li>
              <li>Le mode de paiement choisi</li>
              <li>Le mode de réception choisi</li>
            </ul>

            <h2>7. Sécurité et conformité</h2>
            <p>
              KundaPay s'engage à :
            </p>
            <ul>
              <li>Vérifier l'identité des utilisateurs conformément aux réglementations en vigueur</li>
              <li>Sécuriser les transactions selon les normes bancaires internationales via nos partenaires</li>
              <li>Protéger les données personnelles conformément au RGPD</li>
              <li>Lutter contre la fraude et le blanchiment d'argent</li>
              <li>Assurer la conformité avec les réglementations financières internationales</li>
            </ul>

            <h2>8. Service client</h2>
            <p>
              Pour toute question ou assistance, notre service client est disponible :
            </p>
            <ul>
              <li>France : +33 6 58 89 85 31</li>
              <li>Gabon : +241 77 57 17 11</li>
              <li>Chine : +86 130 8516 4047</li>
              <li>Email : kundapay@gmail.com</li>
            </ul>

            <h2>9. Protection des données de paiement</h2>
            <p>
              Nos partenaires de paiement assurent :
            </p>
            <ul>
              <li>Le stockage sécurisé des données selon les normes PCI DSS</li>
              <li>Le chiffrement de bout en bout des informations sensibles</li>
              <li>La surveillance continue des transactions pour détecter les activités suspectes</li>
              <li>La mise à jour régulière des systèmes de sécurité</li>
            </ul>

            <h2>10. Limites de transfert</h2>
            <p>
              Pour votre sécurité et conformément aux réglementations :
            </p>
            <ul>
              <li>Des limites de montant peuvent s'appliquer selon le mode de paiement choisi</li>
              <li>Une vérification d'identité peut être requise pour certains montants</li>
              <li>Les transferts sont surveillés pour prévenir la fraude</li>
            </ul>

            <h2>11. Modifications des conditions</h2>
            <p>
              KundaPay se réserve le droit de modifier ces conditions générales à tout moment. Les modifications prennent effet dès leur publication sur le site.
            </p>
          </div>
          <div className="text-center my-6">
      <a
        href="https://kundapay.com/Procedures"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-yellow-600 transition duration-300"
      >
        Consulter notre procédure de Vérification des Fonds Entrants depuis le Gabon
      </a>
    </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default TermsOfService;