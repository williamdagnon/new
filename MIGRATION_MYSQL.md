# 🔄 Migration vers MySQL

## ✅ Changements Effectués

### 1. Base de Données
- ✅ **Schéma MySQL créé**: `backend/src/db/schema.mysql.sql`
- ✅ Remplacement de PostgreSQL par MySQL
- ✅ UUIDs générés côté application avec `crypto.randomUUID()`
- ✅ Types adaptés: `CHAR(36)` pour UUIDs, `DATETIME` pour dates, `JSON` au lieu de `JSONB`
- ✅ Triggers MySQL avec syntaxe `DELIMITER`
- ✅ ENUM natif MySQL utilisé

### 2. Configuration Backend
- ✅ **`backend/src/config/database.ts`** - Configuration MySQL avec `mysql2`
- ✅ Pool de connexions configuré
- ✅ Helpers: `query()`, `queryOne()`, `execute()`, `transaction()`
- ✅ Test de connexion au démarrage

### 3. Services Adaptés
Tous les services ont été adaptés pour utiliser MySQL:
- ✅ `user.service.ts` - Requêtes MySQL
- ✅ `wallet.service.ts` - Requêtes MySQL
- ✅ `vip.service.ts` - Requêtes MySQL avec format de dates
- ✅ `deposit.service.ts` - Requêtes MySQL
- ✅ `withdrawal.service.ts` - Requêtes MySQL
- ✅ `referral.service.ts` - Requêtes MySQL

### 4. Routes et Middleware
- ✅ `auth.routes.ts` - Adapté pour MySQL
- ✅ `middleware/auth.ts` - Utilise `queryOne` au lieu de Supabase
- ✅ Toutes les routes adaptées

### 5. Dépendances
- ✅ `mysql2` ajouté dans `package.json`
- ✅ `@supabase/supabase-js` retiré
- ✅ Types MySQL ajoutés

## 🚀 Installation

```bash
cd backend
npm install
```

## ⚙️ Configuration

Créez `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=apuic_capital
PORT=3001
JWT_SECRET=your_secret
```

## 🗄️ Création de la Base

1. Créez la base de données:
```sql
CREATE DATABASE apuic_capital CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE apuic_capital;
```

2. Exécutez le schéma:
```bash
# Dans MySQL client
mysql -u root -p apuic_capital < backend/src/db/schema.mysql.sql
```

Ou copiez-collez le contenu de `backend/src/db/schema.mysql.sql` dans votre client MySQL.

## 🔑 Différences Clés

### UUIDs
- **PostgreSQL**: `UUID` type natif avec `uuid_generate_v4()`
- **MySQL**: `CHAR(36)` avec génération côté app via `crypto.randomUUID()`

### Dates
- **PostgreSQL**: `TIMESTAMP WITH TIME ZONE`
- **MySQL**: `DATETIME` ou `TIMESTAMP`
- Format dans les requêtes: `YYYY-MM-DD HH:MM:SS`

### JSON
- **PostgreSQL**: `JSONB` (binaire)
- **MySQL**: `JSON` (texte)

### Requêtes
- **Supabase**: `.from('table').select()`
- **MySQL**: Requêtes SQL directes avec `query()` et `queryOne()`

## ✅ Fonctionnalités Conservées

Toutes les fonctionnalités restent identiques:
- ✅ Gains VIP journaliers précis (24h après achat)
- ✅ Commissions de parrainage (30%, 3%, 3%)
- ✅ Dépôts avec validation admin
- ✅ Retraits avec déduction immédiate
- ✅ Limite 2 retraits/jour
- ✅ Dashboard admin

## 🧪 Test

```bash
cd backend
npm run dev
```

Le serveur va afficher:
- ✅ MySQL connection established (si succès)
- ❌ MySQL connection failed (si erreur)
