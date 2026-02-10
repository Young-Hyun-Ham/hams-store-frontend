"use client";

import { useEffect, useState } from "react";
import FcmTokenBox from "@/components/FcmTokenBox";
import { getOrCreateUUID } from "@/lib/utils";

export default function Page() {
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const uuid = getOrCreateUUID();
    setUserId(uuid);
  }, []);

  if (!userId) return null; // hydration 방지

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">FCM 테스트</h1>
      <FcmTokenBox userId={userId} />
    </main>
  );
}
