import "server-only";

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { mallItems } from "@/lib/item-mall";

type SqlValue = string | number | boolean | null;
type Row = Record<string, unknown>;

export type DatabaseMode = "postgres" | "sqlite" | "unconfigured";

export class DatabaseUnavailableError extends Error {
  constructor() {
    super("The website database is not configured.");
    this.name = "DatabaseUnavailableError";
  }
}

let postgres: NeonQueryFunction<false, false> | null = null;
let postgresReady: Promise<void> | null = null;
let sqlite: Database.Database | null = null;

const categories = [
  ["general", "General Discussion", "Talk about Warborn, guilds, events and the community.", 1],
  ["trade", "Trade", "Buy, sell and exchange items with other players.", 2],
  ["tips", "Tip and Tech", "Guides, builds, strategies and technical help.", 3],
  ["bugs", "Bug Reports", "Report game and website issues with useful details.", 4],
] as const;

const defaultSettings = [
  ["server_name", "Vharos"],
  ["server_status", "ONLINE"],
  ["maintenance_schedule", "Thu. 05:00 ~ 06:00"],
  ["mall_announcement", "Character delivery will be connected to the game database next."],
  ["item_mall_enabled", "true"],
] as const;

export function getDatabaseMode(): DatabaseMode {
  if (process.env.DATABASE_URL) return "postgres";
  if (process.env.NODE_ENV !== "production" || process.env.WARBORN_USE_SQLITE === "true") return "sqlite";
  return "unconfigured";
}

export function isWebDatabaseConfigured() {
  return getDatabaseMode() !== "unconfigured";
}

function sqliteSql(text: string) {
  return text.replace(/\$\d+/g, "?");
}

function sqliteParams(params: SqlValue[]) {
  return params.map((value) => typeof value === "boolean" ? Number(value) : value);
}

function getPostgres() {
  if (!process.env.DATABASE_URL) throw new DatabaseUnavailableError();
  if (!postgres) postgres = neon(process.env.DATABASE_URL);
  return postgres;
}

