import "server-only";
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

let db: Database.Database | null = null;

export function getDb() {
  if (db) return db;
  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  db = new Database(path.join(dataDir, "warborn.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id TEXT NOT NULL UNIQUE COLLATE NOCASE,
    nickname TEXT NOT NULL UNIQUE COLLATE NOCASE,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
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

  CREATE INDEX IF NOT EXISTS idx_news_kind_created ON news_posts(kind, published, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_forum_topics_category ON forum_topics(category_id, updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_forum_replies_topic ON forum_replies(topic_id, created_at);
  `);
  const columns = db.prepare("PRAGMA table_info(accounts)").all() as { name: string }[];
  if (!columns.some((column) => column.name === "locale")) db.exec("ALTER TABLE accounts ADD COLUMN locale TEXT NOT NULL DEFAULT 'en-US'");
  const insertCategory = db.prepare("INSERT OR IGNORE INTO forum_categories (slug, name, description, sort_order) VALUES (?, ?, ?, ?)");
  const categories = [
    ["general", "General Discussion", "Talk about Warborn, guilds, events and the community.", 1],
    ["trade", "Trade", "Buy, sell and exchange items with other players.", 2],
    ["tips", "Tip and Tech", "Guides, builds, strategies and technical help.", 3],
    ["bugs", "Bug Reports", "Report game and website issues with useful details.", 4],
  ] as const;
  const seedCategories = db.transaction(() => categories.forEach((category) => insertCategory.run(...category)));
  seedCategories();
  return db;
}
