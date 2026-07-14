import { BookOpen, Box, Crown, Download, Gem, Gift, Shield, Sparkles, Swords } from "lucide-react";
import Link from "next/link";
import { AuthPanel } from "@/components/auth-panel";
import { LocaleSelector } from "@/components/locale-selector";
import { MainNavigation } from "@/components/main-navigation";
import { getPublishedPosts } from "@/lib/content";
import { getLocale, getMessages } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";

// Canonical game data: class and item names are intentionally never localized.
const rankings = [
  ["95", "Warrior", "Aethel"], ["95", "Archer", "Nyx"], ["94", "Templar", "Draven"],
  ["93", "Sorceress", "Morrigan"], ["92", "Assassin", "Kael"], ["91", "Guardian", "Brom"],
  ["90", "Mystic", "Lunara"], ["89", "Berserker", "Ragnar"],
];

const itemNames = { founder: "Founder Chest", orb: "Orb of Experience", stone: "Return Stone" };

function PanelTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="panel-title"><span>{children}</span></h2>;
}

export default async function Home() {
  const user = await getCurrentUser();
  const locale = await getLocale(user?.locale);
  const t = getMessages(locale);
  const account = user ? { accountId: user.account_id, nickname: user.nickname, role: user.role } : null;
  const date = new Intl.DateTimeFormat(locale, { year: "numeric", month: "numeric", day: "numeric", timeZone: "UTC" });
  const publishedNews = getPublishedPosts("news", 4);
  const publishedUpdates = getPublishedPosts("update", 3);
  const homeNews = publishedNews.length ? publishedNews.map((post) => ({ id: post.id, title: post.title, date: date.format(new Date(`${post.created_at}Z`)), text: post.summary })) : t.news.map((post) => ({ ...post, id: null }));
  const homeUpdates = publishedUpdates.length ? publishedUpdates.map((post) => ({ id: post.id, title: post.title, date: date.format(new Date(`${post.created_at}Z`)) })) : [
    { id: null, title: t.updates.release, date: "7/14/2026" },
    { id: null, title: t.updates.balance, date: "7/08/2026" },
    { id: null, title: t.updates.install, date: "7/01/2026" },
  ];

  return (
    <main className="site-shell">
      <header className="hero">
        <div className="hero-vignette" />
        <Link className="hero-home-link" href="/" aria-label="Warborn home" />
        <LocaleSelector locale={locale} label={t.language} />
      </header>

      <MainNavigation messages={t} />

      <div className="content-grid">
        <aside className="left-rail">
          <AuthPanel user={account} variant="sidebar" copy={t.auth} />
          <div className="quick-links" id="start">
            <AuthPanel variant="register-button" user={account} copy={t.auth} />
            <a href="#guide"><BookOpen /><span>{t.quick.beginner}</span></a>
            <a href="#download"><Download /><span>{t.quick.client}</span></a>
          </div>
          <section className="rail-panel" id="data"><PanelTitle>{t.war.title}</PanelTitle>
            <div className="war-time"><h3>{t.war.territory}</h3><strong>{t.war.sunday}</strong><b>01:00 / 19:00 <small>(GMT)</small></b></div>
            <div className="war-time"><h3>{t.war.guild}</h3><strong>{t.war.saturday}</strong><b>12:00 ~ 13:00 <small>(GMT)</small></b></div>
          </section>
          <section className="rail-panel server-panel"><PanelTitle>{t.server.title}</PanelTitle>
            <div className="server-row"><b>Vharos</b><span className="online-dot" /><em>ONLINE</em></div>
            <div className="maintenance"><strong>{t.server.maintenance}</strong><span>{t.server.schedule}</span></div>
          </section>
        </aside>

        <section className="main-column">
          <a className="event-banner gold-banner" href="#news"><span>{t.banners.season}</span><strong>{t.banners.rise}</strong><small>{t.banners.rewards}</small></a>
          <a className="event-banner red-banner" href="#news"><span>{t.banners.launch}</span><strong>{t.banners.call}</strong><small>{t.banners.bonus}</small></a>
          <section id="news"><PanelTitle>{t.newsTitle}</PanelTitle><div className="news-list">{homeNews.map((news, index) => (
            <article className="news-item" key={news.title}><div className="news-heading"><span className="tag">{index === 0 ? t.newTag : t.noticeTag}</span><h3>{news.title}</h3><time>{news.date}</time></div><p>{news.text}</p><a href={news.id ? `/news/${news.id}` : "/news?kind=news"}>{t.readMore} ›</a></article>
          ))}</div></section>
          <section id="updates"><PanelTitle>{t.updates.title}</PanelTitle><div className="update-list">{homeUpdates.map((update, index) => <a href={update.id ? `/news/${update.id}` : "/news?kind=update"} key={update.title}><span>{index === 1 ? "PATCH" : "UPDATE"}</span>{update.title}<time>{update.date}</time></a>)}</div></section>
          <section id="community"><PanelTitle>{t.screenshots.title}</PanelTitle><div className="screenshots"><div><span>{t.screenshots.fortress}</span></div><div><span>{t.screenshots.valley}</span></div><div><span>{t.screenshots.siege}</span></div></div></section>
        </section>

        <aside className="right-rail">
          <a className="premium" id="shop" href="#"><Crown /><div><span>{t.shop.label}</span><strong>ITEM MALL</strong></div></a>
          <section className="item-shop"><h2>{t.shop.featured}</h2>
            <div className="shop-item"><span><Gift /></span><div><b>{itemNames.founder}</b><small>{t.shop.founderDesc}</small></div></div>
            <div className="shop-item"><span><Gem /></span><div><b>{itemNames.orb}</b><small>{t.shop.orbDesc}</small></div></div>
            <div className="shop-item"><span><Shield /></span><div><b>{itemNames.stone}</b><small>{t.shop.stoneDesc}</small></div></div>
          </section>
          <a className="merge-guide" href="#"><Swords /><span>{t.guide}</span></a>
          <section className="ranking"><PanelTitle>{t.ranking}</PanelTitle>{rankings.map(([level, cls, name], index) => <div className="rank-row" key={name}><b>{level}</b><span>{cls}</span><em>{name}</em>{index < 3 && <Sparkles />}</div>)}</section>
        </aside>
      </div>
      <footer><div className="footer-logo"><Box /> WARBORN</div><p>{t.footer.rights}</p><nav><a href="#">{t.footer.terms}</a><a href="#">{t.footer.privacy}</a><a href="#">{t.footer.support}</a></nav></footer>
    </main>
  );
}
