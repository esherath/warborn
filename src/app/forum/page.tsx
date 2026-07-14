import Link from "next/link";
import { PenLine, ShieldAlert } from "lucide-react";
import { createForumTopic } from "@/app/actions/content";
import { InteriorLayout } from "@/components/interior-layout";
import { getForumCategories, getForumTopics } from "@/lib/content";
import { getLocale, getMessages } from "@/lib/i18n";
import { forumSectionItems } from "@/lib/section-navigation";
import { getCurrentUser } from "@/lib/session";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ForumPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  const locale = await getLocale(user?.locale);
  const t = getMessages(locale);
  const query = await searchParams;
  const category = typeof query.category === "string" ? query.category : undefined;
  const error = typeof query.error === "string" ? query.error : undefined;
  const categories = getForumCategories();
  const topics = getForumTopics(category);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

  const currentCategory = categories.find((item) => item.slug === category);

  return <InteriorLayout locale={locale} messages={t} user={user} sectionTitle="Forums" sectionItems={forumSectionItems} activeHref={category ? `/forum?category=${category}` : undefined} pageTitle={(currentCategory?.name ?? "Forums").toUpperCase()}>
      <p className="legacy-intro">Discuss the game, trade with players and share your knowledge.</p>
      {error && <p className="portal-alert error"><ShieldAlert />{error}</p>}

      <section className="portal-panel">
        <div className="portal-panel-title"><h2>{currentCategory?.name ?? "Latest Topics"}</h2><Link href="/forum">View all</Link></div>
        <div className="forum-table-head"><span>Subject</span><span>Writer</span><span>Date</span><span>Count</span></div>
        <div className="topic-list">
          {topics.length ? topics.map((topic) => <Link href={`/forum/${topic.id}`} key={topic.id}>
            <div><span>{topic.category_name}</span><h3>{topic.title}</h3></div>
            <strong className="topic-writer">{topic.author_name}</strong>
            <time>{date.format(new Date(`${topic.updated_at}Z`))}</time>
            <b className="topic-count">{topic.reply_count}</b>
          </Link>) : <p className="empty-state">No topics in this category yet.</p>}
        </div>
      </section>

      <section className="portal-panel create-panel">
        <div className="portal-panel-title"><h2><PenLine /> Create Topic</h2></div>
        {user ? <form action={createForumTopic} className="portal-form">
          <label>Category<select name="categoryId" required defaultValue={categories.find((item) => item.slug === category)?.id ?? categories[0]?.id}>{categories.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
          <label>Topic title<input name="title" required minLength={4} maxLength={120} /></label>
          <label>Message<textarea name="body" required minLength={10} maxLength={10000} rows={7} /></label>
          <button type="submit">PUBLISH TOPIC</button>
        </form> : <p className="sign-in-note">You need to <Link href="/">sign in</Link> before creating a topic.</p>}
      </section>
  </InteriorLayout>;
}
