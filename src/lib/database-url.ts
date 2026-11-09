/** Build MySQL URL from DB_NAME / DB_USER / DB_PASSWORD (DATABASE_URL still wins if set). */
export function databaseUrlFromEnv(env: NodeJS.ProcessEnv = process.env): string | undefined {
  const existing = env.DATABASE_URL?.trim();
  if (existing) return existing;

  const user = env.DB_USER?.trim();
  const name = env.DB_NAME?.trim();
  if (!user || !name) return undefined;

  const password = encodeURIComponent(env.DB_PASSWORD ?? "");
  const host = env.DB_HOST?.trim() || "127.0.0.1";
  const port = env.DB_PORT?.trim() || "3306";
  return `mysql://${encodeURIComponent(user)}:${password}@${host}:${port}/${encodeURIComponent(name)}`;
}

export function applyDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string | undefined {
  const url = databaseUrlFromEnv(env);
  if (url) env.DATABASE_URL = url;
  return url;
}
