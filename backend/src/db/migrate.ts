import { readFileSync } from 'fs';
import { join } from 'path';
import { pool, query, execute } from '../config/database';

async function runMigration() {
  try {
    console.log('Running MySQL database migration...');
    
    const schemaPath = join(__dirname, 'schema.mysql.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Split by semicolons and execute each statement
    // Remove comments and empty lines
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'))
      .filter(s => !s.match(/^DELIMITER/)); // Remove DELIMITER commands

    console.log(`Found ${statements.length} statements to execute`);

    for (const statement of statements) {
      if (statement.trim().length === 0) continue;
      
      try {
        // For CREATE TRIGGER, we need special handling
        if (statement.toUpperCase().includes('CREATE TRIGGER')) {
          console.log('Skipping trigger - execute manually if needed');
          continue;
        }
        
        await execute(statement + ';');
        console.log('✓ Executed statement');
      } catch (err: any) {
        // Ignore "table already exists" errors
        if (err.message && err.message.includes('already exists')) {
          console.log('⚠ Table already exists, skipping');
        } else {
          console.log('⚠ Statement error:', err.message?.substring(0, 100));
        }
      }
    }

    console.log('Migration completed.');
    console.log('Note: Triggers need to be executed manually in MySQL client.');
    console.log('Schema file location:', schemaPath);
  } catch (error: any) {
    console.error('Migration error:', error.message);
    console.log('Please run the schema.mysql.sql file manually in your MySQL client.');
  } finally {
    await pool.end();
  }
}

runMigration();