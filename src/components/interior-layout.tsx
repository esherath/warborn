import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Crown, Gem, Gift, Shield, Sparkles, Swords } from "lucide-react";
import { AuthPanel } from "@/components/auth-panel";
import { InteriorHeader } from "@/components/interior-header";
import type { getMessages, Locale } from "@/lib/i18n";

type Messages = ReturnType<typeof getMessages>;
type User = { account_id: string; nickname: string; role: string } | null;
type SectionItem = { label: string; href: string };

const rankings = [
  ["95", "Warrior", "Aethel"], ["95", "Archer", "Nyx"], ["94", "Templar", "Draven"],
  ["93", "Sorceress", "Morrigan"], ["92", "Assassin", "Kael"], ["91", "Guardian", "Brom"],
  ["90", "Mystic", "Lunara"], ["89", "Berserker", "Ragnar"],
];

export function InteriorLayout({ locale, messages: t, user, sectionTitle, sectionItems, activeHref, pageTitle, children }: {
  locale: Locale;
  messages: Messages;
  user: User;
  sectionTitle: string;
  sectionItems: SectionItem[];
  activeHref?: string;
  pageTitle: string;
  children: ReactNode;
}) {
  const account = user ? { accountId: user.account_id, nickname: user.nickname, role: user.role } : null;
  return <main className="site-shell legacy-shell">
    <InteriorHeader locale={locale} messages={t} />
    <div className="legacy-content-grid">
      <aside className="legacy-left-rail">
        <AuthPanel user={account} variant="sidebar" copy={t.auth} />
        <nav className="section-menu" aria-label={sectionTitle}>
          <h2>{sectionTitle}</h2>
          <div>{sectionItems.map((item) => <Link className={activeHref === item.href ? "active" : ""} href={item.href} key={item.href}>{item.label}</Link>)}</div>
        </nav>
        <div className="contact-us"><strong>Contact Us</strong><a href="mailto:gm@warborn.com">GM@warborn.com</a></div>
      </aside>

      <section className="legacy-center">
        <h1 className="legacy-page-title">{pageTitle}</h1>
        <div className="legacy-parchment">{children}</div>
      </section>

      <aside className="legacy-right-rail">
        <Link className="premium" href="/#shop"><Crown /><div><span>{t.shop.label}</span><strong>ITEM MALL</strong></div></Link>
        <section className="item-shop"><h2>{t.shop.featured}</h2>
          <div className="shop-item"><span><Gift /></span><div><b>Founder Chest</b><small>{t.shop.founderDesc}</small></div></div>
          <div className="shop-item"><span><Gem /></span><div><b>Orb of Experience</b><small>{t.shop.orbDesc}</small></div></div>
          <div className="shop-item"><span><Shield /></span><div><b>Return Stone</b><small>{t.shop.stoneDesc}</small></div></div>
        </section>
        <Link className="merge-guide" href="/#guide"><Swords /><span>{t.guide}</span></Link>
        <section className="ranking"><h2 className="legacy-rail-title">{t.ranking}</h2>{rankings.map(([level, cls, name], index) => <div className="rank-row" key={name}><b>{level}</b><span>{cls}</span><em>{name}</em>{index < 3 && <Sparkles />}</div>)}</section>
      </aside>
    </div>
    <footer><div className="footer-logo"><Image src="/assets/warborn-emblem-transparent-256.png" width={256} height={256} alt="" /> WARBORN</div><p>{t.footer.rights}</p><nav><a href="#">{t.footer.terms}</a><a href="#">{t.footer.privacy}</a><a href="#">{t.footer.support}</a></nav></footer>
  </main>;
}
