# ✅ Migration vers MySQL - Résumé

## 🎯 Objectif Atteint

Le backend et la base de données ont été **complètement adaptés** pour utiliser **MySQL** au lieu de Supabase/PostgreSQL.

## 📋 Changements Principaux

### 1. Base de Données ✅
- **Nouveau schéma**: `backend/src/db/schema.mysql.sql`
- **Types adaptés**:
  - `UUID` → `CHAR(36)` avec génération côté application
  - `TIMESTAMP WITH TIME ZONE` → `DATETIME`
  - `JSONB` → `JSON`
  - `ENUM` natif MySQL utilisé
- **Triggers MySQL** avec syntaxe `DELIMITER`
- **UUIDs générés** avec `crypto.randomUUID()`

### 2. Configuration Backend ✅
- **`mysql2`** remplace `@supabase/supabase-js`
- **Pool de connexions** MySQL configuré
- **Helpers**: `query()`, `queryOne()`, `execute()`, `transaction()`
- **Test de connexion** au démarrage du serveur

### 3. Services Adaptés ✅
Tous les services utilisent maintenant des **requêtes SQL directes**:
- `user.service.ts` - Requêtes MySQL
- `wallet.service.ts` - Requêtes MySQL
- `vip.service.ts` - Requêtes MySQL avec format dates
- `deposit.service.ts` - Requêtes MySQL
- `withdrawal.service.ts` - Requêtes MySQL
- `referral.service.ts` - Requêtes MySQL

### 4. Routes et Middleware ✅
- Toutes les routes adaptées pour MySQL
- Middleware d'authentification utilise `queryOne()`
- Aucune référence à Supabase dans le code

## 🔑 Différences Techniques

### Avant (Supabase/PostgreSQL)
```typescript
const { data } = await supabaseAdmin
  .from('users')
  .select()
  .eq('id', userId)
  .single();
```

### Après (MySQL)
```typescript
const user = await queryOne<User>(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);
```

### UUIDs
- **Avant**: Générés par PostgreSQL avec `uuid_generate_v4()`
- **Après**: Générés côté application avec `crypto.randomUUID()`

### Dates
- **Avant**: `TIMESTAMP WITH TIME ZONE`, format ISO
- **Après**: `DATETIME`, format `YYYY-MM-DD HH:MM:SS`

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

1. Créez la base de données MySQL
2. Exécutez `backend/src/db/schema.mysql.sql` dans votre client MySQL
3. Le trigger créera automatiquement les wallets pour les nouveaux utilisateurs

## ✅ Fonctionnalités Conservées

Toutes les fonctionnalités restent **100% identiques**:
- ✅ Gains VIP journaliers précis (24h après achat)
- ✅ Commissions de parrainage (30%, 3%, 3%)
- ✅ Dépôts avec validation admin
- ✅ Retraits avec déduction immédiate
- ✅ Limite 2 retraits/jour
- ✅ Dashboard admin

Le système est maintenant **100% MySQL** ! 🎉
