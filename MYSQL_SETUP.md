# 🗄️ Configuration MySQL - Guide Complet

## ✅ Migration Complète vers MySQL

Le backend a été **entièrement adapté** pour utiliser MySQL au lieu de Supabase/PostgreSQL.

## 📋 Fichiers Modifiés

### Base de Données
- ✅ `backend/src/db/schema.mysql.sql` - **NOUVEAU** Schéma MySQL complet
- ✅ `backend/src/db/schema.sql` - Conservé (PostgreSQL original)
- ✅ `backend/src/db/migrate.ts` - Adapté pour MySQL

### Configuration
- ✅ `backend/src/config/database.ts` - **REMPLACÉ** Supabase par mysql2
- ✅ `backend/package.json` - mysql2 ajouté, @supabase/supabase-js retiré
- ✅ `backend/.env.example` - Variables MySQL

### Services (Tous Adaptés)
- ✅ `backend/src/services/user.service.ts`
- ✅ `backend/src/services/wallet.service.ts`
- ✅ `backend/src/services/vip.service.ts`
- ✅ `backend/src/services/deposit.service.ts`
- ✅ `backend/src/services/withdrawal.service.ts`
- ✅ `backend/src/services/referral.service.ts`

### Routes & Middleware
- ✅ `backend/src/middleware/auth.ts` - Utilise queryOne()
- ✅ Toutes les routes adaptées

### Utilitaires
- ✅ `backend/src/utils/uuid.ts` - **NOUVEAU** Génération UUID
- ✅ `backend/src/utils/helpers.ts` - Fonctions adaptées

## 🚀 Installation Rapide

### 1. Installer les dépendances
```bash
cd backend
npm install
```

### 2. Configurer MySQL
Créez `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=apuic_capital
PORT=3001
JWT_SECRET=votre_secret_jwt
JWT_EXPIRES_IN=7d
```

### 3. Créer la base de données
```sql
CREATE DATABASE apuic_capital CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE apuic_capital;
```

### 4. Exécuter le schéma
Exécutez le fichier `backend/src/db/schema.mysql.sql` dans votre client MySQL:
- phpMyAdmin
- MySQL Workbench
- Ligne de commande: `mysql -u root -p apuic_capital < backend/src/db/schema.mysql.sql`

### 5. Démarrer le serveur
```bash
cd backend
npm run dev
```

Le serveur va afficher:
- ✅ `MySQL connection established` (succès)
- ❌ `MySQL connection failed` (erreur de connexion)

## 🔑 Différences Clés PostgreSQL → MySQL

| Aspect | PostgreSQL | MySQL |
|--------|-----------|-------|
| **UUIDs** | Type natif `UUID` | `CHAR(36)` + génération app |
| **Dates** | `TIMESTAMP WITH TIME ZONE` | `DATETIME` |
| **JSON** | `JSONB` (binaire) | `JSON` (texte) |
| **ENUM** | CHECK constraints | Type ENUM natif |
| **Requêtes** | Supabase client | SQL direct avec mysql2 |
| **Triggers** | Syntaxe simple | `DELIMITER //` |

## 📝 Notes Importantes

1. **UUIDs**: Générés avec `crypto.randomUUID()` côté application
2. **Dates**: Format `YYYY-MM-DD HH:MM:SS` pour MySQL
3. **Pool de connexions**: Configuré avec mysql2
4. **Transactions**: Supportées via `transaction()`
5. **Trigger**: Crée automatiquement le wallet à l'inscription

## ✅ Toutes les Fonctionnalités Conservées

- ✅ Gains VIP journaliers précis (24h après achat)
- ✅ Commissions de parrainage (30%, 3%, 3%)
- ✅ Dépôts avec validation admin
- ✅ Retraits avec déduction immédiate
- ✅ Limite 2 retraits/jour
- ✅ Dashboard admin

Le système est maintenant **100% MySQL** ! 🎉
