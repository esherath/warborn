"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { execute, executeStatement, isWebDatabaseConfigured, queryRows } from "@/lib/db";
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
  if (!isWebDatabaseConfigured()) redirect(messageUrl("/admin/content", "error", "Website storage is not configured."));
  const parsed = postSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(messageUrl("/admin/content", "error", "Check the title, summary and article content."));
  await execute(`INSERT INTO news_posts (kind, title, summary, body, author_id)
    VALUES ($1, $2, $3, $4, $5)`, [parsed.data.kind, parsed.data.title, parsed.data.summary, parsed.data.body, user.id]);
  revalidatePath("/");
  revalidatePath("/news");
  redirect(messageUrl("/admin/content", "success", parsed.data.kind === "news" ? "News published." : "Update published."));
}

export async function createForumTopic(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect(messageUrl("/forum", "error", "Sign in before creating a topic."));
  if (!isWebDatabaseConfigured()) redirect(messageUrl("/forum", "error", "Forum storage is not configured."));
  const parsed = topicSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(messageUrl("/forum", "error", "Check the category, title and message."));
  const categories = await queryRows<{ id: number }>("SELECT id FROM forum_categories WHERE id = $1", [parsed.data.categoryId]);
  if (!categories[0]) redirect(messageUrl("/forum", "error", "Invalid forum category."));
  const result = await execute(`INSERT INTO forum_topics (category_id, author_id, title, body)
    VALUES ($1, $2, $3, $4)`, [parsed.data.categoryId, user.id, parsed.data.title, parsed.data.body]);
  revalidatePath("/forum");
  redirect(`/forum/${result.lastInsertId}`);
}

export async function createForumReply(formData: FormData) {
  const parsed = replySchema.safeParse(Object.fromEntries(formData));
  const fallbackId = Number(formData.get("topicId"));
  const fallbackPath = Number.isInteger(fallbackId) ? `/forum/${fallbackId}` : "/forum";
  const user = await getCurrentUser();
  if (!user) redirect(messageUrl(fallbackPath, "error", "Sign in before replying."));
  if (!isWebDatabaseConfigured()) redirect(messageUrl(fallbackPath, "error", "Forum storage is not configured."));
  if (!parsed.success) redirect(messageUrl(fallbackPath, "error", "Write a valid reply."));
  const topics = await queryRows<{ id: number; locked: number | boolean }>("SELECT id, locked FROM forum_topics WHERE id = $1", [parsed.data.topicId]);
  const topic = topics[0];
  if (!topic) redirect("/forum");
  if (topic.locked) redirect(messageUrl(fallbackPath, "error", "This topic is locked."));
  await execute("INSERT INTO forum_replies (topic_id, author_id, body) VALUES ($1, $2, $3)", [parsed.data.topicId, user.id, parsed.data.body]);
  await executeStatement("UPDATE forum_topics SET updated_at = CURRENT_TIMESTAMP WHERE id = $1", [parsed.data.topicId]);
  revalidatePath("/forum");
  revalidatePath(fallbackPath);
  redirect(`${fallbackPath}#replies`);
}
