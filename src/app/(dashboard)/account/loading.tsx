export default function AccountLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-xl mx-auto space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-24 rounded-lg bg-zinc-100" />
        <div className="h-4 w-48 rounded-lg bg-zinc-100" />
      </div>

      <div className="space-y-5">
        <div className="h-3 w-16 rounded bg-zinc-100" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="h-2 w-20 rounded bg-zinc-100" />
            <div className="h-10 rounded-lg bg-zinc-100" />
          </div>
          <div className="space-y-1.5">
            <div className="h-2 w-16 rounded bg-zinc-100" />
            <div className="h-10 rounded-lg bg-zinc-100" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="h-2 w-24 rounded bg-zinc-100" />
          <div className="h-10 rounded-lg bg-zinc-100" />
        </div>
        <div className="space-y-2">
          <div className="h-2 w-36 rounded bg-zinc-100" />
          <div className="flex gap-2">
            {[1,2,3,4,5].map(i => <div key={i} className="h-8 w-20 rounded-full bg-zinc-100" />)}
          </div>
        </div>
        <div className="h-10 rounded-lg bg-zinc-100" />
      </div>
    </div>
  )
}
