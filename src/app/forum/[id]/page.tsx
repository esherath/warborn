import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageSquareReply, ShieldAlert } from "lucide-react";
import { createForumReply } from "@/app/actions/content";
import { InteriorLayout } from "@/components/interior-layout";
import { getForumReplies, getForumTopic } from "@/lib/content";
import { getLocale, getMessages } from "@/lib/i18n";
import { forumSectionItems } from "@/lib/section-navigation";
import { getCurrentUser } from "@/lib/session";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function TopicPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { id } = await params;
  const topicId = Number(id);
  if (!Number.isInteger(topicId)) notFound();
  const topic = getForumTopic(topicId);
  if (!topic) notFound();
  const replies = getForumReplies(topicId);
  const user = await getCurrentUser();
  const locale = await getLocale(user?.locale);
  const t = getMessages(locale);
  const query = await searchParams;
  const error = typeof query.error === "string" ? query.error : undefined;
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

  return <InteriorLayout locale={locale} messages={t} user={user} sectionTitle="Forums" sectionItems={forumSectionItems} activeHref={`/forum?category=${topic.category_slug}`} pageTitle={topic.category_name.toUpperCase()}>
      <nav className="breadcrumbs"><Link href="/forum">Forums</Link><span>›</span><Link href={`/forum?category=${topic.category_slug}`}>{topic.category_name}</Link><span>›</span><strong>{topic.title}</strong></nav>
      {error && <p className="portal-alert error"><ShieldAlert />{error}</p>}
      <article className="forum-post topic-post">
        <aside><strong>{topic.author_name}</strong><span>Player</span><small>Topic author</small></aside>
        <div><header><h1>{topic.title}</h1><time>{date.format(new Date(`${topic.created_at}Z`))}</time></header><p>{topic.body}</p></div>
      </article>
      <section id="replies" className="reply-stack">
        {replies.map((reply, index) => <article className="forum-post" key={reply.id}>
          <aside><strong>{reply.author_name}</strong><span>{reply.author_role === "admin" ? "Administrator" : "Player"}</span><small>Reply #{index + 1}</small></aside>
          <div><header><time>{date.format(new Date(`${reply.created_at}Z`))}</time></header><p>{reply.body}</p></div>
        </article>)}
      </section>
      <section className="portal-panel create-panel">
        <div className="portal-panel-title"><h2><MessageSquareReply /> Post Reply</h2></div>
        {user && !topic.locked ? <form action={createForumReply} className="portal-form"><input type="hidden" name="topicId" value={topic.id} /><label>Your reply<textarea name="body" required minLength={2} maxLength={10000} rows={7} /></label><button type="submit">POST REPLY</button></form> : <p className="sign-in-note">{topic.locked ? "This topic is locked." : <>You need to <Link href="/">sign in</Link> before replying.</>}</p>}
      </section>
  </InteriorLayout>;
}
