# APUIC Capital Backend

Backend API pour le système APUIC Capital.

## 🚀 Installation

```bash
cd backend
npm install
```

## ⚙️ Configuration

1. Créez un fichier `.env` à la racine du dossier `backend`:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=apuic_capital

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

2. Créez votre base de données MySQL et exécutez le schéma SQL:
   - Créez une base de données: `CREATE DATABASE apuic_capital CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
   - Ouvrez le fichier `src/db/schema.mysql.sql`
   - Exécutez-le dans votre client MySQL (phpMyAdmin, MySQL Workbench, etc.)

## 🏃‍♂️ Démarrage

```bash
# Développement
npm run dev

# Production
npm run build
npm start
```

## 📡 Endpoints API

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/signup` - Inscription
- `GET /api/auth/me` - Utilisateur actuel

### VIP
- `GET /api/vip/products` - Liste des produits VIP
- `POST /api/vip/purchase` - Acheter un produit VIP
- `GET /api/vip/investments` - Mes investissements VIP
- `GET /api/vip/earnings` - Mes gains quotidiens

### Dépôts
- `POST /api/deposits` - Créer une demande de dépôt
- `GET /api/deposits/my-deposits` - Mes dépôts
- `GET /api/deposits/all` - Tous les dépôts (admin)
- `POST /api/deposits/:id/approve` - Approuver un dépôt (admin)
- `POST /api/deposits/:id/reject` - Rejeter un dépôt (admin)

### Retraits
- `GET /api/withdrawals/banks` - Liste des banques
- `POST /api/withdrawals` - Créer une demande de retrait
- `GET /api/withdrawals/my-withdrawals` - Mes retraits
- `GET /api/withdrawals/all` - Tous les retraits (admin)
- `POST /api/withdrawals/:id/approve` - Approuver un retrait (admin)
- `POST /api/withdrawals/:id/reject` - Rejeter un retrait (admin)

### Portefeuille
- `GET /api/wallet` - Mon portefeuille
- `GET /api/wallet/transactions` - Mes transactions
- `GET /api/wallet/referral-stats` - Statistiques de parrainage
- `GET /api/wallet/commissions` - Mes commissions
- `GET /api/wallet/team` - Mon équipe

### Admin
- `GET /api/admin/stats` - Statistiques du dashboard
- `GET /api/admin/users` - Liste des utilisateurs
- `GET /api/admin/banks` - Liste des banques
- `POST /api/admin/banks` - Créer une banque
- `GET /api/admin/logs` - Logs d'activité

## 🔑 Fonctionnalités Clés

### Base de Données MySQL
- Utilise **mysql2** pour les connexions
- Pool de connexions configuré
- UUIDs générés côté application
- Format de dates: `YYYY-MM-DD HH:MM:SS`

### Gains VIP Journaliers
- Les gains sont distribués **24h après l'heure exacte d'achat**
- Job cron exécuté **chaque minute** pour précision
- Exemple: achat à 11h30 → premier gain le lendemain à 11h30

### Commissions de Parrainage
- **Niveau 1**: 30% sur le premier dépôt du filleul
- **Niveau 2**: 3% sur le premier dépôt
- **Niveau 3**: 3% sur le premier dépôt
- Uniquement sur le **premier dépôt** validé

### Dépôts
- Statut: `pending`, `approved`, `rejected`
- Crédité au solde uniquement après validation admin
- Détection automatique du premier dépôt

### Retraits
- **Déduction immédiate** du solde à la soumission
- Limite: **2 retraits par utilisateur par jour**
- Formulaire: banque, numéro de compte, nom du titulaire
- Si rejeté, remboursement automatique

## 🔒 Authentification

Toutes les routes protégées nécessitent un header:
```
Authorization: Bearer <token>
```

Les routes admin nécessitent également `is_admin: true`.
