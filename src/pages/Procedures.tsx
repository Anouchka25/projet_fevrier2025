import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const VerificationFonds = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">Procédure de Vérification des Fonds Entrants</h1>
          
          <div className="prose prose-yellow">
            <h2>1. Conditions Générales des Transferts</h2>
            <p>
              Les transactions sont réalisées exclusivement via des plateformes sécurisées et contrôlées :
              <strong> PayPal, Wero, virements bancaires, Airtel Money, MoveMonnaie, Alipay</strong>.<br />
              Nos plateformes partenaires sont agréées et respectent les normes de conformité financière.
            </p>
            <p>
              Le montant maximum pour un transfert est actuellement fixé à <strong>1 000 000 FCFA</strong>. 
              Les montants supérieurs nécessitent une validation spécifique.
            </p>

            <h2>2. Limites et Justificatifs Exigés</h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">Montant transféré (FCFA)</th>
                  <th className="border border-gray-300 px-4 py-2">Justificatifs requis</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">&lt; 650 000</td>
                  <td className="border border-gray-300 px-4 py-2">Aucun justificatif requis sauf en cas de suspicion</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">650 000 - 1 000 000</td>
                  <td className="border border-gray-300 px-4 py-2">
                    - Pièce d'identité valide (CNI, passeport) <br />
                    - Relevé d'identité bancaire (RIB) <br />
                    - Justificatif de l'origine des fonds (facture, relevé bancaire, contrat de prestation)
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">&gt; 1 000 000</td>
                  <td className="border border-gray-300 px-4 py-2">
                    - Transfert soumis à validation spécifique <br />
                    - Contrôle renforcé et audit supplémentaire <br />
                    - Justificatif détaillé de l'origine des fonds (contrat de transaction, héritage, etc.)
                  </td>
                </tr>
              </tbody>
            </table>

            <h2>3. Surveillance des Transferts et Fraudes</h2>
            <p>
              KundaPay surveille toutes les transactions et applique les mesures suivantes :
            </p>
            <ul>
              <li>Analyse des habitudes d'envoi pour détecter toute anomalie.</li>
              <li>Blocage automatique des transactions en cas de soupçon.</li>
              <li>En cas de suspicion de fraude, l'argent est immédiatement retourné à l'expéditeur, qui doit payer les frais de remboursement.</li>
              <li>Signalement aux autorités en cas de transaction frauduleuse.</li>
            </ul>

            <h2>4. Contact et Assistance</h2>
            <p>
              Pour toute question ou assistance, contactez notre support :
            </p>
            <ul>
              <li>Email : <strong>kundapay@gmail.com</strong></li>
              <li>France : +33 6 58 89 85 31</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default VerificationFonds;