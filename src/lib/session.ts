import "server-only";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { getDb } from "@/lib/db";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET ?? "warborn-dev-secret-change-before-production-2026");

export async function createSession(userId: number) {
  const token = await new SignJWT({ userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret);
  (await cookies()).set("warborn_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
}

export async function deleteSession() { (await cookies()).delete("warborn_session"); }

export async function getCurrentUser() {
  try {
    const token = (await cookies()).get("warborn_session")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return getDb().prepare("SELECT id, account_id, nickname, email, role, locale FROM accounts WHERE id = ? AND status = 'active'").get(payload.userId as number) as { id: number; account_id: string; nickname: string; email: string; role: string; locale: string } | undefined ?? null;
  } catch { return null; }
}
