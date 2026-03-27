export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-lg bg-zinc-100" />
        <div className="h-4 w-32 rounded-lg bg-zinc-100" />
      </div>

      {/* Upcoming evaluations */}
      <div className="space-y-3">
        <div className="h-3 w-36 rounded bg-zinc-100" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-14 sm:w-20 space-y-1 text-right">
                <div className="h-3 w-full rounded bg-zinc-100 ml-auto" />
                <div className="h-2 w-8 rounded bg-zinc-100 ml-auto" />
              </div>
              <div className="mt-1 h-3 w-3 rounded-full bg-zinc-200 shrink-0" />
              <div className="flex-1 rounded-lg border border-zinc-100 bg-white px-4 py-3 space-y-1.5">
                <div className="h-3 w-2/3 rounded bg-zinc-100" />
                <div className="h-2 w-1/3 rounded bg-zinc-100" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-zinc-100 bg-white p-5 space-y-4">
            <div className="h-4 w-24 rounded bg-zinc-100" />
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-zinc-200 shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-3/4 rounded bg-zinc-100" />
                  <div className="h-2 w-1/3 rounded bg-zinc-100" />
                </div>
                <div className="flex gap-1.5">
                  <div className="h-8 w-8 rounded-full bg-zinc-100" />
                  <div className="h-8 w-8 rounded-full bg-zinc-100" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
