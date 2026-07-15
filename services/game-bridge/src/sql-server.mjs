import sql from "mssql";

let poolPromise;

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function flag(name, fallback) {
  const value = process.env[name];
  return value == null ? fallback : value.toLowerCase() === "true";
}

function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool({
      server: required("SQLSERVER_HOST"),
      port: Number(process.env.SQLSERVER_PORT || 1433),
      database: required("SQLSERVER_DATABASE"),
      user: required("SQLSERVER_USER"),
      password: required("SQLSERVER_PASSWORD"),
      pool: { min: 0, max: 10, idleTimeoutMillis: 30_000 },
      options: {
        encrypt: flag("SQLSERVER_ENCRYPT", false),
        trustServerCertificate: flag("SQLSERVER_TRUST_CERTIFICATE", true),
        enableArithAbort: true,
      },
    }).connect().catch((error) => {
      poolPromise = null;
      throw error;
    });
  }
  return poolPromise;
}

function identityFromRow(row) {
  if (!row || !row.game_account_id || !row.account_id || !row.nickname || !row.email) {
    throw Object.assign(new Error("The SQL procedure returned an incomplete identity."), { statusCode: 502 });
  }
  return {
    gameAccountId: String(row.game_account_id),
    accountId: String(row.account_id),
    nickname: String(row.nickname),
    email: String(row.email),
  };
}

export async function registerAccount(input) {
  const pool = await getPool();
  const result = await pool.request()
    .input("AccountId", sql.VarChar(24), input.accountId)
    .input("Nickname", sql.NVarChar(20), input.nickname)
    .input("Email", sql.NVarChar(320), input.email)
    .input("Password", sql.NVarChar(72), input.password)
    .execute(required("GAME_REGISTER_PROCEDURE"));
  const row = result.recordset?.[0];
  if (row?.success === false || row?.success === 0) {
    throw Object.assign(new Error(String(row.error_message || "Account registration rejected.")), { statusCode: 409 });
  }
  return identityFromRow(row);
}

export async function authenticateAccount(input) {
  const pool = await getPool();
  const result = await pool.request()
    .input("AccountId", sql.VarChar(24), input.accountId)
    .input("Password", sql.NVarChar(72), input.password)
    .execute(required("GAME_AUTHENTICATE_PROCEDURE"));
  const row = result.recordset?.[0];
  if (!row || row.authenticated === false || row.authenticated === 0) {
    throw Object.assign(new Error("Invalid account ID or password."), { statusCode: 401 });
  }
  return identityFromRow(row);
}

export async function healthcheck() {
  const pool = await getPool();
  await pool.request().query("SELECT 1 AS ok");
}
