"use client";

import { useEffect } from "react";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Quest board error:", error);
  }, [error]);

  return (
    <div className="page-field flex min-h-[100dvh] items-center justify-center px-4">
      <div className="jrpg-window jrpg-rivets max-w-md p-8 text-center">
        <h1 className="pixel-text text-gold text-sm leading-relaxed">
          A wild error appears!
        </h1>
        <p className="mt-4 text-sm text-ink-dim font-body">
          The guild ledger could not be reached. Your progress is safe — it
          lives on the server.
        </p>
        <button onClick={retry} className="btn-jrpg btn-primary mt-6 px-6 py-2.5 text-[10px]">
          Try Again
        </button>
      </div>
    </div>
  );
}
