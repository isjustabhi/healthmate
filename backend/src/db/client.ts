import { Pool, QueryResultRow } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    const isSupabase = connectionString.includes('supabase.co');
    pool = new Pool({
      connectionString,
      ssl: isSupabase ? { rejectUnauthorized: false } : process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err);
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<{ rows: T[]; rowCount: number | null }> {
  const client = getPool();
  const result = await client.query<T>(text, params);
  return { rows: result.rows, rowCount: result.rowCount };
}

export async function testConnection(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Database connection failed:', msg);
    if (msg.includes('ENOTFOUND') && process.env.DATABASE_URL?.includes('db.')) {
      console.error(
        'Tip: db.<project>.supabase.co is often IPv6-only. In Supabase Dashboard → Connect, copy the Session pooler URI (aws-0-<region>.pooler.supabase.com) and set DATABASE_URL. URL-encode @ in passwords as %40.'
      );
    }
    return false;
  }
}
