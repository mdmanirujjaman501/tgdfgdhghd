import { ensureDatabaseAndGetPool, dbRun, dbGet, dbAll } from './db/connection';
import { createSchema } from './db/schema';
import { seedDatabase } from './db/seed';

export { dbRun, dbGet, dbAll };

export async function initDatabase() {
  const dbHost = process.env.DB_HOST || '127.0.0.1';
  const dbPort = process.env.DB_PORT || '3306';
  const dbName = process.env.DB_NAME || 'tv_serial_cms';

  console.log(`[Database] Initializing MySQL connection...`);
  console.log(`Database: MySQL`);
  console.log(`Host: ${dbHost}`);
  console.log(`Port: ${dbPort}`);
  console.log(`Database: ${dbName}`);

  try {
    await ensureDatabaseAndGetPool();
    await createSchema();
    await seedDatabase();
    console.log(`[Database] MySQL initialization & seeding completed successfully.`);
  } catch (err: any) {
    console.error(`\n============================================================`);
    console.error(`Unable to connect to MySQL.\n`);
    console.error(`Please make sure MySQL is running in XAMPP.\n`);
    console.error(`Host: ${dbHost}`);
    console.error(`Port: ${dbPort}`);
    console.error(`Database: ${dbName}`);
    console.error(`============================================================\n`);
  }
}
