import "server-only";
import { getDb } from "@/lib/db";

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

export function getPublishedPosts(kind?: NewsKind, limit = 20): NewsPost[] {
  const db = getDb();
  const safeLimit = Math.max(1, Math.min(limit, 100));
  if (kind) {
    return db.prepare(`SELECT p.*, a.nickname AS author_name
      FROM news_posts p JOIN accounts a ON a.id = p.author_id
      WHERE p.published = 1 AND p.kind = ?
      ORDER BY p.created_at DESC, p.id DESC LIMIT ?`).all(kind, safeLimit) as NewsPost[];
  }
  return db.prepare(`SELECT p.*, a.nickname AS author_name
    FROM news_posts p JOIN accounts a ON a.id = p.author_id
    WHERE p.published = 1
    ORDER BY p.created_at DESC, p.id DESC LIMIT ?`).all(safeLimit) as NewsPost[];
}

export function getNewsPost(id: number): NewsPost | null {
  return getDb().prepare(`SELECT p.*, a.nickname AS author_name
    FROM news_posts p JOIN accounts a ON a.id = p.author_id
    WHERE p.id = ? AND p.published = 1`).get(id) as NewsPost | undefined ?? null;
}

export function getForumCategories(): ForumCategory[] {
  return getDb().prepare(`SELECT c.id, c.slug, c.name, c.description,
      COUNT(DISTINCT t.id) AS topic_count, COUNT(r.id) AS reply_count
    FROM forum_categories c
    LEFT JOIN forum_topics t ON t.category_id = c.id
    LEFT JOIN forum_replies r ON r.topic_id = t.id
    GROUP BY c.id ORDER BY c.sort_order, c.name`).all() as ForumCategory[];
}

export function getForumTopics(categorySlug?: string, limit = 50): ForumTopic[] {
  const safeLimit = Math.max(1, Math.min(limit, 100));
  const categoryFilter = categorySlug ? "WHERE c.slug = ?" : "";
  const values = categorySlug ? [categorySlug, safeLimit] : [safeLimit];
  return getDb().prepare(`SELECT t.id, t.category_id, c.slug AS category_slug, c.name AS category_name,
      t.title, t.body, t.author_id, a.nickname AS author_name, t.locked, t.created_at, t.updated_at,
      COUNT(r.id) AS reply_count
    FROM forum_topics t
    JOIN forum_categories c ON c.id = t.category_id
    JOIN accounts a ON a.id = t.author_id
    LEFT JOIN forum_replies r ON r.topic_id = t.id
    ${categoryFilter}
    GROUP BY t.id ORDER BY t.updated_at DESC, t.id DESC LIMIT ?`).all(...values) as ForumTopic[];
}

export function getForumTopic(id: number): ForumTopic | null {
  return getDb().prepare(`SELECT t.id, t.category_id, c.slug AS category_slug, c.name AS category_name,
      t.title, t.body, t.author_id, a.nickname AS author_name, t.locked, t.created_at, t.updated_at,
      COUNT(r.id) AS reply_count
    FROM forum_topics t
    JOIN forum_categories c ON c.id = t.category_id
    JOIN accounts a ON a.id = t.author_id
    LEFT JOIN forum_replies r ON r.topic_id = t.id
    WHERE t.id = ? GROUP BY t.id`).get(id) as ForumTopic | undefined ?? null;
}

export function getForumReplies(topicId: number): ForumReply[] {
  return getDb().prepare(`SELECT r.id, r.body, r.author_id, a.nickname AS author_name,
      a.role AS author_role, r.created_at, r.updated_at
    FROM forum_replies r JOIN accounts a ON a.id = r.author_id
    WHERE r.topic_id = ? ORDER BY r.created_at, r.id`).all(topicId) as ForumReply[];
}
