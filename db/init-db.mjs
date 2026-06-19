// 로컬 DB 초기화 스크립트: schema.sql + seed.sql 을 DATABASE_URL 에 적용한다.
// 실행: npm run db:init  (= node --env-file=.env.local db/init-db.mjs)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const { Pool } = pg;
const here = dirname(fileURLToPath(import.meta.url));

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL 이 없습니다. .env.local 을 확인하세요.");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("localhost")
    ? undefined
    : { rejectUnauthorized: false },
});

async function waitForDb(retries = 20) {
  for (let i = 1; i <= retries; i++) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch {
      console.log(`DB 연결 대기 중... (${i}/${retries})`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error("DB 에 연결할 수 없습니다. 'npm run db:up' 으로 컨테이너가 떠 있는지 확인하세요.");
}

async function main() {
  await waitForDb();
  console.log("스키마 적용 중 (schema.sql)...");
  await pool.query(readFileSync(join(here, "schema.sql"), "utf8"));
  console.log("샘플 데이터 삽입 중 (seed.sql)...");
  await pool.query(readFileSync(join(here, "seed.sql"), "utf8"));
  console.log("✅ DB 초기화 완료");
  await pool.end();
}

main().catch((err) => {
  console.error("❌ 초기화 실패:", err.message);
  process.exit(1);
});
