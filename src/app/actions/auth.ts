"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import { getLocale, getMessages, type Locale } from "@/lib/i18n";

export type AuthState = { message: string; success: boolean };
const accountId = z.string().trim().min(4).max(24).regex(/^[A-Za-z0-9_]+$/);
const password = z.string().min(8).max(72);

export async function register(_state: AuthState, formData: FormData): Promise<AuthState> {
  const locale = await getLocale();
  const copy = getMessages(locale).auth;
  const parsed = z.object({ accountId, nickname: z.string().trim().min(3).max(20), email: z.email().trim().toLowerCase(), password, confirmPassword: z.string(), terms: z.literal("yes") }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, message: copy.invalidFields };
  if (parsed.data.password !== parsed.data.confirmPassword) return { success: false, message: copy.passwordMismatch };
  const db = getDb();
  const duplicate = db.prepare("SELECT id FROM accounts WHERE lower(account_id) = lower(?) OR lower(email) = lower(?)").get(parsed.data.accountId, parsed.data.email);
  if (duplicate) return { success: false, message: copy.duplicate };
  const hash = await bcrypt.hash(parsed.data.password, 12);
  const accountCount = (db.prepare("SELECT COUNT(*) AS count FROM accounts").get() as { count: number }).count;
  const role = accountCount === 0 ? "admin" : "player";
  const result = db.prepare("INSERT INTO accounts (account_id, nickname, email, password_hash, locale, role) VALUES (?, ?, ?, ?, ?, ?)").run(parsed.data.accountId, parsed.data.nickname, parsed.data.email, hash, locale, role);
  await createSession(Number(result.lastInsertRowid));
  return { success: true, message: copy.accountCreated };
}

export async function login(_state: AuthState, formData: FormData): Promise<AuthState> {
  const currentLocale = await getLocale();
  const currentCopy = getMessages(currentLocale).auth;
  const parsed = z.object({ accountId, password }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, message: currentCopy.invalidCredentials };
  const user = getDb().prepare("SELECT id, password_hash, locale FROM accounts WHERE lower(account_id) = lower(?) AND status = 'active'").get(parsed.data.accountId) as { id: number; password_hash: string; locale: Locale } | undefined;
  if (!user || !(await bcrypt.compare(parsed.data.password, user.password_hash))) return { success: false, message: currentCopy.invalidCredentials };
  await createSession(user.id);
  (await cookies()).set("warborn_locale", user.locale, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return { success: true, message: getMessages(user.locale).auth.accessGranted };
}

export async function logout() { await deleteSession(); }
