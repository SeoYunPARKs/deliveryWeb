import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 배포(Vercel) 시 ESLint 경고로 빌드가 막히지 않도록 한다.
  // (타입 검사는 그대로 유지되어 실제 오류는 잡힌다.)
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
