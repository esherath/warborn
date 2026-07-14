import Link from "next/link";
import { LocaleSelector } from "@/components/locale-selector";
import { MainNavigation } from "@/components/main-navigation";
import type { getMessages, Locale } from "@/lib/i18n";

type Messages = ReturnType<typeof getMessages>;

export function InteriorHeader({ locale, messages }: { locale: Locale; messages: Messages }) {
  return <>
    <header className="hero">
      <div className="hero-vignette" />
      <Link className="hero-home-link" href="/" aria-label="Warborn home" />
      <LocaleSelector locale={locale} label={messages.language} />
    </header>
    <MainNavigation messages={messages} />
  </>;
}
