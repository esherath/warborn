import Link from "next/link";
import type { getMessages } from "@/lib/i18n";
import { getSectionItems } from "@/lib/page-catalog";

type Messages = ReturnType<typeof getMessages>;

export function MainNavigation({ messages: t }: { messages: Messages }) {
  const menus = [
    { label: t.nav.start, items: getSectionItems("start", t) },
    { label: t.nav.guide, items: getSectionItems("guide", t) },
    { label: t.nav.system, items: getSectionItems("system", t) },
    { label: t.nav.data, items: getSectionItems("data", t) },
    { label: t.nav.forum, items: getSectionItems("forum", t) },
    { label: t.nav.downloads, items: getSectionItems("downloads", t) },
    { label: t.nav.shop, items: getSectionItems("shop", t) },
  ];

  return <nav className="main-nav" aria-label="Main navigation">
    {menus.map((menu) => <div className="nav-dropdown" key={menu.label}>
      <button type="button" aria-haspopup="menu">{menu.label}</button>
      <div className="dropdown-menu" role="menu">
        {menu.items.map((item) => <Link href={item.href ?? "/"} role="menuitem" key={item.label}><span aria-hidden="true">›</span>{item.label}</Link>)}
      </div>
    </div>)}
  </nav>;
}
