# KundaPay - Plateforme de transfert d'argent

KundaPay est une plateforme de transfert d'argent qui facilite les transferts entre le Gabon, la France, la Belgique, l'Allemagne, la Chine, les États-Unis et le Canada.

## Architecture hybride

Ce projet utilise une architecture hybride :
- **Frontend** : Hébergé sur Netlify
- **API Serverless** : Hébergée sur Vercel

## Configuration du déploiement

### Netlify (Frontend)

Le fichier `netlify.toml` est configuré pour :
1. Construire l'application React
2. Rediriger les requêtes API vers Vercel
3. Gérer les routes SPA

### Vercel (API)

Le fichier `vercel.json` est configuré pour :
1. Déployer uniquement les fonctions serverless dans le dossier `/api`
2. Gérer les variables d'environnement

## Développement local

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm run dev
```

## Déploiement

### Déployer le frontend sur Netlify

```bash
# Construire l'application
npm run build

# Déployer sur Netlify
netlify deploy --prod
```

### Déployer l'API sur Vercel

```bash
# Déployer sur Vercel
vercel --prod
```

## Variables d'environnement

Consultez le fichier `.env.example` pour voir les variables d'environnement nécessaires.

## Fonctionnalités principales

- Transferts d'argent internationaux
- Multiples méthodes de paiement (Airtel Money, Moov Money, virement bancaire, carte, PayPal, etc.)
- Codes promo et réductions
- Tableau de bord utilisateur
- Interface d'administration