import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUpcomingExams, getDaySchedule, formatDate, toDateStr } from '@/data/timetable'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, Clock, BookOpen } from 'lucide-react'

const examTypeBadge: Record<string, string> = {
  quiz: 'bg-amber-100 text-amber-700',
  midterm: 'bg-blue-100 text-blue-700',
  endterm: 'bg-red-100 text-red-700',
}

const sessionTypeDot: Record<string, string> = {
  lecture: 'bg-zinc-900',
  quiz: 'bg-amber-500',
  midterm: 'bg-blue-500',
  endterm: 'bg-red-500',
  activity: 'bg-emerald-500',
  event: 'bg-purple-500',
  tutorial: 'bg-sky-500',
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

  const upcomingExams = getUpcomingExams(section, 5)
  const todayClasses = getDaySchedule(todayStr, section).filter(
    (s) => s.type !== 'activity'
  )
  const tomorrowClasses = getDaySchedule(tomorrowStr, section).filter(
    (s) => s.type !== 'activity'
  )

  const isSunday = (d: Date) => d.getDay() === 0

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">
          Good {getGreeting()}, {name}
        </h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Section {section} · {formatDate(todayStr)}
        </p>
      </div>

      {/* Exam timeline */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
          Upcoming Evaluations
        </h2>
        {upcomingExams.length === 0 ? (
          <Card className="border-zinc-100 shadow-none">
            <CardContent className="py-8 text-center text-sm text-zinc-400">
              No upcoming exams found. Enjoy the break!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingExams.map((exam, i) => {
              const daysLeft = Math.ceil(
                (new Date(exam.date + 'T00:00:00').getTime() - today.setHours(0, 0, 0, 0)) /
                  (1000 * 60 * 60 * 24)
              )
              return (
                <Card key={i} className="border-zinc-100 shadow-none hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${examTypeBadge[exam.type] ?? 'bg-zinc-100 text-zinc-600'}`}
                      >
                        {exam.type}
                      </span>
                      <span className="text-xs text-zinc-400 whitespace-nowrap">
                        {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `in ${daysLeft}d`}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-zinc-900 leading-snug">
                      {exam.subject}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatDate(exam.date)} · {exam.start}–{exam.end}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Today + Tomorrow schedule */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ScheduleCard
          title="Today"
          dateStr={todayStr}
          sessions={todayClasses}
          isSunday={isSunday(today)}
        />
        <ScheduleCard
          title="Tomorrow"
          dateStr={tomorrowStr}
          sessions={tomorrowClasses}
          isSunday={isSunday(tomorrow)}
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

const sessionTypeDotClient: Record<string, string> = {
  lecture: 'bg-zinc-900',
  quiz: 'bg-amber-500',
  midterm: 'bg-blue-500',
  endterm: 'bg-red-500',
  activity: 'bg-emerald-500',
  event: 'bg-purple-500',
  tutorial: 'bg-sky-500',
}

function ScheduleCard({
  title,
  dateStr,
  sessions,
  isSunday,
}: {
  title: string
  dateStr: string
  sessions: ReturnType<typeof getDaySchedule>
  isSunday: boolean
}) {
  return (
    <Card className="border-zinc-100 shadow-none">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold text-zinc-700 flex items-center gap-1.5">
          <CalendarDays size={14} className="text-zinc-400" />
          {title}
          <span className="font-normal text-zinc-400 text-xs ml-1">{formatDate(dateStr)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {isSunday ? (
          <p className="text-sm text-zinc-400 py-2">Sunday — no classes</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-zinc-400 py-2">No classes scheduled</p>
        ) : (
          <ul className="space-y-2">
            {sessions.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${sessionTypeDotClient[s.type] ?? 'bg-zinc-400'}`}
                />
                <div>
                  <p className="text-sm font-medium text-zinc-900 leading-tight">{s.subject}</p>
                  <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                    <Clock size={10} />
                    {s.start}–{s.end}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
