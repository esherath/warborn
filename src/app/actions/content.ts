"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const postSchema = z.object({
  kind: z.enum(["news", "update"]),
  title: z.string().trim().min(4).max(120),
  summary: z.string().trim().min(10).max(320),
  body: z.string().trim().min(20).max(20_000),
});

const topicSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  title: z.string().trim().min(4).max(120),
  body: z.string().trim().min(10).max(10_000),
});

const replySchema = z.object({
  topicId: z.coerce.number().int().positive(),
  body: z.string().trim().min(2).max(10_000),
});

function messageUrl(path: string, kind: "error" | "success", message: string) {
  return `${path}?${kind}=${encodeURIComponent(message)}`;
}

export async function publishPost(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect(messageUrl("/admin/content", "error", "Administrator access required."));
  const parsed = postSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(messageUrl("/admin/content", "error", "Check the title, summary and article content."));
  getDb().prepare(`INSERT INTO news_posts (kind, title, summary, body, author_id)
    VALUES (?, ?, ?, ?, ?)`).run(parsed.data.kind, parsed.data.title, parsed.data.summary, parsed.data.body, user.id);
  revalidatePath("/");
  revalidatePath("/news");
  redirect(messageUrl("/admin/content", "success", parsed.data.kind === "news" ? "News published." : "Update published."));
}

export async function createForumTopic(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect(messageUrl("/forum", "error", "Sign in before creating a topic."));
  const parsed = topicSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(messageUrl("/forum", "error", "Check the category, title and message."));
  const db = getDb();
  const category = db.prepare("SELECT id FROM forum_categories WHERE id = ?").get(parsed.data.categoryId);
  if (!category) redirect(messageUrl("/forum", "error", "Invalid forum category."));
  const result = db.prepare(`INSERT INTO forum_topics (category_id, author_id, title, body)
    VALUES (?, ?, ?, ?)`).run(parsed.data.categoryId, user.id, parsed.data.title, parsed.data.body);
  revalidatePath("/forum");
  redirect(`/forum/${Number(result.lastInsertRowid)}`);
}

export async function createForumReply(formData: FormData) {
  const parsed = replySchema.safeParse(Object.fromEntries(formData));
  const fallbackId = Number(formData.get("topicId"));
  const fallbackPath = Number.isInteger(fallbackId) ? `/forum/${fallbackId}` : "/forum";
  const user = await getCurrentUser();
  if (!user) redirect(messageUrl(fallbackPath, "error", "Sign in before replying."));
  if (!parsed.success) redirect(messageUrl(fallbackPath, "error", "Write a valid reply."));
  const db = getDb();
  const topic = db.prepare("SELECT id, locked FROM forum_topics WHERE id = ?").get(parsed.data.topicId) as { id: number; locked: number } | undefined;
  if (!topic) redirect("/forum");
  if (topic.locked) redirect(messageUrl(fallbackPath, "error", "This topic is locked."));
  const addReply = db.transaction(() => {
    db.prepare("INSERT INTO forum_replies (topic_id, author_id, body) VALUES (?, ?, ?)").run(parsed.data.topicId, user.id, parsed.data.body);
    db.prepare("UPDATE forum_topics SET updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(parsed.data.topicId);
  });
  addReply();
  revalidatePath("/forum");
  revalidatePath(fallbackPath);
  redirect(`${fallbackPath}#replies`);
}
