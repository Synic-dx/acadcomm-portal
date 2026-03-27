import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const terms = [
  { term: 'Term I', status: 'completed', slug: 'term-1' },
  { term: 'Term II', status: 'completed', slug: 'term-2' },
  { term: 'Term III', status: 'ongoing', slug: 'term-3' },
]

export default function GradesPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Grades</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Existing & forecasted grades by term</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {terms.map((t) => (
          <Card
            key={t.slug}
            className="border-zinc-100 shadow-none hover:shadow-sm transition-shadow cursor-pointer group"
          >
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-zinc-900 group-hover:text-black">
                  {t.term}
                </CardTitle>
                <Badge
                  variant="outline"
                  className={
                    t.status === 'ongoing'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 text-xs'
                      : 'border-zinc-200 text-zinc-400 text-xs'
                  }
                >
                  {t.status === 'ongoing' ? 'In Progress' : 'Completed'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <p className="text-sm text-zinc-400">
                {t.status === 'ongoing'
                  ? 'Grades will be populated as evaluations are completed.'
                  : 'Grades locked after term completion.'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-100 p-6 bg-white space-y-4">
        <h2 className="text-sm font-semibold text-zinc-700">Term III — Current Grades</h2>
        <p className="text-sm text-zinc-400">
          Grade data will be displayed here once evaluations are recorded by the Academic Committee.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {['DMG', 'LA', 'ETH', 'MIE-II', 'FRM', 'SI', 'ITD', 'PS'].map((course) => (
            <div key={course} className="rounded-lg border border-zinc-100 p-3">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">{course}</p>
              <p className="mt-1 text-2xl font-bold text-zinc-200">—</p>
              <p className="text-xs text-zinc-300 mt-0.5">Pending</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
