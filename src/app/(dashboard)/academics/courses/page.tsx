import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveTerm, getCourses, getActiveTimetable } from '@/lib/timetable-db'
import { ExternalLink, BookOpen, FolderOpen, CalendarDays, ClipboardCheck } from 'lucide-react'
import type { Course, Session } from '@/data/timetable'

function getScheduleForCourse(
  timetable: { date: string; sectionA: Session[]; sectionB: Session[] }[],
  abbreviation: string,
  section: 'A' | 'B'
): { date: string; sessions: Session[] }[] {
  const today = new Date().toISOString().slice(0, 10)
  return timetable
    .filter(day => day.date >= today)
    .map(day => ({
      date: day.date,
      sessions: (section === 'A' ? day.sectionA : day.sectionB).filter(
        s => s.subject === abbreviation || s.subject.startsWith(abbreviation + ' ')
      ),
    }))
    .filter(d => d.sessions.length > 0)
    .slice(0, 5)
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default async function CoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('section')
    .eq('id', user.id)
    .single()

  const section = (profile?.section ?? 'A') as 'A' | 'B'

  const [activeTerm, timetable] = await Promise.all([
    getActiveTerm(),
    getActiveTimetable(),
  ])

  let courses: Course[] = []
  let attendanceStats: Record<string, { present: number; total: number }> = {}
  let upcomingExams: Record<string, { date: string; type: string; start: string; end: string }[]> = {}

  if (activeTerm) {
    courses = await getCourses(activeTerm.id)

    const todayStr = new Date().toISOString().slice(0, 10)
    const courseIds = courses.map(c => c.id)

    const [attendanceRes, examsRes] = await Promise.all([
      courseIds.length > 0
        ? supabase
            .from('attendance')
            .select('course_id, status')
            .eq('user_id', user.id)
            .in('course_id', courseIds)
        : Promise.resolve({ data: [] }),
      courseIds.length > 0
        ? supabase
            .from('exams')
            .select('course_id, date, type, start, end')
            .in('course_id', courseIds)
            .eq('status', 'approved')
            .gte('date', todayStr)
            .order('date')
        : Promise.resolve({ data: [] }),
    ])

    for (const row of attendanceRes.data ?? []) {
      const cid = row.course_id as string
      if (!attendanceStats[cid]) attendanceStats[cid] = { present: 0, total: 0 }
      attendanceStats[cid].total++
      if (row.status === 'present') attendanceStats[cid].present++
    }

    for (const row of examsRes.data ?? []) {
      const cid = row.course_id as string
      if (!upcomingExams[cid]) upcomingExams[cid] = []
      upcomingExams[cid].push({
        date: row.date,
        type: row.type,
        start: row.start?.slice(0, 5) ?? '',
        end: row.end?.slice(0, 5) ?? '',
      })
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900">Courses</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {activeTerm
            ? `${activeTerm.name} · Section ${section}`
            : 'No active term — ask your admin to create and activate one.'}
        </p>
      </div>

      {courses.length === 0 && (
        <p className="text-sm text-zinc-400 py-8 text-center">
          {activeTerm
            ? 'No courses have been added for this term yet.'
            : 'No active term found.'}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {courses.map(course => {
          const stats = attendanceStats[course.id]
          const exams = upcomingExams[course.id] ?? []
          const schedule = getScheduleForCourse(timetable, course.abbreviation, section)
          const attendancePct = stats && stats.total > 0
            ? Math.round((stats.present / stats.total) * 100)
            : null

          return (
            <div key={course.id} className="rounded-xl border border-zinc-100 bg-white overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-zinc-50 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-mono font-medium text-zinc-700 shrink-0">
                      {course.abbreviation}
                    </span>
                    {course.credits != null && (
                      <span className="text-xs text-zinc-400">{course.credits} cr</span>
                    )}
                  </div>
                  <h2 className="mt-1 text-sm font-semibold text-zinc-900 leading-tight">{course.name}</h2>
                </div>
                {attendancePct !== null && (
                  <div className="shrink-0 text-right">
                    <span className={`text-lg font-bold ${attendancePct < 75 ? 'text-red-500' : 'text-emerald-600'}`}>
                      {attendancePct}%
                    </span>
                    <p className="text-xs text-zinc-400 leading-tight">
                      {stats!.present}/{stats!.total} classes
                    </p>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="px-5 py-3 space-y-3">
                {/* Upcoming schedule */}
                {schedule.length > 0 && (
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5">
                      <CalendarDays size={11} /> Upcoming classes
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {schedule.slice(0, 4).map(d => (
                        <span key={d.date} className="inline-flex items-center rounded-md bg-zinc-50 border border-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                          {formatDate(d.date)} · {d.sessions[0].start}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upcoming exams */}
                {exams.length > 0 && (
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5">
                      <ClipboardCheck size={11} /> Upcoming evaluations
                    </p>
                    <div className="space-y-1">
                      {exams.slice(0, 3).map((e, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="capitalize text-amber-700 font-medium bg-amber-50 rounded px-1.5 py-0.5">{e.type}</span>
                          <span className="text-zinc-500">{formatDate(e.date)} · {e.start}–{e.end}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links */}
                {(course.outline_link || course.notes_folder_link) && (
                  <div className="flex items-center gap-3 pt-1 border-t border-zinc-50">
                    {course.outline_link && (
                      <a
                        href={course.outline_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        <BookOpen size={11} /> Course Outline
                        <ExternalLink size={9} />
                      </a>
                    )}
                    {course.notes_folder_link && (
                      <a
                        href={course.notes_folder_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        <FolderOpen size={11} /> Notes Folder
                        <ExternalLink size={9} />
                      </a>
                    )}
                  </div>
                )}

                {schedule.length === 0 && exams.length === 0 && !course.outline_link && !course.notes_folder_link && (
                  <p className="text-xs text-zinc-400 py-1">No upcoming classes or evaluations.</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
