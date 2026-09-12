import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-field flex min-h-[100dvh] items-center justify-center px-4">
      <div className="jrpg-window jrpg-rivets max-w-md p-8 text-center">
        <h1 className="pixel-text text-gold text-sm leading-relaxed">
          404 — Quest not found
        </h1>
        <p className="mt-4 text-sm text-ink-dim font-body">
          This path leads off the map. Return to the board and continue your
          adventure.
        </p>
        <Link href="/" className="btn-jrpg btn-primary mt-6 inline-flex px-6 py-2.5 text-[10px]">
          Return Home
        </Link>
      </div>
    </div>
  );
}
