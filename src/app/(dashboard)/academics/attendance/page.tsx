import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveTerm, getCourses } from '@/lib/timetable-db'
import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'

const REQUIRED_PCT = 75

export default async function AttendancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const activeTerm = await getActiveTerm()

  if (!activeTerm) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Attendance Tracker</h1>
          <p className="text-sm text-zinc-500 mt-0.5">No active term found.</p>
        </div>
        <p className="text-sm text-zinc-400">Ask your admin to create and activate a term.</p>
      </div>
    )
  }

  const courses = await getCourses(activeTerm.id)

  const courseIds = courses.map(c => c.id)
  const { data: attendanceRows } = courseIds.length > 0
    ? await supabase
        .from('attendance')
        .select('course_id, status')
        .eq('user_id', user.id)
        .in('course_id', courseIds)
    : { data: [] }

  const stats: Record<string, { present: number; total: number }> = {}
  for (const row of attendanceRows ?? []) {
    const cid = row.course_id as string
    if (!cid) continue
    if (!stats[cid]) stats[cid] = { present: 0, total: 0 }
    stats[cid].total++
    if (row.status === 'present') stats[cid].present++
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Attendance Tracker</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {activeTerm.name} — minimum {REQUIRED_PCT}% required per course
        </p>
      </div>

      <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 flex gap-3 items-start">
        <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-700">
          Attendance is self-reported from your dashboard. Official records are maintained by faculty.
        </p>
      </div>

      {courses.length === 0 ? (
        <p className="text-sm text-zinc-400 py-4">No courses added for this term yet.</p>
      ) : (
        <div className="space-y-3">
          {courses.map(course => {
            const s = stats[course.id]
            const attended = s?.present ?? 0
            const total = s?.total ?? 0
            const pct = total > 0 ? Math.round((attended / total) * 100) : null
            const ok = pct !== null ? pct >= REQUIRED_PCT : true

            return (
              <div key={course.id} className="rounded-xl border border-zinc-100 bg-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-zinc-900">{course.name}</p>
                    <span className="text-xs text-zinc-400 font-mono">{course.abbreviation}</span>
                    {pct !== null && (
                      <Badge
                        variant="outline"
                        className={
                          ok
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 text-xs'
                            : 'border-red-200 bg-red-50 text-red-600 text-xs'
                        }
                      >
                        {pct}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">
                    {total > 0 ? `${attended}/${total} classes` : 'No data'}
                  </p>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${pct === null ? 'w-0' : ok ? 'bg-zinc-900' : 'bg-red-400'}`}
                    style={{ width: pct !== null ? `${pct}%` : '0%' }}
                  />
                </div>
                {pct !== null && !ok && total > 0 && (
                  <p className="mt-1.5 text-xs text-red-500">
                    Need {Math.ceil((REQUIRED_PCT / 100) * total - attended)} more classes to reach {REQUIRED_PCT}%
                  </p>
                )}
                {pct === null && (
                  <p className="mt-1.5 text-xs text-zinc-400">Mark attendance from the dashboard to track here.</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
