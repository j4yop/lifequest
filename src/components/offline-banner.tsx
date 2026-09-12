"use client";

import { useSyncExternalStore } from "react";
import { WifiSlash } from "@phosphor-icons/react";

const subscribe = (cb: () => void) => {
  window.addEventListener("offline", cb);
  window.addEventListener("online", cb);
  return () => {
    window.removeEventListener("offline", cb);
    window.removeEventListener("online", cb);
  };
};

/**
 * Offline banner — listens to browser online/offline events via
 * useSyncExternalStore (no setState-in-effect).
 */
export function OfflineBanner() {
  const offline = useSyncExternalStore(
    subscribe,
    () => !navigator.onLine,
    () => false
  );

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[80] flex items-center justify-center gap-2 border-b-2 border-danger/60 bg-window-deep/95 px-4 py-2.5 text-sm text-ink font-body backdrop-blur"
    >
      <WifiSlash size={16} weight="bold" className="text-danger" aria-hidden="true" />
      You are offline — quests will sync when the connection returns.
    </div>
  );
}
