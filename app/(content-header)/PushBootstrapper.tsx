// app/(content-header)/PushBootstrapper.tsx
"use client";

import { useFcmToken } from "@/lib/push/useFcmToken";
import { getOrCreateCustomerId } from "@/lib/customer";

export default function PushBootstrapper() {
  const userId = getOrCreateCustomerId();
  useFcmToken(userId);
  return null;
}