async function initializePostgres() {
  const sql = getPostgres();
  await sql.query(`CREATE TABLE IF NOT EXISTS accounts (
    id BIGSERIAL PRIMARY KEY,
    account_id VARCHAR(24) NOT NULL,
    nickname VARCHAR(20) NOT NULL,
    email VARCHAR(320) NOT NULL,
    password_hash TEXT,
    auth_source VARCHAR(24) NOT NULL DEFAULT 'local',
    game_account_id VARCHAR(128),
    status VARCHAR(24) NOT NULL DEFAULT 'active',
    role VARCHAR(24) NOT NULL DEFAULT 'player',
    locale VARCHAR(10) NOT NULL DEFAULT 'en-US',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMPTZ
  )`);
  await sql.query("ALTER TABLE accounts ADD COLUMN IF NOT EXISTS auth_source VARCHAR(24) NOT NULL DEFAULT 'local'");
  await sql.query("ALTER TABLE accounts ADD COLUMN IF NOT EXISTS game_account_id VARCHAR(128)");
  await sql.query("ALTER TABLE accounts ALTER COLUMN password_hash DROP NOT NULL");
  await sql.query("CREATE UNIQUE INDEX IF NOT EXISTS accounts_account_id_lower_idx ON accounts (LOWER(account_id))");
  await sql.query("CREATE UNIQUE INDEX IF NOT EXISTS accounts_email_lower_idx ON accounts (LOWER(email))");
  await sql.query("CREATE UNIQUE INDEX IF NOT EXISTS accounts_nickname_lower_idx ON accounts (LOWER(nickname))");
  await sql.query("CREATE UNIQUE INDEX IF NOT EXISTS accounts_game_account_id_idx ON accounts (game_account_id) WHERE game_account_id IS NOT NULL");

  await sql.query(`CREATE TABLE IF NOT EXISTS news_posts (
    id BIGSERIAL PRIMARY KEY,
    kind VARCHAR(12) NOT NULL CHECK (kind IN ('news', 'update')),
    title VARCHAR(120) NOT NULL,
    summary VARCHAR(320) NOT NULL,
    body TEXT NOT NULL,
    author_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await sql.query(`CREATE TABLE IF NOT EXISTS forum_categories (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(80) NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`);
  await sql.query(`CREATE TABLE IF NOT EXISTS forum_topics (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES forum_categories(id) ON DELETE RESTRICT,
    author_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    title VARCHAR(120) NOT NULL,
    body TEXT NOT NULL,
    locked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await sql.query(`CREATE TABLE IF NOT EXISTS forum_replies (
    id BIGSERIAL PRIMARY KEY,
    topic_id BIGINT NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await sql.query(`CREATE TABLE IF NOT EXISTS site_settings (
    key VARCHAR(64) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await sql.query(`CREATE TABLE IF NOT EXISTS mall_items (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(32) NOT NULL,
    race VARCHAR(32) NOT NULL,
    amount INTEGER NOT NULL DEFAULT 1 CHECK (amount > 0),
    price_points INTEGER NOT NULL CHECK (price_points >= 0),
    description TEXT NOT NULL,
    icon VARCHAR(24) NOT NULL DEFAULT 'chest',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await sql.query(`CREATE TABLE IF NOT EXISTS account_points (
    account_id BIGINT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await sql.query(`CREATE TABLE IF NOT EXISTS point_transactions (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    reason VARCHAR(240) NOT NULL,
    admin_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await sql.query("CREATE INDEX IF NOT EXISTS news_kind_created_idx ON news_posts(kind, published, created_at DESC)");
  await sql.query("CREATE INDEX IF NOT EXISTS forum_topics_category_idx ON forum_topics(category_id, updated_at DESC)");
  await sql.query("CREATE INDEX IF NOT EXISTS forum_replies_topic_idx ON forum_replies(topic_id, created_at)");
  await sql.query("CREATE INDEX IF NOT EXISTS mall_items_active_idx ON mall_items(active, category, sort_order)");
  await sql.query("CREATE INDEX IF NOT EXISTS point_transactions_account_idx ON point_transactions(account_id, created_at DESC)");

  for (const category of categories) {
    await sql.query(`INSERT INTO forum_categories (slug, name, description, sort_order)
      VALUES ($1, $2, $3, $4) ON CONFLICT (slug) DO NOTHING`, [...category]);
  }
  for (const setting of defaultSettings) {
    await sql.query(`INSERT INTO site_settings (key, value) VALUES ($1, $2)
      ON CONFLICT (key) DO NOTHING`, [...setting]);
  }
  for (const [index, item] of mallItems.entries()) {
    await sql.query(`INSERT INTO mall_items
      (slug, name, category, race, amount, price_points, description, icon, active, featured, sort_order)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,TRUE,$9,$10)
      ON CONFLICT (slug) DO NOTHING`, [item.id, item.name, item.category, item.race, item.amount, item.points, item.description, item.icon, index < 3, index]);
  }
}

async function ensurePostgres() {
  if (!postgresReady) {
    postgresReady = initializePostgres().catch((error) => {
      postgresReady = null;
      throw error;
    });
  }
  await postgresReady;
}

function getSqlite() {
  if (sqlite) return sqlite;
  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  sqlite = new Database(path.join(dataDir, "warborn.db"));
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(`CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id TEXT NOT NULL UNIQUE COLLATE NOCASE,
    nickname TEXT NOT NULL UNIQUE COLLATE NOCASE,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT,
    auth_source TEXT NOT NULL DEFAULT 'local',
    game_account_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'active',
    role TEXT NOT NULL DEFAULT 'player',
    locale TEXT NOT NULL DEFAULT 'en-US',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TEXT
  );
  CREATE TABLE IF NOT EXISTS news_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL CHECK (kind IN ('news', 'update')),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    body TEXT NOT NULL,
    author_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    published INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS forum_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS forum_topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL REFERENCES forum_categories(id) ON DELETE RESTRICT,
    author_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    locked INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS forum_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS mall_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    race TEXT NOT NULL,
    amount INTEGER NOT NULL DEFAULT 1 CHECK (amount > 0),
    price_points INTEGER NOT NULL CHECK (price_points >= 0),
    description TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'chest',
    active INTEGER NOT NULL DEFAULT 1,
    featured INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS account_points (
    account_id INTEGER PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS point_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    reason TEXT NOT NULL,
    admin_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_news_kind_created ON news_posts(kind, published, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_forum_topics_category ON forum_topics(category_id, updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_forum_replies_topic ON forum_replies(topic_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_mall_items_active ON mall_items(active, category, sort_order);
  CREATE INDEX IF NOT EXISTS idx_point_transactions_account ON point_transactions(account_id, created_at DESC);`);

  const accountColumns = sqlite.prepare("PRAGMA table_info(accounts)").all() as { name: string; notnull: number }[];
  if (!accountColumns.some((column) => column.name === "locale")) sqlite.exec("ALTER TABLE accounts ADD COLUMN locale TEXT NOT NULL DEFAULT 'en-US'");
  if (!accountColumns.some((column) => column.name === "auth_source")) sqlite.exec("ALTER TABLE accounts ADD COLUMN auth_source TEXT NOT NULL DEFAULT 'local'");
  if (!accountColumns.some((column) => column.name === "game_account_id")) sqlite.exec("ALTER TABLE accounts ADD COLUMN game_account_id TEXT");
  sqlite.exec("CREATE UNIQUE INDEX IF NOT EXISTS accounts_game_account_id_idx ON accounts(game_account_id) WHERE game_account_id IS NOT NULL");

  const insertCategory = sqlite.prepare("INSERT OR IGNORE INTO forum_categories (slug, name, description, sort_order) VALUES (?, ?, ?, ?)");
  const insertSetting = sqlite.prepare("INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)");
  const insertMallItem = sqlite.prepare(`INSERT OR IGNORE INTO mall_items
    (slug, name, category, race, amount, price_points, description, icon, active, featured, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`);
  const seed = sqlite.transaction(() => {
    categories.forEach((category) => insertCategory.run(...category));
    defaultSettings.forEach((setting) => insertSetting.run(...setting));
    mallItems.forEach((item, index) => insertMallItem.run(item.id, item.name, item.category, item.race, item.amount, item.points, item.description, item.icon, index < 3 ? 1 : 0, index));
  });
  seed();
  return sqlite;
}

export async function queryRows<T extends Row>(text: string, params: SqlValue[] = []): Promise<T[]> {
  const mode = getDatabaseMode();
  if (mode === "unconfigured") return [];
  if (mode === "sqlite") return getSqlite().prepare(sqliteSql(text)).all(...sqliteParams(params)) as T[];
  await ensurePostgres();
  return await getPostgres().query(text, params) as T[];
}

export async function execute(text: string, params: SqlValue[] = []) {
  const mode = getDatabaseMode();
  if (mode === "unconfigured") throw new DatabaseUnavailableError();
  if (mode === "sqlite") {
    const result = getSqlite().prepare(sqliteSql(text)).run(...sqliteParams(params));
    return { rowCount: result.changes, lastInsertId: Number(result.lastInsertRowid) };
  }
  await ensurePostgres();
  const rows = await getPostgres().query(`${text} RETURNING id`, params) as { id: string | number }[];
  return { rowCount: rows.length, lastInsertId: rows[0] ? Number(rows[0].id) : 0 };
}

export async function executeStatement(text: string, params: SqlValue[] = []) {
  const mode = getDatabaseMode();
  if (mode === "unconfigured") throw new DatabaseUnavailableError();
  if (mode === "sqlite") {
    const result = getSqlite().prepare(sqliteSql(text)).run(...sqliteParams(params));
    return result.changes;
  }
  await ensurePostgres();
  const result = await getPostgres().query(text, params);
  return result.length;
}

export async function adjustPointsAtomic(accountId: number, amount: number, reason: string, adminId: number) {
  const mode = getDatabaseMode();
  if (mode === "unconfigured") throw new DatabaseUnavailableError();
  if (mode === "sqlite") {
    const database = getSqlite();
    return database.transaction(() => {
      const current = database.prepare("SELECT balance FROM account_points WHERE account_id = ?").get(accountId) as { balance: number } | undefined;
      const nextBalance = Number(current?.balance ?? 0) + amount;
      if (nextBalance < 0) throw new Error("Insufficient point balance.");
      database.prepare(`INSERT INTO account_points (account_id, balance, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(account_id) DO UPDATE SET balance = excluded.balance, updated_at = CURRENT_TIMESTAMP`).run(accountId, nextBalance);
      database.prepare(`INSERT INTO point_transactions (account_id, amount, balance_after, reason, admin_id)
        VALUES (?, ?, ?, ?, ?)`).run(accountId, amount, nextBalance, reason, adminId);
      return nextBalance;
    })();
  }
  await ensurePostgres();
  const rows = await getPostgres().query(`WITH updated AS (
      INSERT INTO account_points (account_id, balance, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (account_id) DO UPDATE SET balance = account_points.balance + $2, updated_at = CURRENT_TIMESTAMP
      WHERE account_points.balance + $2 >= 0 RETURNING balance
    ), logged AS (
      INSERT INTO point_transactions (account_id, amount, balance_after, reason, admin_id)
      SELECT $1, $2, balance, $3, $4 FROM updated RETURNING id
    ) SELECT balance FROM updated`, [accountId, amount, reason, adminId]) as { balance: number }[];
  if (!rows[0]) throw new Error("Insufficient point balance.");
  return Number(rows[0].balance);
}
