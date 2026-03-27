import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'

const mockCourses = [
  { course: 'DMG', attended: 3, total: 4, required: 75 },
  { course: 'LA', attended: 7, total: 9, required: 75 },
  { course: 'ETH', attended: 2, total: 2, required: 75 },
  { course: 'MIE-II', attended: 4, total: 6, required: 75 },
  { course: 'FRM', attended: 2, total: 3, required: 75 },
  { course: 'SI', attended: 1, total: 1, required: 75 },
  { course: 'ITD', attended: 3, total: 3, required: 75 },
]

export default function AttendancePage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Attendance Tracker</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Term III — minimum {mockCourses[0].required}% required per course
        </p>
      </div>

      <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 flex gap-3 items-start">
        <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-700">
          Attendance data is indicative and will be officially maintained by faculty. Please verify with your course coordinators.
        </p>
      </div>

      <div className="space-y-3">
        {mockCourses.map((c) => {
          const pct = Math.round((c.attended / c.total) * 100)
          const ok = pct >= c.required
          return (
            <div key={c.course} className="rounded-xl border border-zinc-100 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-zinc-900">{c.course}</p>
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
                </div>
                <p className="text-xs text-zinc-400">
                  {c.attended}/{c.total} classes
                </p>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${ok ? 'bg-zinc-900' : 'bg-red-400'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {!ok && (
                <p className="mt-1.5 text-xs text-red-500">
                  Need {Math.ceil((c.required / 100) * c.total - c.attended)} more classes to reach {c.required}%
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
