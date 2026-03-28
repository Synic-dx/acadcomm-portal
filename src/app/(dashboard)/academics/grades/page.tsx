import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCourses } from '@/lib/timetable-db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Term } from '@/data/timetable'

export default async function GradesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: termsData } = await supabase
    .from('terms')
    .select('*')
    .order('start_date', { ascending: true })

  const terms = (termsData ?? []) as Term[]
  const activeTerm = terms.find(t => t.is_active) ?? null
  const activeTermCourses = activeTerm ? await getCourses(activeTerm.id) : []

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Grades</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Existing &amp; forecasted grades by term</p>
      </div>

      {terms.length === 0 ? (
        <p className="text-sm text-zinc-400 py-4">No terms found. Ask your admin to set up terms.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {terms.map(t => (
            <Card
              key={t.id}
              className="border-zinc-100 shadow-none hover:shadow-sm transition-shadow cursor-pointer group"
            >
              <CardHeader className="pb-2 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-zinc-900 group-hover:text-black">
                    {t.name}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={
                      t.is_active
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 text-xs'
                        : 'border-zinc-200 text-zinc-400 text-xs'
                    }
                  >
                    {t.is_active ? 'In Progress' : 'Completed'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <p className="text-sm text-zinc-400">
                  {t.is_active
                    ? 'Grades will be populated as evaluations are completed.'
                    : 'Grades locked after term completion.'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTerm && (
        <div className="rounded-xl border border-zinc-100 p-6 bg-white space-y-4">
          <h2 className="text-sm font-semibold text-zinc-700">{activeTerm.name} — Current Grades</h2>
          <p className="text-sm text-zinc-400">
            Grade data will be displayed here once evaluations are recorded by the Academic Committee.
          </p>
          {activeTermCourses.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {activeTermCourses.map(course => (
                <div key={course.id} className="rounded-lg border border-zinc-100 p-3">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">{course.abbreviation}</p>
                  <p className="mt-0.5 text-xs text-zinc-400 truncate">{course.name}</p>
                  <p className="mt-1 text-2xl font-bold text-zinc-200">—</p>
                  <p className="text-xs text-zinc-300 mt-0.5">Pending</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No courses added for this term yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
