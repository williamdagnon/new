# APUIC Capital - Système de Gestion d'Investissements VIP

Système complet de gestion d'investissements VIP avec parrainage, dépôts et retraits.

## 🚀 Fonctionnalités Principales

### ✅ Implémenté

1. **Architecture Backend + Frontend**
   - Backend Node.js/Express avec Supabase
   - Frontend React/TypeScript avec Vite
   - Types harmonisés entre backend et frontend

2. **Achats VIP avec Gains Journaliers Précis**
   - Enregistrement de l'heure exacte d'achat
   - Distribution des gains 24h après l'heure d'achat
   - Job cron exécuté chaque minute pour précision
   - Exemple: achat à 11h30 → premier gain le lendemain à 11h30

3. **Suppression Complète du Staking**
   - UI supprimée
   - Endpoints supprimés
   - Logique supprimée
   - Schémas de données supprimés

4. **Commissions de Parrainage**
   - Niveau 1: 30% sur le premier dépôt
   - Niveau 2: 3% sur le premier dépôt
   - Niveau 3: 3% sur le premier dépôt
   - Détection automatique du premier dépôt
   - Paiement immédiat des commissions

5. **Dépôts avec Validation Admin**
   - Interface de dépôt complète
   - Redirection vers pages dédiées
   - Statuts: en attente, validé, rejeté
   - Crédité au solde uniquement après validation admin

6. **Retraits avec Déduction Immédiate**
   - Déduction immédiate du solde à la soumission
   - Limite de 2 retraits par utilisateur par jour
   - Formulaire: banque, numéro de compte, nom du titulaire
   - Remboursement automatique si rejeté

7. **Dashboard Admin** (structure créée)
   - Gestion des utilisateurs
   - Gestion des dépôts et retraits
   - Validation/rejet des demandes
   - Gestion des banques
   - Logs d'activités

## 📁 Structure du Projet

```
project/
├── backend/                 # Backend Node.js/Express
│   ├── src/
│   │   ├── config/         # Configuration Supabase
│   │   ├── db/             # Schémas SQL
│   │   ├── jobs/           # Jobs cron (gains VIP)
│   │   ├── middleware/     # Auth middleware
│   │   ├── routes/         # Routes API
│   │   ├── services/       # Logique métier
│   │   └── utils/          # Helpers
│   └── package.json
├── src/                     # Frontend React
│   ├── components/          # Composants React
│   ├── constants/          # Constantes
│   ├── types/              # Types TypeScript
│   ├── utils/              # Utilitaires + API client
│   └── App.tsx
└── package.json
```

## 🛠️ Installation

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurez vos clés Supabase dans .env
npm run dev
```

### Frontend

```bash
npm install
cp .env.example .env
# Configurez VITE_API_URL dans .env
npm run dev
```

## 🗄️ Base de Données

1. Créez un projet Supabase
2. Exécutez le fichier `backend/src/db/schema.sql` dans l'éditeur SQL de Supabase
3. Configurez les variables d'environnement dans `backend/.env`

## 📡 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/signup` - Inscription
- `GET /api/auth/me` - Utilisateur actuel

### VIP
- `GET /api/vip/products` - Liste des produits VIP
- `POST /api/vip/purchase` - Acheter un produit VIP
- `GET /api/vip/investments` - Mes investissements
- `GET /api/vip/earnings` - Mes gains quotidiens

### Dépôts
- `POST /api/deposits` - Créer une demande de dépôt
- `GET /api/deposits/my-deposits` - Mes dépôts
- `POST /api/deposits/:id/approve` - Approuver (admin)
- `POST /api/deposits/:id/reject` - Rejeter (admin)

### Retraits
- `GET /api/withdrawals/banks` - Liste des banques
- `POST /api/withdrawals` - Créer une demande de retrait
- `GET /api/withdrawals/my-withdrawals` - Mes retraits
- `POST /api/withdrawals/:id/approve` - Approuver (admin)
- `POST /api/withdrawals/:id/reject` - Rejeter (admin)

## 🔑 Règles Métier

### Gains VIP
- Achat à 11h30 → premier gain le lendemain à 11h30
- Job cron exécuté chaque minute
- Gains distribués pendant 90 jours

### Commissions
- Uniquement sur le premier dépôt validé
- 30% niveau 1, 3% niveau 2, 3% niveau 3
- Paiement immédiat

### Retraits
- Déduction immédiate du solde
- Maximum 2 par jour par utilisateur
- Frais de 6%
- Remboursement si rejeté

## 📝 Notes

- Les interfaces de dépôt sont basées sur les captures fournies
- Le dashboard admin est en structure de base
- Attente des maquettes finales pour les dépôts
- Le système est prêt pour intégration complète

## 🎯 Prochaines Étapes

1. Finaliser les interfaces de dépôt selon les maquettes
2. Compléter le dashboard admin
3. Ajouter les tests
4. Déployer en production
