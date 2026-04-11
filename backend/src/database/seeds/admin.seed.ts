/**
 * Admin seed — creates the default system administrator account.
 * Run via: npm run seed:admin
 * Requires a running PostgreSQL and valid DATABASE_* env vars in .env
 */
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const BCRYPT_COST = 12;

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: false,
});

async function run() {
  await AppDataSource.initialize();

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@eam.local';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@Sprint1Dev';
  const adminName = process.env.ADMIN_NAME ?? 'System Admin';

  const exists = await AppDataSource.query(
    `SELECT id FROM users WHERE email = $1 LIMIT 1`,
    [adminEmail],
  );

  if (exists.length > 0) {
    console.log(`Admin user '${adminEmail}' already exists — skipping seed.`);
    await AppDataSource.destroy();
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, BCRYPT_COST);

  await AppDataSource.query(
    `INSERT INTO users (id, email, password_hash, name, role, store_id, is_active)
     VALUES (uuid_generate_v4(), $1, $2, $3, 'admin', NULL, true)`,
    [adminEmail, passwordHash, adminName],
  );

  console.log(`✅ Admin user '${adminEmail}' created successfully.`);
  await AppDataSource.destroy();
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
