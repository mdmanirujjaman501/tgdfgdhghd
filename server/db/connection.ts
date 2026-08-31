import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbName = process.env.DB_NAME || 'tv_serial_cms';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';

let pool: mysql.Pool | null = null;
let mysqlAttempted = false;
let isMysqlConnected = false;

// In-Memory Database Store for Web Preview Fallback (when local XAMPP MySQL server is unreachable)
const memDb: Record<string, any[]> = {};
let autoIncMap: Record<string, number> = {};

export async function ensureDatabaseAndGetPool(): Promise<mysql.Pool | null> {
  if (pool) return pool;
  if (mysqlAttempted && !isMysqlConnected) return null;

  mysqlAttempted = true;
  try {
    const tempConnection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      connectTimeout: 2000,
    });

    await tempConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await tempConnection.end();

    pool = mysql.createPool({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true,
    });

    isMysqlConnected = true;
    console.log(`[Database] Successfully connected to MySQL server at ${dbHost}:${dbPort}/${dbName}`);
    return pool;
  } catch (err: any) {
    isMysqlConnected = false;
    console.warn(`[Database] Could not connect to MySQL at ${dbHost}:${dbPort}. Operating in Web Preview Mode (In-Memory DB Store). Make sure XAMPP MySQL is started when running locally.`);
    return null;
  }
}

function extractTableName(sql: string): string {
  const match = sql.match(/(?:FROM|INTO|UPDATE|TABLE\s+IF\s+NOT\s+EXISTS|TABLE)\s+`?([a-zA-Z0-9_]+)`?/i);
  return match ? match[1].toLowerCase() : 'default';
}

function parseWhere(whereClause: string, params: any[], row: any): boolean {
  if (!whereClause) return true;
  const conditions = whereClause.split(/\s+AND\s+/i);
  let paramIdx = 0;
  for (const cond of conditions) {
    const colMatch = cond.match(/`?([a-zA-Z0-9_]+)`?\s*=\s*\?/);
    if (colMatch) {
      const col = colMatch[1];
      const val = params[paramIdx++];
      if (val !== undefined && row[col] !== undefined) {
        if (String(row[col]).toLowerCase() !== String(val).toLowerCase()) {
          return false;
        }
      }
    }
  }
  return true;
}

async function memDbRun(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  const trimmed = sql.trim();
  const tableName = extractTableName(sql);

  if (!memDb[tableName]) {
    memDb[tableName] = [];
  }

  if (/^CREATE\s+TABLE/i.test(trimmed)) {
    return { lastID: 0, changes: 0 };
  }

  if (/^INSERT\s+INTO/i.test(trimmed)) {
    autoIncMap[tableName] = (autoIncMap[tableName] || 0) + 1;
    const colMatch = trimmed.match(/\(([^)]+)\)\s+VALUES/i);
    const cols = colMatch ? colMatch[1].split(',').map((c) => c.trim().replace(/`/g, '')) : [];

    const newRow: any = { id: autoIncMap[tableName] };
    cols.forEach((col, idx) => {
      newRow[col] = params[idx] !== undefined ? params[idx] : null;
    });

    memDb[tableName].push(newRow);
    return { lastID: newRow.id, changes: 1 };
  }

  if (/^UPDATE/i.test(trimmed)) {
    const setMatch = trimmed.match(/SET\s+(.+?)(?:WHERE|$)/i);
    const whereMatch = trimmed.match(/WHERE\s+(.+?)$/i);
    let updatedCount = 0;

    if (setMatch) {
      const setPairs = setMatch[1].split(',').map((s) => s.trim());
      let paramIdx = 0;
      const setCols = setPairs.map((p) => p.match(/`?([a-zA-Z0-9_]+)`?\s*=/)?.[1] || '');
      const setVals = setCols.map(() => params[paramIdx++]);
      const whereParams = params.slice(paramIdx);

      memDb[tableName].forEach((row) => {
        if (!whereMatch || parseWhere(whereMatch[1], whereParams, row)) {
          setCols.forEach((col, i) => {
            if (col) row[col] = setVals[i];
          });
          updatedCount++;
        }
      });
    }

    return { lastID: 0, changes: updatedCount };
  }

  if (/^DELETE/i.test(trimmed)) {
    const whereMatch = trimmed.match(/WHERE\s+(.+?)$/i);
    if (whereMatch) {
      const initLen = memDb[tableName].length;
      memDb[tableName] = memDb[tableName].filter((row) => !parseWhere(whereMatch[1], params, row));
      return { lastID: 0, changes: initLen - memDb[tableName].length };
    } else {
      const count = memDb[tableName].length;
      memDb[tableName] = [];
      return { lastID: 0, changes: count };
    }
  }

  return { lastID: 0, changes: 0 };
}

async function memDbQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const trimmed = sql.trim();
  const tableName = extractTableName(sql);
  const rows = memDb[tableName] || [];

  if (/COUNT\(\*\)/i.test(trimmed)) {
    return [{ cnt: rows.length, count: rows.length }] as any;
  }

  const whereMatch = trimmed.match(/WHERE\s+(.+?)(?:ORDER|LIMIT|$)/i);
  let filtered = rows;
  if (whereMatch) {
    filtered = rows.filter((r) => parseWhere(whereMatch[1], params, r));
  }

  return [...filtered] as any;
}

export async function dbRun(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  const p = await ensureDatabaseAndGetPool();
  const safeParams = params.map((val) => (val === undefined ? null : val));

  if (p && isMysqlConnected) {
    try {
      const [result]: any = await p.query(sql, safeParams);
      const lastID = result && result.insertId ? Number(result.insertId) : 0;
      const changes = result && result.affectedRows !== undefined ? Number(result.affectedRows) : 0;
      return { lastID, changes };
    } catch (err) {
      console.error('[MySQL Error] falling back to memory store for query:', err);
      return memDbRun(sql, safeParams);
    }
  } else {
    return memDbRun(sql, safeParams);
  }
}

export async function dbGet<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  const p = await ensureDatabaseAndGetPool();
  const safeParams = params.map((val) => (val === undefined ? null : val));

  if (p && isMysqlConnected) {
    try {
      const [rows]: any = await p.query(sql, safeParams);
      if (Array.isArray(rows) && rows.length > 0) {
        return rows[0] as T;
      }
      return undefined;
    } catch (err) {
      console.error('[MySQL Error] falling back to memory store for get query:', err);
      const rows = await memDbQuery<T>(sql, safeParams);
      return rows.length > 0 ? rows[0] : undefined;
    }
  } else {
    const rows = await memDbQuery<T>(sql, safeParams);
    return rows.length > 0 ? rows[0] : undefined;
  }
}

export async function dbAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const p = await ensureDatabaseAndGetPool();
  const safeParams = params.map((val) => (val === undefined ? null : val));

  if (p && isMysqlConnected) {
    try {
      const [rows]: any = await p.query(sql, safeParams);
      if (Array.isArray(rows)) {
        return rows as T[];
      }
      return [];
    } catch (err) {
      console.error('[MySQL Error] falling back to memory store for all query:', err);
      return memDbQuery<T>(sql, safeParams);
    }
  } else {
    return memDbQuery<T>(sql, safeParams);
  }
}
