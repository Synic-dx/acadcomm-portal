'use client'

import { useState } from 'react'
import { CalendarDays, Clock, Check, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Session } from '@/data/timetable'

const sessionTypeDot: Record<string, string> = {
  lecture: 'bg-zinc-900',
  quiz: 'bg-amber-500',
  midterm: 'bg-blue-500',
  endterm: 'bg-red-500',
  activity: 'bg-emerald-500',
  event: 'bg-purple-500',
  tutorial: 'bg-sky-500',
}

export type AttendanceMap = Record<string, 'present' | 'absent'> // key: `${date}|${subject}|${start}`

type Props = {
  title: string
  dateStr: string
  formattedDate: string
  sessions: Session[]
  isSunday: boolean
  initialAttendance: AttendanceMap
  absenceCounts: Record<string, number> // subject → total absences
}

export function ScheduleCard({
  title,
  dateStr,
  formattedDate,
  sessions,
  isSunday,
  initialAttendance,
  absenceCounts: initialAbsenceCounts,
}: Props) {
  const [attendance, setAttendance] = useState<AttendanceMap>(initialAttendance)
  const [absenceCounts, setAbsenceCounts] = useState(initialAbsenceCounts)
  const [pending, setPending] = useState<Set<string>>(new Set())

  async function mark(session: Session, status: 'present' | 'absent') {
    const key = `${dateStr}|${session.subject}|${session.start}`
    const prev = attendance[key]
    if (prev === status) return // no-op if same

    setPending(p => new Set(p).add(key))

    // Optimistic update
    setAttendance(a => ({ ...a, [key]: status }))

    // Update absence count optimistically
    if (status === 'absent' && prev !== 'absent') {
      setAbsenceCounts(c => ({ ...c, [session.subject]: (c[session.subject] ?? 0) + 1 }))
    } else if (prev === 'absent' && status !== 'absent') {
      setAbsenceCounts(c => ({ ...c, [session.subject]: Math.max(0, (c[session.subject] ?? 1) - 1) }))
    }

    await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateStr, subject: session.subject, start: session.start, status }),
    })

    setPending(p => { const n = new Set(p); n.delete(key); return n })
  }

  return (
    <Card className="border-zinc-100 shadow-none">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold text-zinc-700 flex items-center gap-1.5">
          <CalendarDays size={14} className="text-zinc-400" />
          {title}
          <span className="font-normal text-zinc-400 text-xs ml-1">{formattedDate}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {isSunday ? (
          <p className="text-sm text-zinc-400 py-2">Sunday — no classes</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-zinc-400 py-2">No classes scheduled</p>
        ) : (
          <ul className="space-y-2">
            {sessions.map((s, i) => {
              const key = `${dateStr}|${s.subject}|${s.start}`
              const status = attendance[key]
              const isLoading = pending.has(key)
              const absences = absenceCounts[s.subject] ?? 0

              return (
                <li key={i} className="flex items-center gap-2.5">
                  <span className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${sessionTypeDot[s.type] ?? 'bg-zinc-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-zinc-900 leading-tight truncate">{s.subject}</p>
                      {absences > 0 && (
                        <span className="shrink-0 inline-flex items-center rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-500">
                          {absences} absent
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                      <Clock size={10} />
                      {s.start}–{s.end}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      disabled={isLoading}
                      onClick={() => mark(s, 'present')}
                      title="Mark present"
                      className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors disabled:opacity-40 ${
                        status === 'present'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-zinc-100 text-zinc-400 hover:bg-emerald-100 hover:text-emerald-600'
                      }`}
                    >
                      <Check size={12} strokeWidth={2.5} />
                    </button>
                    <button
                      disabled={isLoading}
                      onClick={() => mark(s, 'absent')}
                      title="Mark absent"
                      className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors disabled:opacity-40 ${
                        status === 'absent'
                          ? 'bg-red-500 text-white'
                          : 'bg-zinc-100 text-zinc-400 hover:bg-red-100 hover:text-red-500'
                      }`}
                    >
                      <X size={12} strokeWidth={2.5} />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
