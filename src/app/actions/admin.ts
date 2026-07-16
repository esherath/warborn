"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adjustPointsAtomic, execute, executeStatement, isWebDatabaseConfigured, queryRows } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const postSchema = z.object({
  id: z.coerce.number().int().positive().optional(), kind: z.enum(["news", "update"]),
  title: z.string().trim().min(4).max(120), summary: z.string().trim().min(10).max(320),
  body: z.string().trim().min(20).max(20_000), published: z.string().optional(),
});
const itemSchema = z.object({
  id: z.coerce.number().int().positive().optional(), slug: z.string().trim().min(3).max(80).regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(3).max(120), category: z.enum(["premium", "potion", "supply", "skillbook", "abilitybook", "function", "equipment", "limited"]),
  race: z.enum(["All Race", "Human Race", "Ak'kan Race"]), amount: z.coerce.number().int().min(1).max(9999),
  pricePoints: z.coerce.number().int().min(0).max(10_000_000), description: z.string().trim().min(10).max(1000),
  icon: z.enum(["chest", "potion", "orb", "shield", "scroll", "mount", "book", "weapon"]),
  active: z.string().optional(), featured: z.string().optional(), sortOrder: z.coerce.number().int().min(0).max(9999),
});

function adminUrl(section: string, kind: "error" | "success", message: string) { return `/admin/${section}?${kind}=${encodeURIComponent(message)}`; }
async function requireAdmin(section: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect(adminUrl(section, "error", "Administrator access required."));
  if (!isWebDatabaseConfigured()) redirect(adminUrl(section, "error", "Website storage is not configured."));
  return user;
}

export async function saveAdminPost(formData: FormData) {
  await requireAdmin("news");
  const parsed = postSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(adminUrl("news", "error", "Check all publication fields."));
  const published = parsed.data.published === "on";
  if (parsed.data.id) await executeStatement(`UPDATE news_posts SET kind=$1,title=$2,summary=$3,body=$4,published=$5,updated_at=CURRENT_TIMESTAMP WHERE id=$6`, [parsed.data.kind, parsed.data.title, parsed.data.summary, parsed.data.body, published, parsed.data.id]);
  else {
    const user = await requireAdmin("news");
    await execute(`INSERT INTO news_posts (kind,title,summary,body,author_id,published) VALUES ($1,$2,$3,$4,$5,$6)`, [parsed.data.kind, parsed.data.title, parsed.data.summary, parsed.data.body, user.id, published]);
  }
  revalidatePath("/"); revalidatePath("/news"); revalidatePath("/admin/news");
  redirect(adminUrl("news", "success", parsed.data.id ? "Publication updated." : "Publication created."));
}

export async function deleteAdminPost(formData: FormData) {
  await requireAdmin("news");
  const id = z.coerce.number().int().positive().safeParse(formData.get("id"));
  if (!id.success) redirect(adminUrl("news", "error", "Invalid publication."));
  await executeStatement("DELETE FROM news_posts WHERE id=$1", [id.data]);
  revalidatePath("/"); revalidatePath("/news");
  redirect(adminUrl("news", "success", "Publication deleted."));
}

export async function moderateForumTopic(formData: FormData) {
  await requireAdmin("forum");
  const parsed = z.object({ id: z.coerce.number().int().positive(), intent: z.enum(["lock", "unlock", "delete"]) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(adminUrl("forum", "error", "Invalid moderation request."));
  if (parsed.data.intent === "delete") await executeStatement("DELETE FROM forum_topics WHERE id=$1", [parsed.data.id]);
  else await executeStatement("UPDATE forum_topics SET locked=$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2", [parsed.data.intent === "lock", parsed.data.id]);
  revalidatePath("/forum"); revalidatePath(`/forum/${parsed.data.id}`);
  redirect(adminUrl("forum", "success", parsed.data.intent === "delete" ? "Topic deleted." : `Topic ${parsed.data.intent}ed.`));
}

export async function adjustPlayerPoints(formData: FormData) {
  const admin = await requireAdmin("players");
  const parsed = z.object({ accountId: z.coerce.number().int().positive(), amount: z.coerce.number().int().min(-10_000_000).max(10_000_000).refine((value) => value !== 0), reason: z.string().trim().min(3).max(240) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(adminUrl("players", "error", "Choose a player, a non-zero amount and a reason."));
  const account = await queryRows<{ id: number }>("SELECT id FROM accounts WHERE id=$1", [parsed.data.accountId]);
  if (!account[0]) redirect(adminUrl("players", "error", "Player not found."));
  try { await adjustPointsAtomic(parsed.data.accountId, parsed.data.amount, parsed.data.reason, admin.id); }
  catch { redirect(adminUrl("players", "error", "The adjustment would create an invalid balance.")); }
  revalidatePath("/admin/players"); revalidatePath("/item-mall/items");
  redirect(adminUrl("players", "success", "Point balance updated."));
}

export async function saveMallItem(formData: FormData) {
  await requireAdmin("items");
  const parsed = itemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(adminUrl("items", "error", "Check the item name, slug, category, amount and point price."));
  const item = parsed.data;
  const active = item.active === "on"; const featured = item.featured === "on";
  try {
    if (item.id) await executeStatement(`UPDATE mall_items SET slug=$1,name=$2,category=$3,race=$4,amount=$5,price_points=$6,description=$7,icon=$8,active=$9,featured=$10,sort_order=$11,updated_at=CURRENT_TIMESTAMP WHERE id=$12`, [item.slug, item.name, item.category, item.race, item.amount, item.pricePoints, item.description, item.icon, active, featured, item.sortOrder, item.id]);
    else await execute(`INSERT INTO mall_items (slug,name,category,race,amount,price_points,description,icon,active,featured,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, [item.slug, item.name, item.category, item.race, item.amount, item.pricePoints, item.description, item.icon, active, featured, item.sortOrder]);
  } catch { redirect(adminUrl("items", "error", "The item slug is already in use.")); }
  revalidatePath("/item-mall/items"); revalidatePath("/admin/items");
  redirect(adminUrl("items", "success", item.id ? "Item updated." : "Item created."));
}

export async function saveSiteSettings(formData: FormData) {
  await requireAdmin("settings");
  const parsed = z.object({ serverName: z.string().trim().min(2).max(40), serverStatus: z.enum(["ONLINE", "MAINTENANCE", "OFFLINE"]), maintenanceSchedule: z.string().trim().min(3).max(120), mallAnnouncement: z.string().trim().min(3).max(240), itemMallEnabled: z.string().optional() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(adminUrl("settings", "error", "Check the general settings."));
  const settings = [["server_name", parsed.data.serverName], ["server_status", parsed.data.serverStatus], ["maintenance_schedule", parsed.data.maintenanceSchedule], ["mall_announcement", parsed.data.mallAnnouncement], ["item_mall_enabled", parsed.data.itemMallEnabled === "on" ? "true" : "false"]];
  for (const [key, value] of settings) await executeStatement(`INSERT INTO site_settings (key,value,updated_at) VALUES ($1,$2,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=$2,updated_at=CURRENT_TIMESTAMP`, [key, value]);
  revalidatePath("/"); revalidatePath("/item-mall/items"); revalidatePath("/admin/settings");
  redirect(adminUrl("settings", "success", "General settings saved."));
}
