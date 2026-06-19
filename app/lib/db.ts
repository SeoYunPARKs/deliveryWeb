import { Pool } from "pg";

// DATABASE_URL: 로컬은 Docker Postgres, 운영은 Neon(PostgreSQL).
const connectionString = process.env.DATABASE_URL;

// 서버리스(Vercel)에서는 함수 인스턴스가 재사용될 수 있으므로
// 개발 중 HMR/재실행 때 풀이 중복 생성되지 않도록 globalThis 에 캐싱한다.
const globalForPg = globalThis as unknown as { _pgPool?: Pool };

export const pool: Pool =
  globalForPg._pgPool ??
  new Pool({
    connectionString,
    // Neon 등 클라우드 DB 는 SSL 필요, 로컬 Docker 는 불필요.
    ssl:
      connectionString && !connectionString.includes("localhost")
        ? { rejectUnauthorized: false }
        : undefined,
    max: 5,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg._pgPool = pool;
}

// 간단한 쿼리 헬퍼. 결과 행 배열을 반환한다.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}
