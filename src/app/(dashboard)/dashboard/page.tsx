import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate, toDateStr } from '@/data/timetable'
import { getActiveTimetable, getDayScheduleFromData, getUpcomingExams, getActiveTerm, getCourses } from '@/lib/timetable-db'
import { Card, CardContent } from '@/components/ui/card'
import { Clock } from 'lucide-react'

import { ScheduleCard } from '@/components/schedule-card'
import type { AttendanceMap } from '@/components/schedule-card'

const examTypeBadge: Record<string, string> = {
  quiz: 'bg-amber-100 text-amber-700',
  midterm: 'bg-blue-100 text-blue-700',
  endterm: 'bg-red-100 text-red-700',
  assignment: 'bg-purple-100 text-purple-700',
  viva: 'bg-orange-100 text-orange-700',
  other: 'bg-zinc-100 text-zinc-600',
}

const examTypeDot: Record<string, string> = {
  quiz: 'bg-amber-400',
  midterm: 'bg-blue-500',
  endterm: 'bg-red-500',
  assignment: 'bg-purple-500',
  viva: 'bg-orange-400',
  other: 'bg-zinc-400',
}


export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, section')
    .eq('id', user.id)
    .single()

  const section = (profile?.section as 'A' | 'B') ?? 'A'
  const name = profile?.full_name?.split(' ')[0] ?? 'there'

  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const todayStr = toDateStr(today)
  const tomorrowStr = toDateStr(tomorrow)

  const [activeTimetable, upcomingExams, activeTerm] = await Promise.all([
    getActiveTimetable(),
    getUpcomingExams(section, 10),
    getActiveTerm(),
  ])

  // Build subject abbreviation → course_id map for attendance linking
  const courseIdMap: Record<string, string> = {}
  if (activeTerm) {
    const courses = await getCourses(activeTerm.id)
    for (const c of courses) courseIdMap[c.abbreviation] = c.id
  }
  const todayClasses = getDayScheduleFromData(activeTimetable, todayStr, section).filter(
    (s) => s.type !== 'activity'
  )
  const tomorrowClasses = getDayScheduleFromData(activeTimetable, tomorrowStr, section).filter(
    (s) => s.type !== 'activity'
  )

  // Fetch attendance for today + tomorrow
  const { data: attendanceRows } = await supabase
    .from('attendance')
    .select('date, subject, start, status')
    .eq('user_id', user.id)
    .in('date', [todayStr, tomorrowStr])

  const attendanceMap: AttendanceMap = {}
  for (const r of attendanceRows ?? []) {
    attendanceMap[`${r.date}|${r.subject}|${r.start}`] = r.status as 'present' | 'absent'
  }

  // Fetch total absence counts per subject (all time)
  const { data: absenceRows } = await supabase
    .from('attendance')
    .select('subject')
    .eq('user_id', user.id)
    .eq('status', 'absent')

  const absenceCounts: Record<string, number> = {}
  for (const r of absenceRows ?? []) {
    absenceCounts[r.subject] = (absenceCounts[r.subject] ?? 0) + 1
  }

  const isSunday = (d: Date) => d.getDay() === 0

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900">
          Good {getGreeting()}, {name}
        </h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Section {section} · {formatDate(todayStr)}
        </p>
      </div>

      {/* Exam timeline */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
          Upcoming Evaluations
        </h2>
        {upcomingExams.length === 0 ? (
          <Card className="border-zinc-100 shadow-none">
            <CardContent className="py-8 text-center text-sm text-zinc-400">
              No upcoming exams. Enjoy the break!
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-16 sm:left-[5.5rem] top-0 bottom-0 w-px bg-zinc-100" />
            <div className="space-y-0">
              {upcomingExams.map((exam, i) => {
                const examDate = new Date(exam.date + 'T00:00:00')
                const todayMid = new Date(today)
                todayMid.setHours(0, 0, 0, 0)
                const daysLeft = Math.ceil((examDate.getTime() - todayMid.getTime()) / (1000 * 60 * 60 * 24))
                const isToday = daysLeft === 0
                const isTomorrow = daysLeft === 1
                const dotColor = examTypeDot[exam.type] ?? 'bg-zinc-400'
                return (
                  <div key={i} className="relative flex items-start gap-3 sm:gap-4 pb-5 last:pb-0">
                    {/* Date column */}
                    <div className="w-14 sm:w-20 shrink-0 pt-0.5 text-right">
                      <p className="text-xs font-semibold text-zinc-900 leading-tight">
                        {examDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-[10px] text-zinc-400 leading-tight mt-0.5">
                        {examDate.toLocaleDateString('en-IN', { weekday: 'short' })}
                      </p>
                    </div>

                    {/* Dot on the line */}
                    <div className="relative z-10 mt-1 shrink-0">
                      <div className={`h-3 w-3 rounded-full ring-2 ring-white ${dotColor}`} />
                    </div>

                    {/* Content */}
                    <div className={`flex-1 min-w-0 rounded-lg border px-3 py-2.5 sm:px-4 sm:py-3 ${isToday ? 'border-zinc-200 bg-zinc-900' : 'border-zinc-100 bg-white'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold leading-tight break-words ${isToday ? 'text-white' : 'text-zinc-900'}`}>
                          {exam.subject}
                        </p>
                        <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${isToday ? 'bg-white/20 text-white' : (examTypeBadge[exam.type] ?? 'bg-zinc-100 text-zinc-600')}`}>
                          {exam.type}
                        </span>
                      </div>
                      <div className={`mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs ${isToday ? 'text-zinc-300' : 'text-zinc-400'}`}>
                        <span className="flex items-center gap-1"><Clock size={10} />{exam.start}–{exam.end}</span>
                        {isToday && <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-medium text-white">Today</span>}
                        {isTomorrow && <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">Tomorrow</span>}
                        {!isToday && !isTomorrow && <span>in {daysLeft}d</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {/* Today + Tomorrow schedule */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ScheduleCard
          title="Today"
          dateStr={todayStr}
          formattedDate={formatDate(todayStr)}
          sessions={todayClasses}
          isSunday={isSunday(today)}
          initialAttendance={attendanceMap}
          absenceCounts={absenceCounts}
          courseIdMap={courseIdMap}
        />
        <ScheduleCard
          title="Tomorrow"
          dateStr={tomorrowStr}
          formattedDate={formatDate(tomorrowStr)}
          sessions={tomorrowClasses}
          isSunday={isSunday(tomorrow)}
          initialAttendance={attendanceMap}
          absenceCounts={absenceCounts}
          courseIdMap={courseIdMap}
        />
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

