"use client";

import { useTransition } from "react";
import { setLocalePreference } from "@/app/actions/locale";
import type { Locale } from "@/lib/i18n";

export function LocaleSelector({ locale, label }: { locale: Locale; label: string }) {
  const [pending, startTransition] = useTransition();
  return <label className="locale-selector"><span>{label}</span><select aria-label={label} value={locale} disabled={pending} onChange={(event) => startTransition(() => setLocalePreference(event.target.value as Locale))}><option value="en-US">EN</option><option value="pt-BR">PT</option></select></label>;
}
