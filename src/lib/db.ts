import postgres from "postgres";

declare global {
  var __manychatSql: ReturnType<typeof postgres> | undefined;
}

function createConnection() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL não configurado. No Railway, adicione um serviço PostgreSQL ao projeto — a variável é injetada automaticamente."
    );
  }
  return postgres(url, { ssl: "prefer" });
}

export const sql = globalThis.__manychatSql ?? createConnection();

if (process.env.NODE_ENV !== "production") {
  globalThis.__manychatSql = sql;
}

let migrated = false;
export async function ensureSchema() {
  if (migrated) return;
  await sql`
    CREATE TABLE IF NOT EXISTS flows (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      trigger_type TEXT NOT NULL,
      trigger_value TEXT NOT NULL DEFAULT '',
      nodes JSONB NOT NULL DEFAULT '[]',
      edges JSONB NOT NULL DEFAULT '[]',
      active BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      flow_id TEXT NOT NULL,
      flow_name TEXT NOT NULL,
      recipient_id TEXT,
      trigger_summary TEXT,
      status TEXT NOT NULL,
      detail TEXT,
      created_at TIMESTAMPTZ NOT NULL
    )
  `;
  migrated = true;
}
