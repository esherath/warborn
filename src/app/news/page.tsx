import Link from "next/link";
import { InteriorLayout } from "@/components/interior-layout";
import { getPublishedPosts, type NewsKind } from "@/lib/content";
import { getLocale, getMessages } from "@/lib/i18n";
import { forumSectionItems } from "@/lib/section-navigation";
import { getCurrentUser } from "@/lib/session";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function NewsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  const locale = await getLocale(user?.locale);
  const t = getMessages(locale);
  const query = await searchParams;
  const kind: NewsKind | undefined = query.kind === "news" || query.kind === "update" ? query.kind : undefined;
  const posts = await getPublishedPosts(kind);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" });
  const pageTitle = kind === "update" ? "UPDATE NEWS" : kind === "news" ? "LATEST NEWS" : "NEWS & UPDATES";
  return <InteriorLayout locale={locale} messages={t} user={user} sectionTitle="Forums" sectionItems={forumSectionItems} activeHref={kind ? `/news?kind=${kind}` : undefined} pageTitle={pageTitle}>
      <p className="legacy-intro">Official announcements, events and patch information.</p>
      <nav className="content-tabs"><Link className={!kind ? "active" : ""} href="/news">All</Link><Link className={kind === "news" ? "active" : ""} href="/news?kind=news">News</Link><Link className={kind === "update" ? "active" : ""} href="/news?kind=update">Updates</Link></nav>
      <section className="article-list">{posts.length ? posts.map((post) => <article key={post.id}><span>{post.kind === "update" ? "UPDATE" : "NOTICE"}</span><div><h2><Link href={`/news/${post.id}`}>{post.title}</Link></h2><p>{post.summary}</p><small>By {post.author_name}</small></div><time>{date.format(new Date(post.created_at))}</time></article>) : <p className="empty-state">No articles have been published yet.</p>}</section>
  </InteriorLayout>;
}
