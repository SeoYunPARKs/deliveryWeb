"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";

export function FavoriteButton({
  restaurantId,
  initialFavorited,
}: {
  restaurantId: number;
  initialFavorited: boolean;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [fav, setFav] = useState(initialFavorited);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!user) {
      router.push("/login");
      return;
    }
    setBusy(true);
    try {
      if (fav) {
        await fetch(`/api/favorites?restaurantId=${restaurantId}`, { method: "DELETE" });
        setFav(false);
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ restaurantId }),
        });
        setFav(true);
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={fav ? "찜 해제" : "찜하기"}
      title={fav ? "찜 해제" : "찜하기"}
      className="text-2xl leading-none transition-transform hover:scale-110 disabled:opacity-50"
    >
      {fav ? "❤️" : "🤍"}
    </button>
  );
}
