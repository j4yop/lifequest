"use client";

import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";
import {
  WarningCircle,
  CheckCircle,
  Info,
  X,
} from "@phosphor-icons/react";
import { useGameStore, type Toast } from "@/lib/game/store";

const emptySubscribe = () => () => {};

function ToastCard({ toast }: { toast: Toast }) {
  const dismiss = useGameStore((s) => s.dismissToast);
  const icons = {
    info: <Info size={16} weight="bold" aria-hidden="true" />,
    success: <CheckCircle size={16} weight="bold" aria-hidden="true" />,
    danger: <WarningCircle size={16} weight="bold" aria-hidden="true" />,
  };
  const tones = {
    info: "border-window-border-bright text-ink",
    success: "border-rarity-uncommon/60 text-ink",
    danger: "border-danger/60 text-ink",
  };
  const iconTones = {
    info: "text-ink-dim",
    success: "text-rarity-uncommon",
    danger: "text-danger",
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`jrpg-window flex items-center gap-3 px-4 py-3 text-sm font-body shadow-xl list-none ${tones[toast.kind]}`}
    >
      <span className={iconTones[toast.kind]}>{icons[toast.kind]}</span>
      <p className="flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => dismiss(toast.id)}
        className="text-ink-faint hover:text-ink transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={14} weight="bold" aria-hidden="true" />
      </button>
    </motion.li>
  );
}

/** Toast viewport — fixed bottom-right, portal'd after mount. */
export function Toaster() {
  const toasts = useGameStore((s) => s.toasts);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed bottom-4 right-4 z-[70] flex w-[min(92vw,360px)] flex-col gap-2"
      role="region"
      aria-label="Notifications"
    >
      <ul className="flex flex-col gap-2" aria-live="polite">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <ToastCard key={t.id} toast={t} />
          ))}
        </AnimatePresence>
      </ul>
    </div>,
    document.body
  );
}
