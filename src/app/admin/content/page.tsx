import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { publishPost } from "@/app/actions/content";
import { InteriorLayout } from "@/components/interior-layout";
import { getPublishedPosts } from "@/lib/content";
import { getLocale, getMessages } from "@/lib/i18n";
import { adminSectionItems } from "@/lib/section-navigation";
import { getCurrentUser } from "@/lib/session";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ContentAdminPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  const locale = await getLocale(user?.locale);
  const t = getMessages(locale);
  const query = await searchParams;
  const error = typeof query.error === "string" ? query.error : undefined;
  const success = typeof query.success === "string" ? query.success : undefined;
  const posts = user?.role === "admin" ? getPublishedPosts(undefined, 20) : [];
  return <InteriorLayout locale={locale} messages={t} user={user} sectionTitle="Administration" sectionItems={adminSectionItems} activeHref="/admin/content" pageTitle="CONTENT PUBLISHER">
      <p className="legacy-intro">Publish official news and updates directly to the Warborn homepage.</p>
      {!user || user.role !== "admin" ? <section className="access-denied"><LockKeyhole /><h2>Administrator access required</h2><p>The first account registered on this installation becomes the initial administrator.</p><Link href="/">Return to homepage</Link></section> : <>
        {error && <p className="portal-alert error">{error}</p>}{success && <p className="portal-alert success">{success}</p>}
        <section className="portal-panel"><div className="portal-panel-title"><h2>New Publication</h2></div><form action={publishPost} className="portal-form">
          <label>Publication section<select name="kind" required defaultValue="news"><option value="news">Latest News</option><option value="update">Update News</option></select></label>
          <label>Title<input name="title" required minLength={4} maxLength={120} /></label>
          <label>Homepage summary<textarea name="summary" required minLength={10} maxLength={320} rows={3} /></label>
          <label>Full article<textarea name="body" required minLength={20} maxLength={20000} rows={12} /></label>
          <button type="submit">PUBLISH NOW</button>
        </form></section>
        <section className="portal-panel"><div className="portal-panel-title"><h2>Published Content</h2></div><div className="admin-post-list">{posts.map((post) => <Link href={`/news/${post.id}`} key={post.id}><span>{post.kind}</span><strong>{post.title}</strong><small>{post.created_at}</small></Link>)}</div></section>
      </>}
  </InteriorLayout>;
}
