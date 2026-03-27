export default function LinksLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="h-7 w-36 rounded-lg bg-zinc-100" />
      <div className="space-y-2">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="rounded-xl border border-zinc-100 bg-white px-5 py-4 flex items-center gap-3">
            <div className="h-4 w-4 rounded bg-zinc-100 shrink-0" />
            <div className="h-4 w-48 rounded bg-zinc-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
