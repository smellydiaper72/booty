import { sql } from "@vercel/postgres";

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

export { sql };
