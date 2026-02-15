// app/(sidebar-header)/admin/PushBootstrapper.tsx
"use client";

import { useFcmToken } from "@/lib/push/useFcmToken";
import { getOwnerId } from "@/lib/owner";

export default function AdminPushBootstrapper() {
  const ownerId = getOwnerId(); // 미리 localStorage에 넣어둬야 함
  useFcmToken(ownerId);
  return null;
}