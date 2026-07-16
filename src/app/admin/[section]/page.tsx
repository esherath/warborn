import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Boxes, Coins, FileText, LockKeyhole, MessageSquare, Settings, ShieldCheck, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { adjustPlayerPoints, deleteAdminPost, moderateForumTopic, saveAdminPost, saveMallItem, saveSiteSettings } from "@/app/actions/admin";
import { InteriorLayout } from "@/components/interior-layout";
import { getAdminAccounts, getAdminPosts, getAdminStats, getAdminTopics, getManagedMallItems, getPointTransactions, getSiteSettings } from "@/lib/admin-data";
import { getLocale, getMessages } from "@/lib/i18n";
import { itemCategories } from "@/lib/item-mall";
import { adminSectionItems } from "@/lib/section-navigation";
import { getCurrentUser } from "@/lib/session";

type Params = Promise<{ section: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const sections = ["dashboard", "news", "forum", "players", "items", "settings"];
export const metadata: Metadata = { title: "Administration — Warborn", description: "Warborn website administration panel." };
export function generateStaticParams() { return sections.map((section) => ({ section })); }

export default async function AdminSectionPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  const user = await getCurrentUser();
  const locale = await getLocale(user?.locale);
  const messages = getMessages(locale);
  const query = await searchParams;
  const error = typeof query.error === "string" ? query.error : undefined;
  const success = typeof query.success === "string" ? query.success : undefined;
  const isAdmin = user?.role === "admin";
  const title = { dashboard: "CONTROL CENTER", news: "NEWS & UPDATES", forum: "FORUM MODERATION", players: "PLAYERS & POINTS", items: "ITEM MALL CATALOG", settings: "GENERAL SETTINGS" }[section] ?? "ADMINISTRATION";

  const [stats, posts, topics, accounts, items, transactions, rawSettings] = isAdmin ? await Promise.all([
    section === "dashboard" ? getAdminStats() : null,
    section === "news" ? getAdminPosts() : [],
    section === "forum" ? getAdminTopics() : [],
    section === "players" ? getAdminAccounts() : [],
    section === "items" ? getManagedMallItems() : [],
    section === "players" ? getPointTransactions() : [],
    section === "settings" || section === "dashboard" ? getSiteSettings() : {},
  ]) : [null, [], [], [], [], [], {}];
  const settings = rawSettings as Record<string, string>;

  return <InteriorLayout locale={locale} messages={messages} user={user} sectionTitle="Administration" sectionItems={adminSectionItems} activeHref={`/admin/${section}`} pageTitle={title}>
    {!isAdmin ? <section className="access-denied"><LockKeyhole /><h2>Administrator access required</h2><p>Sign in with an administrator account to manage Warborn.</p><Link href="/">Return to homepage</Link></section> : <div className="admin-console">
      <header className="admin-console-head"><ShieldCheck /><div><span>WARBORN ADMINISTRATION</span><strong>{user.nickname}</strong><small>Every operation is validated on the server and recorded in website storage.</small></div></header>
      {error && <p className="portal-alert error">{error}</p>}{success && <p className="portal-alert success">{success}</p>}

      {section === "dashboard" && stats && <>
        <div className="admin-stat-grid">
          <Link href="/admin/players"><Users /><strong>{stats.players}</strong><span>Players</span></Link>
          <Link href="/admin/news"><FileText /><strong>{stats.posts}</strong><span>Publications</span></Link>
          <Link href="/admin/forum"><MessageSquare /><strong>{stats.topics}</strong><span>Forum Topics</span></Link>
          <Link href="/admin/items"><Boxes /><strong>{stats.activeItems}</strong><span>Active Items</span></Link>
          <Link href="/admin/players"><Coins /><strong>{stats.points.toLocaleString("en-US")}</strong><span>Issued Points</span></Link>
        </div>
        <section className="admin-overview"><div><BarChart3 /><h2>Portal status</h2></div><dl><div><dt>Game Server</dt><dd>{settings.server_name ?? "Vharos"} · {settings.server_status ?? "ONLINE"}</dd></div><div><dt>Item Mall</dt><dd>{settings.item_mall_enabled === "false" ? "Disabled" : "Enabled"}</dd></div><div><dt>Maintenance</dt><dd>{settings.maintenance_schedule ?? "Not configured"}</dd></div></dl></section>
      </>}

      {section === "news" && <>
        <details className="admin-editor" open><summary><FileText /> Create publication</summary><form action={saveAdminPost} className="portal-form admin-form-grid">
          <label>Section<select name="kind" defaultValue="news"><option value="news">Latest News</option><option value="update">Update News</option></select></label>
          <label>Title<input name="title" required minLength={4} maxLength={120} /></label>
          <label className="admin-wide">Homepage summary<textarea name="summary" required minLength={10} maxLength={320} rows={3} /></label>
          <label className="admin-wide">Full article<textarea name="body" required minLength={20} maxLength={20000} rows={9} /></label>
          <label className="admin-check"><input type="checkbox" name="published" defaultChecked /> Publish immediately</label><button type="submit">CREATE PUBLICATION</button>
        </form></details>
        <section className="admin-list"><h2>All publications <small>{posts.length}</small></h2>{posts.map((post) => <details key={post.id}><summary><span className={`admin-status ${post.published ? "online" : "offline"}`}>{post.published ? "LIVE" : "DRAFT"}</span><strong>{post.title}</strong><small>{post.kind.toUpperCase()} · {post.author_name}</small></summary><form action={saveAdminPost} className="portal-form admin-form-grid"><input type="hidden" name="id" value={post.id} /><label>Section<select name="kind" defaultValue={post.kind}><option value="news">Latest News</option><option value="update">Update News</option></select></label><label>Title<input name="title" defaultValue={post.title} required /></label><label className="admin-wide">Summary<textarea name="summary" defaultValue={post.summary} rows={3} required /></label><label className="admin-wide">Article<textarea name="body" defaultValue={post.body} rows={8} required /></label><label className="admin-check"><input type="checkbox" name="published" defaultChecked={post.published} /> Published</label><div className="admin-form-actions"><button type="submit">SAVE CHANGES</button><button type="submit" className="danger" formAction={deleteAdminPost}>DELETE</button></div></form></details>)}</section>
      </>}

      {section === "forum" && <section className="admin-list"><h2>Forum topics <small>{topics.length}</small></h2>{topics.length ? topics.map((topic) => <article className="admin-topic-row" key={topic.id}><span className={`admin-status ${topic.locked ? "offline" : "online"}`}>{topic.locked ? "LOCKED" : "OPEN"}</span><div><Link href={`/forum/${topic.id}`}>{topic.title}</Link><small>{topic.category_name} · {topic.author_name} · {topic.reply_count} replies</small></div><form action={moderateForumTopic}><input type="hidden" name="id" value={topic.id} /><button name="intent" value={topic.locked ? "unlock" : "lock"}>{topic.locked ? "UNLOCK" : "LOCK"}</button><button className="danger" name="intent" value="delete">DELETE</button></form></article>) : <p className="admin-empty">No forum topics have been created.</p>}</section>}

      {section === "players" && <>
        <details className="admin-editor" open><summary><Coins /> Adjust player points</summary><form action={adjustPlayerPoints} className="portal-form admin-form-grid"><label>Player<select name="accountId" required defaultValue=""><option value="" disabled>Select account</option>{accounts.map((account) => <option value={account.id} key={account.id}>{account.account_id} — {account.nickname} ({account.balance} pts)</option>)}</select></label><label>Amount<input name="amount" type="number" min="-10000000" max="10000000" required placeholder="Example: 500 or -100" /></label><label className="admin-wide">Reason<input name="reason" required minLength={3} maxLength={240} placeholder="Promotion, payment, correction..." /></label><button type="submit">APPLY POINT ADJUSTMENT</button></form></details>
        <section className="admin-list"><h2>Player accounts <small>{accounts.length}</small></h2>{accounts.map((account) => <article className="admin-player-row" key={account.id}><span className={`admin-status ${account.status === "active" ? "online" : "offline"}`}>{account.status}</span><div><strong>{account.account_id}</strong><small>{account.nickname} · {account.email}</small></div><b>{account.balance.toLocaleString("en-US")} PTS</b></article>)}</section>
        <section className="admin-list"><h2>Recent point ledger <small>{transactions.length}</small></h2>{transactions.map((transaction) => <article className="admin-ledger-row" key={transaction.id}><b className={transaction.amount >= 0 ? "credit" : "debit"}>{transaction.amount >= 0 ? "+" : ""}{transaction.amount}</b><div><strong>{transaction.account_id} · {transaction.nickname}</strong><small>{transaction.reason} · by {transaction.admin_name}</small></div><span>{transaction.balance_after} PTS</span></article>)}</section>
      </>}

      {section === "items" && <>
        <details className="admin-editor"><summary><Boxes /> Create Item Mall entry</summary><form action={saveMallItem} className="portal-form admin-form-grid"><label>Internal slug<input name="slug" required pattern="[a-z0-9-]+" placeholder="holy-orb-experience" /></label><label>Item name<input name="name" required /></label><label>Category<select name="category">{itemCategories.map((category) => <option value={category.id} key={category.id}>{category.label}</option>)}</select></label><label>Race restriction<select name="race"><option>All Race</option><option>Human Race</option><option>Ak&apos;kan Race</option></select></label><label>Amount<input name="amount" type="number" min="1" defaultValue="1" required /></label><label>Price in points<input name="pricePoints" type="number" min="0" defaultValue="0" required /></label><label>Icon<select name="icon"><option value="chest">Chest</option><option value="potion">Potion</option><option value="orb">Orb</option><option value="shield">Shield</option><option value="scroll">Scroll</option><option value="mount">Mount</option><option value="book">Book</option><option value="weapon">Weapon</option></select></label><label>Sort order<input name="sortOrder" type="number" min="0" defaultValue="0" /></label><label className="admin-wide">Description<textarea name="description" minLength={10} rows={4} required /></label><label className="admin-check"><input type="checkbox" name="active" defaultChecked /> Available for sale</label><label className="admin-check"><input type="checkbox" name="featured" /> Featured item</label><button type="submit">CREATE ITEM</button></form></details>
        <section className="admin-list"><h2>Catalog entries <small>{items.length}</small></h2>{items.map((item) => <details key={item.databaseId}><summary><span className={`admin-status ${item.active ? "online" : "offline"}`}>{item.active ? "ACTIVE" : "HIDDEN"}</span><strong>{item.name}</strong><small>{item.category} · {item.points.toLocaleString("en-US")} points</small></summary><form action={saveMallItem} className="portal-form admin-form-grid"><input type="hidden" name="id" value={item.databaseId} /><label>Internal slug<input name="slug" defaultValue={item.id} required /></label><label>Item name<input name="name" defaultValue={item.name} required /></label><label>Category<select name="category" defaultValue={item.category}>{itemCategories.map((category) => <option value={category.id} key={category.id}>{category.label}</option>)}</select></label><label>Race restriction<select name="race" defaultValue={item.race}><option>All Race</option><option>Human Race</option><option>Ak&apos;kan Race</option></select></label><label>Amount<input name="amount" type="number" min="1" defaultValue={item.amount} required /></label><label>Price in points<input name="pricePoints" type="number" min="0" defaultValue={item.points} required /></label><label>Icon<select name="icon" defaultValue={item.icon}><option value="chest">Chest</option><option value="potion">Potion</option><option value="orb">Orb</option><option value="shield">Shield</option><option value="scroll">Scroll</option><option value="mount">Mount</option><option value="book">Book</option><option value="weapon">Weapon</option></select></label><label>Sort order<input name="sortOrder" type="number" min="0" defaultValue={item.sortOrder} /></label><label className="admin-wide">Description<textarea name="description" defaultValue={item.description} rows={4} required /></label><label className="admin-check"><input type="checkbox" name="active" defaultChecked={item.active} /> Available for sale</label><label className="admin-check"><input type="checkbox" name="featured" defaultChecked={item.featured} /> Featured item</label><button type="submit">SAVE ITEM</button></form></details>)}</section>
      </>}

      {section === "settings" && <details className="admin-editor" open><summary><Settings /> Portal configuration</summary><form action={saveSiteSettings} className="portal-form admin-form-grid"><label>Server name<input name="serverName" defaultValue={settings.server_name ?? "Vharos"} required /></label><label>Server status<select name="serverStatus" defaultValue={settings.server_status ?? "ONLINE"}><option>ONLINE</option><option>MAINTENANCE</option><option>OFFLINE</option></select></label><label className="admin-wide">Maintenance schedule<input name="maintenanceSchedule" defaultValue={settings.maintenance_schedule ?? "Thu. 05:00 ~ 06:00"} required /></label><label className="admin-wide">Item Mall announcement<textarea name="mallAnnouncement" defaultValue={settings.mall_announcement ?? "Welcome to the Warborn Item Mall."} rows={3} required /></label><label className="admin-check"><input type="checkbox" name="itemMallEnabled" defaultChecked={settings.item_mall_enabled !== "false"} /> Item Mall enabled</label><button type="submit">SAVE GENERAL SETTINGS</button></form></details>}
    </div>}
  </InteriorLayout>;
}
