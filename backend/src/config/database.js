/**
 * config/database.js — PostgreSQL connection pool (Neon / Supabase compatible).
 *
 * Uses the `pg` package with a connection pool.
 * Connects via DATABASE_URL (standard Neon/Render/Heroku connection string).
 * SSL is enabled in production (required by Neon).
 *
 * query(sql, params) — runs a parameterized query, params is a plain array []
 * getPool()          — returns the pool instance for raw access
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }  // Neon uses self-signed certs
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});

/**
 * query — runs a parameterized SQL query.
 * @param {string} text   — SQL with $1, $2 … placeholders
 * @param {Array}  params — values array matching the placeholders
 * @returns {Promise<QueryResult>} — .rows[] contains the result rows
 */
const query = async (text, params = []) => {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
};

const getPool = () => pool;

module.exports = { query, getPool, pool };
