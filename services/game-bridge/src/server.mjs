import http from "node:http";
import { createHmac, timingSafeEqual } from "node:crypto";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { authenticateAccount, healthcheck, registerAccount } from "./sql-server.mjs";

dotenv.config({ path: fileURLToPath(new URL("../../../.env.local", import.meta.url)), quiet: true });

const port = Number(process.env.PORT || 8787);
const secret = process.env.GAME_BRIDGE_SHARED_SECRET;
const usedNonces = new Map();

if (!secret || secret.length < 32) throw new Error("GAME_BRIDGE_SHARED_SECRET must contain at least 32 characters.");

function safeEqual(left, right) {
  const a = Buffer.from(left || "");
  const b = Buffer.from(right || "");
  return a.length === b.length && timingSafeEqual(a, b);
}

function signature(timestamp, nonce, body) {
  return createHmac("sha256", secret).update(`${timestamp}.${nonce}.${body}`).digest("hex");
}

function send(res, statusCode, payload, timestamp = "0", nonce = "none") {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "x-warborn-signature": signature(timestamp, nonce, body),
  });
  res.end(body);
}

function validateText(value, min, max, pattern) {
  return typeof value === "string" && value.length >= min && value.length <= max && (!pattern || pattern.test(value));
}

function validateCredentials(input) {
  return input && validateText(input.accountId, 4, 24, /^[A-Za-z0-9_]+$/) && validateText(input.password, 8, 72);
}

function validateRegistration(input) {
  return validateCredentials(input) && validateText(input.nickname, 3, 20) && validateText(input.email, 3, 50) && input.email.includes("@");
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 16_384) throw Object.assign(new Error("Request body too large."), { statusCode: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function authenticateRequest(req, body) {
  const timestamp = String(req.headers["x-warborn-timestamp"] || "");
  const nonce = String(req.headers["x-warborn-nonce"] || "");
  const provided = String(req.headers["x-warborn-signature"] || "");
  const seconds = Number(timestamp);
  if (!Number.isInteger(seconds) || Math.abs(Math.floor(Date.now() / 1000) - seconds) > 30) return null;
  if (!/^[0-9a-f-]{36}$/i.test(nonce) || usedNonces.has(nonce)) return null;
  if (!safeEqual(provided, signature(timestamp, nonce, body))) return null;
  usedNonces.set(nonce, Date.now());
  return { timestamp, nonce };
}

setInterval(() => {
  const cutoff = Date.now() - 60_000;
  for (const [nonce, createdAt] of usedNonces) if (createdAt < cutoff) usedNonces.delete(nonce);
}, 60_000).unref();

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    try { await healthcheck(); send(res, 200, { status: "ok" }); }
    catch { send(res, 503, { status: "unavailable" }); }
    return;
  }
  if (req.method !== "POST" || !["/v1/accounts/register", "/v1/accounts/authenticate"].includes(req.url)) {
    send(res, 404, { error: "not_found" });
    return;
  }

  let auth;
  try {
    const body = await readBody(req);
    auth = authenticateRequest(req, body);
    if (!auth) { send(res, 401, { error: "invalid_signature" }); return; }
    const input = JSON.parse(body);
    const isRegistration = req.url === "/v1/accounts/register";
    if (isRegistration ? !validateRegistration(input) : !validateCredentials(input)) {
      send(res, 400, { error: "invalid_request" }, auth.timestamp, auth.nonce);
      return;
    }
    const identity = isRegistration ? await registerAccount(input) : await authenticateAccount(input);
    send(res, 200, identity, auth.timestamp, auth.nonce);
  } catch (error) {
    const statusCode = Number(error?.statusCode) || 500;
    const message = statusCode >= 500 ? "game_service_unavailable" : String(error?.message || "request_rejected");
    send(res, statusCode, { error: message }, auth?.timestamp, auth?.nonce);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Warborn game bridge listening on 127.0.0.1:${port}`);
});
