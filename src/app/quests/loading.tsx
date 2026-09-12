export default function Loading() {
  return (
    <div className="page-field">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
        <div className="mb-6 space-y-3">
          <div className="h-5 w-40 animate-pulse rounded bg-window-raised/50" />
          <div className="h-3.5 w-64 animate-pulse rounded bg-window-raised/40" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            {/* character skeleton */}
            <div className="jrpg-window overflow-hidden">
              <div className="border-b-2 border-window-border/60 px-5 py-3">
                <div className="h-3 w-24 animate-pulse rounded bg-window-raised/60" />
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 animate-pulse rounded-full bg-window-raised/50" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-28 animate-pulse rounded bg-window-raised/50" />
                    <div className="h-3 w-20 animate-pulse rounded bg-window-raised/40" />
                    <div className="h-3 w-32 animate-pulse rounded bg-window-raised/40" />
                  </div>
                </div>
                <div className="h-4 w-full animate-pulse rounded bg-window-raised/40" />
              </div>
            </div>
            {/* attributes skeleton */}
            <div className="jrpg-window overflow-hidden">
              <div className="border-b-2 border-window-border/60 px-5 py-3">
                <div className="h-3 w-20 animate-pulse rounded bg-window-raised/60" />
              </div>
              <ul className="divide-y divide-window-border/30">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <li key={i} className="flex items-center gap-3 px-5 py-3">
                    <div className="h-8 w-8 animate-pulse rounded-[6px] bg-window-raised/50" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-24 animate-pulse rounded bg-window-raised/50" />
                      <div className="h-1.5 w-full animate-pulse rounded bg-window-raised/40" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* quest board skeleton */}
          <div className="jrpg-window overflow-hidden">
            <div className="border-b-2 border-window-border/60 px-5 py-3">
              <div className="h-3 w-24 animate-pulse rounded bg-window-raised/60" />
            </div>
            <ul className="divide-y divide-window-border/30">
              {[0, 1, 2, 3, 4].map((i) => (
                <li key={i} className="flex items-center gap-3 px-5 py-4">
                  <div className="h-9 w-9 animate-pulse rounded-[6px] bg-window-raised/50" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-2/3 animate-pulse rounded bg-window-raised/50" />
                    <div className="h-3 w-1/4 animate-pulse rounded bg-window-raised/40" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
