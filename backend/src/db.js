import mysql from 'mysql2/promise';
import config from './config.js';

let pool = null;

// In-memory fallback storage for when MySQL server is unreachable or during unit tests
const inMemoryStore = [
  {
    id: 1,
    title: 'Initialize CI/CD Pipeline',
    priority: 'high',
    category: 'CI/CD',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Containerize Application with Docker',
    priority: 'medium',
    category: 'Docker',
    createdAt: new Date().toISOString(),
  },
];
let nextInMemoryId = 3;

/**
 * Initialize MySQL Connection Pool
 */
export function getPool() {
  if (!pool) {
    try {
      pool = mysql.createPool({
        host: config.DB.host,
        port: config.DB.port,
        user: config.DB.user,
        password: config.DB.password,
        database: config.DB.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 2000,
      });
    } catch (err) {
      console.warn(`[Database] Failed to create MySQL pool: ${err.message}`);
      pool = null;
    }
  }
  return pool;
}

/**
 * Check database connectivity
 */
export async function checkConnection() {
  if (config.NODE_ENV === 'test') {
    return { connected: false, mode: 'test-fallback', message: 'Test environment active' };
  }

  const p = getPool();
  if (!p) {
    return { connected: false, mode: 'memory-fallback', message: 'MySQL pool not initialized' };
  }

  try {
    const connection = await p.getConnection();
    await connection.ping();
    connection.release();
    return { connected: true, mode: 'mysql', message: 'Connected to MySQL successfully' };
  } catch (err) {
    return {
      connected: false,
      mode: 'memory-fallback',
      message: `MySQL unreachable (${err.code || err.message}). Operating in resilient fallback mode.`,
    };
  }
}

/**
 * Execute SQL Query with resilient fallback
 */
export async function query(sql, params = []) {
  // If test mode or if connection has failed, use in-memory fallback
  if (config.NODE_ENV === 'test') {
    return handleInMemoryQuery(sql, params);
  }

  const p = getPool();
  if (!p) {
    return handleInMemoryQuery(sql, params);
  }

  try {
    const [results] = await p.query(sql, params);
    return results;
  } catch (err) {
    console.warn(`[Database] MySQL Query failed (${err.message}). Using fallback.`);
    return handleInMemoryQuery(sql, params);
  }
}

/**
 * Resilient query handler for fallback / offline / testing
 */
function handleInMemoryQuery(sql, params) {
  const normalized = sql.trim().toUpperCase();

  if (normalized.startsWith('SELECT') && normalized.includes('FROM ITEMS')) {
    if (normalized.includes('WHERE ID =')) {
      const id = parseInt(params[0], 10);
      const item = inMemoryStore.find((i) => i.id === id);
      return item ? [item] : [];
    }
    return [...inMemoryStore];
  }

  if (normalized.startsWith('INSERT INTO ITEMS')) {
    const [title, priority, category] = params;
    const newItem = {
      id: nextInMemoryId++,
      title,
      priority: priority || 'medium',
      category: category || 'general',
      createdAt: new Date().toISOString(),
    };
    inMemoryStore.push(newItem);
    return { insertId: newItem.id, affectedRows: 1 };
  }

  if (normalized.startsWith('DELETE FROM ITEMS WHERE ID =')) {
    const id = parseInt(params[0], 10);
    const index = inMemoryStore.findIndex((i) => i.id === id);
    if (index !== -1) {
      inMemoryStore.splice(index, 1);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  return [];
}

/**
 * Close pool gracefully
 */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export default {
  getPool,
  checkConnection,
  query,
  closePool,
};
