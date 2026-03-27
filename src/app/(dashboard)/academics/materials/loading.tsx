export default function MaterialsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="h-7 w-36 rounded-lg bg-zinc-100" />
      <div className="grid gap-3 sm:grid-cols-2">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="rounded-xl border border-zinc-100 bg-white p-4 space-y-2">
            <div className="h-4 w-3/4 rounded bg-zinc-100" />
            <div className="h-3 w-1/2 rounded bg-zinc-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
