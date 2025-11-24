import mysql, { PoolConnection } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// MySQL configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'apuic_capital',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create connection pool
export const pool = mysql.createPool(dbConfig);

// Test connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ MySQL connection established');
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
    return false;
  }
};

// Helper function to execute queries
export const query = async <T = any>(
  sql: string,
  params?: any[]
): Promise<T[]> => {
  try {
    const [rows] = await pool.execute(sql, params || []);
    return rows as T[];
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Helper function for single row queries
export const queryOne = async <T = any>(
  sql: string,
  params?: any[]
): Promise<T | null> => {
  try {
    const rows = await query<T>(sql, params || []);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('QueryOne error:', error);
    throw error;
  }
};

// Helper function for insert/update/delete
export const execute = async (
  sql: string,
  params?: any[]
): Promise<{ affectedRows: number; insertId?: number }> => {
  try {
    const [result] = await pool.execute(sql, params || []) as any;
    return {
      affectedRows: result.affectedRows || 0,
      insertId: result.insertId
    };
  } catch (error) {
    console.error('Execute error:', error);
    throw error;
  }
};

// Transaction helper
export const transaction = async <T>(
  callback: (connection: PoolConnection) => Promise<T>
): Promise<T> => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export default pool;