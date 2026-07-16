import "server-only";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { queryRows } from "@/lib/db";

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
    const rows = await queryRows<{ id: number; account_id: string; nickname: string; email: string; role: string; locale: string; points: number }>(
      `SELECT a.id, a.account_id, a.nickname, a.email, a.role, a.locale,
        COALESCE(p.balance, 0) AS points
       FROM accounts a
       LEFT JOIN account_points p ON p.account_id = a.id
       WHERE a.id = $1 AND a.status = 'active'`,
      [payload.userId as number],
    );
    return rows[0] ? { ...rows[0], id: Number(rows[0].id), points: Number(rows[0].points) } : null;
  } catch { return null; }
}
