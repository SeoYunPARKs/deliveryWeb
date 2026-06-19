import Link from "next/link";
import { getSessionUser } from "@/app/lib/auth";
import { query } from "@/app/lib/db";
import { AddressManager } from "@/app/components/AddressManager";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const user = await getSessionUser();
  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">로그인이 필요합니다.</p>
        <Link href="/login" className="inline-block mt-4 rounded-md bg-teal-600 text-white px-4 py-2">
          로그인
        </Link>
      </div>
    );
  }

  const addresses = await query<{ id: number; label: string | null; address: string }>(
    "SELECT id, label, address FROM user_addresses WHERE user_id = $1 ORDER BY id DESC",
    [user.id],
  );

  return (
    <div>
      <Link href="/mypage" className="text-sm text-zinc-500 hover:text-zinc-800">
        ← 마이페이지
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">📍 주소 관리</h1>
      <AddressManager initial={addresses} />
    </div>
  );
}
