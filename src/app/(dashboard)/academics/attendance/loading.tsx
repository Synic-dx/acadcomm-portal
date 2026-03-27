export default function AttendanceLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="h-7 w-36 rounded-lg bg-zinc-100" />
      <div className="space-y-3">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="rounded-xl border border-zinc-100 bg-white px-5 py-4 flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-4 w-32 rounded bg-zinc-100" />
              <div className="h-3 w-20 rounded bg-zinc-100" />
            </div>
            <div className="h-6 w-16 rounded-full bg-zinc-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
