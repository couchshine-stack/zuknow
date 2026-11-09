"use strict";

const fs = require("fs");
const path = require("path");

const root = process.cwd();

function parseEnv(content) {
  const out = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function loadEnvFile(name, override) {
  const file = path.join(root, name);
  if (!fs.existsSync(file)) return;
  const parsed = parseEnv(fs.readFileSync(file, "utf8"));
  for (const [key, value] of Object.entries(parsed)) {
    if (override || process.env[key] == null || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env", false);
loadEnvFile(".env.local", true);

function databaseUrlFromEnv() {
  const existing = (process.env.DATABASE_URL || "").trim();
  if (existing) return existing;
  const user = (process.env.DB_USER || "").trim();
  const name = (process.env.DB_NAME || "").trim();
  if (!user || !name) return undefined;
  const password = encodeURIComponent(process.env.DB_PASSWORD ?? "");
  const host = (process.env.DB_HOST || "").trim() || "127.0.0.1";
  const port = (process.env.DB_PORT || "").trim() || "3306";
  return `mysql://${encodeURIComponent(user)}:${password}@${host}:${port}/${encodeURIComponent(name)}`;
}

const url = databaseUrlFromEnv();
if (url) process.env.DATABASE_URL = url;

module.exports = { databaseUrlFromEnv };
