import { createPool, type VercelPool } from "@vercel/postgres";

type Primitive = string | number | boolean | undefined | null;

// Neon / Vercel / Supabase integrations name the connection string
// differently depending on which database you picked. Accept any of them.
function resolveConnectionString(): string | undefined {
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NO_SSL
  );
}

let pool: VercelPool | undefined;

function getPool(): VercelPool {
  if (!pool) {
    const connectionString = resolveConnectionString();
    if (!connectionString) {
      throw new Error(
        "No database connection string found. Expected one of POSTGRES_URL or DATABASE_URL in the environment."
      );
    }
    pool = createPool({ connectionString });
  }
  return pool;
}

// `sql` tagged-template proxy so callers can keep writing sql`...`
export const sql = ((strings: TemplateStringsArray, ...values: Primitive[]) =>
  getPool().sql(strings, ...values)) as VercelPool["sql"];

let initialized = false;

export async function initDb() {
  if (initialized) return;
  await sql`
    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      bill_type TEXT,
      provider_name TEXT,
      total_billed NUMERIC,
      total_errors_found INTEGER DEFAULT 0,
      estimated_savings NUMERIC DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      raw_text TEXT
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS findings (
      id TEXT PRIMARY KEY,
      analysis_id TEXT NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
      error_type TEXT NOT NULL,
      line_item TEXT,
      charge_amount NUMERIC,
      expected_amount NUMERIC,
      savings NUMERIC,
      severity TEXT NOT NULL DEFAULT 'medium',
      explanation TEXT,
      action_required TEXT
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS disputes (
      id TEXT PRIMARY KEY,
      analysis_id TEXT NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status TEXT NOT NULL DEFAULT 'draft',
      letter_content TEXT,
      provider_name TEXT,
      amount_disputed NUMERIC,
      amount_recovered NUMERIC DEFAULT 0,
      notes TEXT
    )
  `;
  initialized = true;
}
