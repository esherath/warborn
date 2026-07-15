import "server-only";

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { z } from "zod";

const identitySchema = z.object({
  gameAccountId: z.string().min(1).max(128),
  accountId: z.string().min(1).max(24),
  nickname: z.string().min(1).max(20),
  email: z.string().email(),
});

export type GameIdentity = z.infer<typeof identitySchema>;
export type GameCredentials = { accountId: string; password: string };
export type GameRegistration = GameCredentials & { nickname: string; email: string };

export class GameBridgeError extends Error {
  constructor(message: string, public readonly code: "unavailable" | "rejected" | "invalid-response") {
    super(message);
    this.name = "GameBridgeError";
  }
}

export function isGameBridgeConfigured() {
  return Boolean(process.env.GAME_BRIDGE_URL && process.env.GAME_BRIDGE_SHARED_SECRET);
}

function constantTimeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function requestBridge(pathname: string, payload: unknown): Promise<GameIdentity> {
  const baseUrl = process.env.GAME_BRIDGE_URL;
  const secret = process.env.GAME_BRIDGE_SHARED_SECRET;
  if (!baseUrl || !secret) throw new GameBridgeError("Game bridge is not configured.", "unavailable");

  const url = new URL(pathname, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  if (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(url.hostname))) {
    throw new GameBridgeError("The game bridge must use HTTPS.", "unavailable");
  }

  const body = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = randomUUID();
  const signature = createHmac("sha256", secret).update(`${timestamp}.${nonce}.${body}`).digest("hex");

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-warborn-timestamp": timestamp,
        "x-warborn-nonce": nonce,
        "x-warborn-signature": signature,
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    throw new GameBridgeError("The game account service is temporarily unavailable.", "unavailable");
  }

  const responseText = await response.text();
  const expectedResponseSignature = createHmac("sha256", secret).update(`${timestamp}.${nonce}.${responseText}`).digest("hex");
  const responseSignature = response.headers.get("x-warborn-signature") ?? "";
  if (!responseSignature || !constantTimeEqual(responseSignature, expectedResponseSignature)) {
    throw new GameBridgeError("The game bridge returned an unsigned response.", "invalid-response");
  }
  if (!response.ok) throw new GameBridgeError("The game account service rejected the request.", response.status >= 500 ? "unavailable" : "rejected");

  let data: unknown;
  try { data = JSON.parse(responseText); } catch { throw new GameBridgeError("The game bridge returned invalid JSON.", "invalid-response"); }
  const parsed = identitySchema.safeParse(data);
  if (!parsed.success) throw new GameBridgeError("The game bridge returned an invalid account payload.", "invalid-response");
  return parsed.data;
}

export function registerGameAccount(input: GameRegistration) {
  return requestBridge("v1/accounts/register", input);
}

export function authenticateGameAccount(input: GameCredentials) {
  return requestBridge("v1/accounts/authenticate", input);
}
