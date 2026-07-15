"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { cookies } from "next/headers";
import { execute, executeStatement, isWebDatabaseConfigured, queryRows } from "@/lib/db";
import { authenticateGameAccount, GameBridgeError, isGameBridgeConfigured, registerGameAccount, type GameIdentity } from "@/lib/game-bridge";
import { createSession, deleteSession } from "@/lib/session";
import { getLocale, getMessages, type Locale } from "@/lib/i18n";

export type AuthState = { message: string; success: boolean };

type AccountRow = {
  id: number;
  account_id: string;
  nickname: string;
  email: string;
  password_hash: string | null;
  auth_source: "local" | "game-bridge";
  game_account_id: string | null;
  locale: Locale;
};

const accountId = z.string().trim().min(4).max(24).regex(/^[A-Za-z0-9_]+$/);
const password = z.string().min(8).max(72);

async function findAccount(id: string) {
  const rows = await queryRows<AccountRow>(`SELECT id, account_id, nickname, email, password_hash,
    auth_source, game_account_id, locale FROM accounts
    WHERE LOWER(account_id) = LOWER($1) AND status = 'active'`, [id]);
  return rows[0] ? { ...rows[0], id: Number(rows[0].id) } : null;
}

async function accountRole(id: string, allowFirstLocalAdmin: boolean) {
  const designatedAdmin = process.env.INITIAL_ADMIN_ACCOUNT_ID;
  if (designatedAdmin && designatedAdmin.toLowerCase() === id.toLowerCase()) return "admin";
  if (!allowFirstLocalAdmin) return "player";
  const rows = await queryRows<{ count: number }>("SELECT COUNT(*) AS count FROM accounts");
  return Number(rows[0]?.count ?? 0) === 0 ? "admin" : "player";
}

async function createWebsiteAccount(input: {
  accountId: string;
  nickname: string;
  email: string;
  passwordHash: string | null;
  authSource: "local" | "game-bridge";
  gameAccountId: string | null;
  locale: Locale;
  role: string;
}) {
  const result = await execute(`INSERT INTO accounts
    (account_id, nickname, email, password_hash, auth_source, game_account_id, locale, role)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
      input.accountId, input.nickname, input.email, input.passwordHash, input.authSource,
      input.gameAccountId, input.locale, input.role,
    ]);
  return result.lastInsertId;
}

function bridgeMessage(error: unknown, copy: ReturnType<typeof getMessages>["auth"]) {
  if (!(error instanceof GameBridgeError)) return copy.gameUnavailable;
  return error.code === "rejected" ? copy.gameRejected : copy.gameUnavailable;
}

export async function register(_state: AuthState, formData: FormData): Promise<AuthState> {
  const locale = await getLocale();
  const copy = getMessages(locale).auth;
  const parsed = z.object({
    accountId,
    nickname: z.string().trim().min(3).max(20),
    email: z.email().trim().toLowerCase(),
    password,
    confirmPassword: z.string(),
    terms: z.literal("yes"),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, message: copy.invalidFields };
  if (parsed.data.password !== parsed.data.confirmPassword) return { success: false, message: copy.passwordMismatch };
  if (!isWebDatabaseConfigured()) return { success: false, message: copy.storageUnavailable };

  const duplicates = await queryRows<{ id: number }>(`SELECT id FROM accounts
    WHERE LOWER(account_id) = LOWER($1) OR LOWER(email) = LOWER($2) OR LOWER(nickname) = LOWER($3)`,
    [parsed.data.accountId, parsed.data.email, parsed.data.nickname]);
  if (duplicates.length) return { success: false, message: copy.duplicate };

  const useBridge = isGameBridgeConfigured();
  let identity: GameIdentity | null = null;
  let hash: string | null = null;
  if (useBridge) {
    try {
      identity = await registerGameAccount(parsed.data);
      if (identity.accountId.toLowerCase() !== parsed.data.accountId.toLowerCase()) {
        return { success: false, message: copy.gameRejected };
      }
    } catch (error) {
      return { success: false, message: bridgeMessage(error, copy) };
    }
  } else {
    hash = await bcrypt.hash(parsed.data.password, 12);
  }

  try {
    const role = await accountRole(parsed.data.accountId, !useBridge);
    const userId = await createWebsiteAccount({
      accountId: parsed.data.accountId,
      nickname: identity?.nickname ?? parsed.data.nickname,
      email: identity?.email ?? parsed.data.email,
      passwordHash: hash ?? "$game-bridge$",
      authSource: useBridge ? "game-bridge" : "local",
      gameAccountId: identity?.gameAccountId ?? null,
      locale,
      role,
    });
    await createSession(userId);
    return { success: true, message: copy.accountCreated };
  } catch {
    return { success: false, message: copy.duplicate };
  }
}

async function linkBridgeIdentity(identity: GameIdentity, locale: Locale) {
  const existing = await findAccount(identity.accountId);
  if (existing) return existing;
  const role = await accountRole(identity.accountId, false);
  const id = await createWebsiteAccount({
    accountId: identity.accountId,
    nickname: identity.nickname,
    email: identity.email,
    passwordHash: "$game-bridge$",
    authSource: "game-bridge",
    gameAccountId: identity.gameAccountId,
    locale,
    role,
  });
  return findAccount(identity.accountId) ?? { id, ...identity, account_id: identity.accountId, password_hash: null, auth_source: "game-bridge" as const, game_account_id: identity.gameAccountId, locale };
}

export async function login(_state: AuthState, formData: FormData): Promise<AuthState> {
  const currentLocale = await getLocale();
  const currentCopy = getMessages(currentLocale).auth;
  const parsed = z.object({ accountId, password }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, message: currentCopy.invalidCredentials };
  if (!isWebDatabaseConfigured()) return { success: false, message: currentCopy.storageUnavailable };

  let user = await findAccount(parsed.data.accountId);
  if (user?.auth_source === "game-bridge" || (!user && isGameBridgeConfigured())) {
    if (!isGameBridgeConfigured()) return { success: false, message: currentCopy.gameUnavailable };
    let identity: GameIdentity;
    try { identity = await authenticateGameAccount(parsed.data); }
    catch (error) {
      const message = error instanceof GameBridgeError && error.code === "rejected" ? currentCopy.invalidCredentials : currentCopy.gameUnavailable;
      return { success: false, message };
    }
    if (user?.game_account_id && user.game_account_id !== identity.gameAccountId) return { success: false, message: currentCopy.invalidCredentials };
    try { user = await linkBridgeIdentity(identity, currentLocale); }
    catch { return { success: false, message: currentCopy.duplicate }; }
  } else if (!user || !user.password_hash || !(await bcrypt.compare(parsed.data.password, user.password_hash))) {
    return { success: false, message: currentCopy.invalidCredentials };
  }

  if (!user) return { success: false, message: currentCopy.invalidCredentials };
  await executeStatement("UPDATE accounts SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1", [user.id]);
  await createSession(user.id);
  (await cookies()).set("warborn_locale", user.locale, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return { success: true, message: getMessages(user.locale).auth.accessGranted };
}

export async function logout() { await deleteSession(); }
