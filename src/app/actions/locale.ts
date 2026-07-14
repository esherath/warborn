"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isLocale, type Locale } from "@/lib/i18n";

export async function setLocalePreference(locale: Locale) {
  if (!isLocale(locale)) return;
  (await cookies()).set("warborn_locale", locale, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  const user = await getCurrentUser();
  if (user) getDb().prepare("UPDATE accounts SET locale = ? WHERE id = ?").run(locale, user.id);
  revalidatePath("/");
}
