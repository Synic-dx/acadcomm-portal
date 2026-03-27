export default function AdminLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-10 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-36 rounded-lg bg-zinc-100" />
        <div className="h-4 w-56 rounded-lg bg-zinc-100" />
      </div>

      {/* Timetable uploader skeleton */}
      <div className="max-w-2xl space-y-4">
        <div className="h-3 w-28 rounded bg-zinc-100" />
        <div className="h-32 rounded-xl border-2 border-dashed border-zinc-100 bg-white" />
      </div>

      <div className="border-t border-zinc-100" />

      {/* Exam section skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 rounded bg-zinc-100" />
          <div className="flex gap-2">
            <div className="h-8 w-32 rounded-md bg-zinc-100" />
            <div className="h-8 w-24 rounded-md bg-zinc-100" />
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-zinc-100 px-4 py-3">
            <div className="h-5 w-14 rounded-full bg-zinc-100" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-1/2 rounded bg-zinc-100" />
              <div className="h-2 w-1/3 rounded bg-zinc-100" />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-100" />

      {/* User table skeleton */}
      <div className="space-y-3">
        <div className="h-3 w-28 rounded bg-zinc-100" />
        <div className="rounded-lg border border-zinc-100 overflow-hidden">
          <div className="bg-zinc-50 px-4 py-2.5 flex gap-8">
            {['w-24', 'w-32', 'w-16', 'w-20'].map((w, i) => (
              <div key={i} className={`h-2 ${w} rounded bg-zinc-200`} />
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-4 py-3 flex gap-8 border-t border-zinc-100">
              {['w-24', 'w-36', 'w-12', 'w-16'].map((w, j) => (
                <div key={j} className={`h-3 ${w} rounded bg-zinc-100`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
