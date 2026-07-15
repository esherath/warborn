import "server-only";
import { queryRows } from "@/lib/db";

export type NewsKind = "news" | "update";

export type NewsPost = {
  id: number;
  kind: NewsKind;
  title: string;
  summary: string;
  body: string;
  author_name: string;
  created_at: string;
  updated_at: string;
};

export type ForumCategory = {
  id: number;
  slug: string;
  name: string;
  description: string;
  topic_count: number;
  reply_count: number;
};

export type ForumTopic = {
  id: number;
  category_id: number;
  category_slug: string;
  category_name: string;
  title: string;
  body: string;
  author_id: number;
  author_name: string;
  reply_count: number;
  locked: number;
  created_at: string;
  updated_at: string;
};

export type ForumReply = {
  id: number;
  body: string;
  author_id: number;
  author_name: string;
  author_role: string;
  created_at: string;
  updated_at: string;
};

export async function getPublishedPosts(kind?: NewsKind, limit = 20): Promise<NewsPost[]> {
  const safeLimit = Math.max(1, Math.min(limit, 100));
  if (kind) {
    const rows = await queryRows<NewsPost>(`SELECT p.*, a.nickname AS author_name
      FROM news_posts p JOIN accounts a ON a.id = p.author_id
      WHERE p.published = TRUE AND p.kind = $1
      ORDER BY p.created_at DESC, p.id DESC LIMIT $2`, [kind, safeLimit]);
    return rows.map(normalizePost);
  }
  const rows = await queryRows<NewsPost>(`SELECT p.*, a.nickname AS author_name
    FROM news_posts p JOIN accounts a ON a.id = p.author_id
    WHERE p.published = TRUE
    ORDER BY p.created_at DESC, p.id DESC LIMIT $1`, [safeLimit]);
  return rows.map(normalizePost);
}

export async function getNewsPost(id: number): Promise<NewsPost | null> {
  const rows = await queryRows<NewsPost>(`SELECT p.*, a.nickname AS author_name
    FROM news_posts p JOIN accounts a ON a.id = p.author_id
    WHERE p.id = $1 AND p.published = TRUE`, [id]);
  return rows[0] ? normalizePost(rows[0]) : null;
}

export async function getForumCategories(): Promise<ForumCategory[]> {
  const rows = await queryRows<ForumCategory>(`SELECT c.id, c.slug, c.name, c.description,
      COUNT(DISTINCT t.id) AS topic_count, COUNT(r.id) AS reply_count
    FROM forum_categories c
    LEFT JOIN forum_topics t ON t.category_id = c.id
    LEFT JOIN forum_replies r ON r.topic_id = t.id
    GROUP BY c.id, c.slug, c.name, c.description, c.sort_order ORDER BY c.sort_order, c.name`);
  return rows.map((row) => ({ ...row, id: Number(row.id), topic_count: Number(row.topic_count), reply_count: Number(row.reply_count) }));
}

export async function getForumTopics(categorySlug?: string, limit = 50): Promise<ForumTopic[]> {
  const safeLimit = Math.max(1, Math.min(limit, 100));
  const categoryFilter = categorySlug ? "WHERE c.slug = $1" : "";
  const values = categorySlug ? [categorySlug, safeLimit] : [safeLimit];
  const limitPlaceholder = categorySlug ? "$2" : "$1";
  const rows = await queryRows<ForumTopic>(`SELECT t.id, t.category_id, c.slug AS category_slug, c.name AS category_name,
      t.title, t.body, t.author_id, a.nickname AS author_name, t.locked, t.created_at, t.updated_at,
      COUNT(r.id) AS reply_count
    FROM forum_topics t
    JOIN forum_categories c ON c.id = t.category_id
    JOIN accounts a ON a.id = t.author_id
    LEFT JOIN forum_replies r ON r.topic_id = t.id
    ${categoryFilter}
    GROUP BY t.id, t.category_id, c.slug, c.name, t.title, t.body, t.author_id, a.nickname, t.locked, t.created_at, t.updated_at
    ORDER BY t.updated_at DESC, t.id DESC LIMIT ${limitPlaceholder}`, values);
  return rows.map(normalizeTopic);
}

export async function getForumTopic(id: number): Promise<ForumTopic | null> {
  const rows = await queryRows<ForumTopic>(`SELECT t.id, t.category_id, c.slug AS category_slug, c.name AS category_name,
      t.title, t.body, t.author_id, a.nickname AS author_name, t.locked, t.created_at, t.updated_at,
      COUNT(r.id) AS reply_count
    FROM forum_topics t
    JOIN forum_categories c ON c.id = t.category_id
    JOIN accounts a ON a.id = t.author_id
    LEFT JOIN forum_replies r ON r.topic_id = t.id
    WHERE t.id = $1
    GROUP BY t.id, t.category_id, c.slug, c.name, t.title, t.body, t.author_id, a.nickname, t.locked, t.created_at, t.updated_at`, [id]);
  return rows[0] ? normalizeTopic(rows[0]) : null;
}

export async function getForumReplies(topicId: number): Promise<ForumReply[]> {
  const rows = await queryRows<ForumReply>(`SELECT r.id, r.body, r.author_id, a.nickname AS author_name,
      a.role AS author_role, r.created_at, r.updated_at
    FROM forum_replies r JOIN accounts a ON a.id = r.author_id
    WHERE r.topic_id = $1 ORDER BY r.created_at, r.id`, [topicId]);
  return rows.map((row) => ({ ...row, id: Number(row.id), author_id: Number(row.author_id), created_at: normalizeTimestamp(row.created_at), updated_at: normalizeTimestamp(row.updated_at) }));
}

function normalizeTimestamp(value: string) {
  const text = String(value);
  const normalized = text.includes("T") ? text : text.replace(" ", "T");
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized);
  const date = new Date(hasZone ? normalized : `${normalized}Z`);
  return Number.isNaN(date.getTime()) ? text : date.toISOString();
}

function normalizePost(row: NewsPost): NewsPost {
  return { ...row, id: Number(row.id), created_at: normalizeTimestamp(row.created_at), updated_at: normalizeTimestamp(row.updated_at) };
}

function normalizeTopic(row: ForumTopic): ForumTopic {
  return {
    ...row,
    id: Number(row.id),
    category_id: Number(row.category_id),
    author_id: Number(row.author_id),
    reply_count: Number(row.reply_count),
    locked: Number(row.locked),
    created_at: normalizeTimestamp(row.created_at),
    updated_at: normalizeTimestamp(row.updated_at),
  };
}
