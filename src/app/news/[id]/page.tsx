import Link from "next/link";
import { notFound } from "next/navigation";
import { InteriorLayout } from "@/components/interior-layout";
import { getNewsPost } from "@/lib/content";
import { getLocale, getMessages } from "@/lib/i18n";
import { forumSectionItems } from "@/lib/section-navigation";
import { getCurrentUser } from "@/lib/session";

type Params = Promise<{ id: string }>;

export default async function ArticlePage({ params }: { params: Params }) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) notFound();
  const post = getNewsPost(postId);
  if (!post) notFound();
  const user = await getCurrentUser();
  const locale = await getLocale(user?.locale);
  const t = getMessages(locale);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short", timeZone: "UTC" });
  const activeHref = `/news?kind=${post.kind}`;
  return <InteriorLayout locale={locale} messages={t} user={user} sectionTitle="Forums" sectionItems={forumSectionItems} activeHref={activeHref} pageTitle={post.kind === "update" ? "UPDATE NEWS" : "LATEST NEWS"}><article className="full-article"><nav className="breadcrumbs"><Link href="/news">News & Updates</Link><span>›</span><strong>{post.title}</strong></nav><header><span>{post.kind === "update" ? "UPDATE NEWS" : "LATEST NEWS"}</span><h1>{post.title}</h1><p>{post.summary}</p><small>Published by {post.author_name} · {date.format(new Date(`${post.created_at}Z`))}</small></header><div className="article-body">{post.body.split(/\n{2,}/).map((paragraph, index) => <p key={`${post.id}-${index}`}>{paragraph}</p>)}</div></article></InteriorLayout>;
}
