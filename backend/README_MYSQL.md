# APUIC Capital Backend - MySQL Version

Backend API pour le système APUIC Capital utilisant MySQL.

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

2. Créez la base de données MySQL et exécutez le schéma:
   - Créez une base de données MySQL
   - Ouvrez le fichier `src/db/schema.mysql.sql`
   - Exécutez-le dans votre client MySQL (phpMyAdmin, MySQL Workbench, etc.)

## 🗄️ Base de Données

### Création de la base

```sql
CREATE DATABASE apuic_capital CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE apuic_capital;
```

Puis exécutez le fichier `backend/src/db/schema.mysql.sql` complet.

### Différences avec PostgreSQL

- **UUIDs**: Générés côté application avec `crypto.randomUUID()`
- **Types**: `CHAR(36)` pour les UUIDs au lieu de `UUID`
- **Dates**: `DATETIME` au lieu de `TIMESTAMP WITH TIME ZONE`
- **JSON**: `JSON` au lieu de `JSONB`
- **ENUM**: Support natif MySQL
- **Triggers**: Syntaxe différente avec `DELIMITER`

## 🏃‍♂️ Démarrage

```bash
# Développement
npm run dev

# Production
npm run build
npm start
```

Le serveur va:
1. Tester la connexion MySQL au démarrage
2. Afficher un message de succès/erreur
3. Démarrer les jobs cron pour les gains VIP

## 📡 Endpoints API

Identiques à la version Supabase. Voir `README.md` pour la liste complète.

## 🔑 Fonctionnalités

Toutes les fonctionnalités restent identiques:
- ✅ Gains VIP journaliers précis (24h après achat)
- ✅ Commissions de parrainage (30%, 3%, 3%)
- ✅ Dépôts avec validation admin
- ✅ Retraits avec déduction immédiate
- ✅ Limite 2 retraits/jour
- ✅ Dashboard admin

## 🛠️ Dépannage

### Erreur de connexion MySQL
- Vérifiez que MySQL est démarré
- Vérifiez les credentials dans `.env`
- Vérifiez que la base de données existe

### Erreur de trigger
Si le trigger échoue, exécutez manuellement:
```sql
DROP TRIGGER IF EXISTS create_wallet_on_user_creation;

DELIMITER //
CREATE TRIGGER create_wallet_on_user_creation
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  SET @wallet_id = REPLACE(UUID(), '-', '');
  INSERT INTO wallets (id, user_id, balance, total_invested, total_earned, total_withdrawn)
  VALUES (@wallet_id, NEW.id, 0, 0, 0, 0);
END//
DELIMITER ;
```

### UUIDs
Les UUIDs sont générés côté application avec `crypto.randomUUID()` et stockés comme `CHAR(36)`.
