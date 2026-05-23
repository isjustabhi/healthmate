require('dotenv').config();
const { Pool } = require('pg');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Missing DATABASE_URL in .env');
  process.exit(1);
}

const safe = url.replace(/:([^:@/]+)@/, ':***@');
console.log('Testing:', safe);

const pool = new Pool({
  connectionString: url,
  ssl: url.includes('supabase.co') ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 15000,
});

pool
  .query('SELECT 1 AS ok')
  .then((r) => {
    console.log('DB OK', r.rows[0]);
    process.exit(0);
  })
  .catch((e) => {
    console.error('DB FAIL:', e.message);
    if (e.message.includes('ENOTFOUND') && url.includes('db.')) {
      console.error('\nUse Session pooler URI from Supabase → Connect (not direct db.* host on IPv4 networks).');
    }
    if (url.includes('@') && !url.includes('%40')) {
      console.error('\nPassword may contain @ — encode it as %40 in DATABASE_URL.');
    }
    process.exit(1);
  })
  .finally(() => pool.end());
