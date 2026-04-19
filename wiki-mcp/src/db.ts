import pg from "pg";

const pool = new pg.Pool({
  host: process.env.DATABASE_HOST ?? "localhost",
  port: parseInt(process.env.DATABASE_PORT ?? "5432", 10),
  user: process.env.DATABASE_USER ?? "eam_user",
  password: process.env.DATABASE_PASSWORD ?? "devpassword123",
  database: process.env.DATABASE_NAME ?? "eam_db",
});

export function getPool(): pg.Pool {
  return pool;
}

export async function closeDb(): Promise<void> {
  await pool.end();
}
