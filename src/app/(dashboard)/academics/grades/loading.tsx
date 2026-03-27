export default function GradesLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="h-7 w-24 rounded-lg bg-zinc-100" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-zinc-100 bg-white p-5 space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-20 rounded bg-zinc-100" />
              <div className="h-5 w-16 rounded-full bg-zinc-100" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1,2,3,4,5,6,7,8].map(j => (
                <div key={j} className="h-8 rounded bg-zinc-100" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
