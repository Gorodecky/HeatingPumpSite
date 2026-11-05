import { spawnSync } from "node:child_process";
import { Client } from "pg";

const configuredUrl = process.env.TEST_DATABASE_URL;
if (!configuredUrl) {
  console.error("Set TEST_DATABASE_URL to a local PostgreSQL database ending in _test.");
  process.exit(2);
}

const databaseUrl = new URL(configuredUrl);
const databaseName = decodeURIComponent(databaseUrl.pathname.slice(1));
if (
  !["localhost", "127.0.0.1", "::1"].includes(databaseUrl.hostname) ||
  !databaseName.endsWith("_test") ||
  !["postgres:", "postgresql:"].includes(databaseUrl.protocol)
) {
  console.error("Integration tests require a local PostgreSQL database whose name ends in _test.");
  process.exit(2);
}

const schema = `lead_it_${process.pid}_${Date.now()}`;
const adminUrl = new URL(databaseUrl);
adminUrl.searchParams.delete("schema");
const client = new Client({ connectionString: adminUrl.toString() });
const schemaUrl = new URL(databaseUrl);
schemaUrl.searchParams.set("schema", schema);
let exitCode = 1;

try {
  await client.connect();
  await client.query(`CREATE SCHEMA "${schema}"`);
  const env = {
    ...process.env,
    DATABASE_URL: schemaUrl.toString(),
    TEST_DATABASE_URL: schemaUrl.toString(),
  };
  const migration = spawnSync(
    process.execPath,
    ["node_modules/prisma/build/index.js", "migrate", "deploy", "--schema", "prisma/schema.prisma"],
    { cwd: process.cwd(), env, stdio: "inherit" },
  );
  if (migration.status !== 0) throw new Error("Test schema migration failed.");

  const tests = spawnSync(
    process.execPath,
    ["--import", "tsx", "--test", "src/leadQueue.integration.test.ts"],
    { cwd: process.cwd(), env, stdio: "inherit" },
  );
  exitCode = tests.status ?? 1;
} catch (error) {
  console.error(error instanceof Error ? error.message : "Integration test setup failed.");
} finally {
  if (client._connected) {
    try {
      await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    } catch {
      console.error("Could not remove the isolated integration test schema.");
      exitCode = 1;
    }
    await client.end();
  }
}

process.exitCode = exitCode;
