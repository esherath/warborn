import "server-only";

import { queryRows } from "@/lib/db";
import type { ItemCategory, MallItem } from "@/lib/item-mall";

export type AdminPost = {
  id: number; kind: "news" | "update"; title: string; summary: string; body: string;
  published: boolean; author_name: string; created_at: string; updated_at: string;
};
export type AdminTopic = {
  id: number; title: string; category_name: string; author_name: string;
  reply_count: number; locked: boolean; updated_at: string;
};
export type AdminAccount = {
  id: number; account_id: string; nickname: string; email: string; role: string;
  status: string; balance: number; created_at: string;
};
export type ManagedMallItem = MallItem & {
  databaseId: number; active: boolean; featured: boolean; sortOrder: number;
};
export type PointTransaction = {
  id: number; account_id: string; nickname: string; amount: number;
  balance_after: number; reason: string; admin_name: string; created_at: string;
};

export async function getAdminStats() {
  const rows = await queryRows<Record<string, number | string>>(`SELECT
    (SELECT COUNT(*) FROM accounts) AS players,
    (SELECT COUNT(*) FROM news_posts) AS posts,
    (SELECT COUNT(*) FROM forum_topics) AS topics,
    (SELECT COUNT(*) FROM mall_items WHERE active = TRUE) AS active_items,
    (SELECT COALESCE(SUM(balance), 0) FROM account_points) AS points`);
  const row = rows[0] ?? {};
  return { players: Number(row.players ?? 0), posts: Number(row.posts ?? 0), topics: Number(row.topics ?? 0), activeItems: Number(row.active_items ?? 0), points: Number(row.points ?? 0) };
}

export async function getAdminPosts(): Promise<AdminPost[]> {
  const rows = await queryRows<Omit<AdminPost, "published"> & { published: boolean | number }>(`SELECT p.*, a.nickname AS author_name
    FROM news_posts p JOIN accounts a ON a.id = p.author_id ORDER BY p.created_at DESC, p.id DESC`);
  return rows.map((row) => ({ ...row, id: Number(row.id), published: Boolean(row.published) }));
}

export async function getAdminTopics(): Promise<AdminTopic[]> {
  const rows = await queryRows<Omit<AdminTopic, "locked"> & { locked: boolean | number }>(`SELECT t.id, t.title, c.name AS category_name,
    a.nickname AS author_name, t.locked, t.updated_at, COUNT(r.id) AS reply_count
    FROM forum_topics t JOIN forum_categories c ON c.id = t.category_id JOIN accounts a ON a.id = t.author_id
    LEFT JOIN forum_replies r ON r.topic_id = t.id
    GROUP BY t.id, t.title, c.name, a.nickname, t.locked, t.updated_at ORDER BY t.updated_at DESC, t.id DESC`);
  return rows.map((row) => ({ ...row, id: Number(row.id), reply_count: Number(row.reply_count), locked: Boolean(row.locked) }));
}

export async function getAdminAccounts(): Promise<AdminAccount[]> {
  const rows = await queryRows<AdminAccount>(`SELECT a.id, a.account_id, a.nickname, a.email, a.role, a.status, a.created_at,
    COALESCE(p.balance, 0) AS balance FROM accounts a LEFT JOIN account_points p ON p.account_id = a.id
    ORDER BY a.created_at DESC, a.id DESC`);
  return rows.map((row) => ({ ...row, id: Number(row.id), balance: Number(row.balance) }));
}

export async function getManagedMallItems({ activeOnly = false }: { activeOnly?: boolean } = {}): Promise<ManagedMallItem[]> {
  const where = activeOnly ? "WHERE active = TRUE" : "";
  const rows = await queryRows<{ id: number; slug: string; name: string; category: ItemCategory; race: MallItem["race"]; amount: number; price_points: number; description: string; icon: MallItem["icon"]; active: boolean | number; featured: boolean | number; sort_order: number }>(`SELECT id, slug, name, category, race, amount, price_points, description, icon, active, featured, sort_order
    FROM mall_items ${where} ORDER BY category, sort_order, name`);
  return rows.map((row) => ({ databaseId: Number(row.id), id: row.slug, name: row.name, category: row.category, race: row.race, amount: Number(row.amount), points: Number(row.price_points), description: row.description, icon: row.icon, active: Boolean(row.active), featured: Boolean(row.featured), sortOrder: Number(row.sort_order) }));
}

export async function getPointTransactions(): Promise<PointTransaction[]> {
  const rows = await queryRows<PointTransaction>(`SELECT t.id, a.account_id, a.nickname, t.amount, t.balance_after, t.reason,
    admin.nickname AS admin_name, t.created_at FROM point_transactions t
    JOIN accounts a ON a.id = t.account_id JOIN accounts admin ON admin.id = t.admin_id
    ORDER BY t.created_at DESC, t.id DESC LIMIT 50`);
  return rows.map((row) => ({ ...row, id: Number(row.id), amount: Number(row.amount), balance_after: Number(row.balance_after) }));
}

export async function getSiteSettings() {
  const rows = await queryRows<{ key: string; value: string }>("SELECT key, value FROM site_settings ORDER BY key");
  return Object.fromEntries(rows.map((row) => [row.key, row.value])) as Record<string, string>;
}

export async function getAccountPointBalance(accountId: number) {
  const rows = await queryRows<{ balance: number }>("SELECT balance FROM account_points WHERE account_id = $1", [accountId]);
  return Number(rows[0]?.balance ?? 0);
}
