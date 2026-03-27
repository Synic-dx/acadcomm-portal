import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getActiveTimetable } from '@/lib/timetable-db'
import type { DaySchedule } from '@/data/timetable'

function guessType(subject: string): string {
  const s = subject.toLowerCase()
  if (s.includes('quiz')) return 'quiz'
  if (s.includes('midterm') || s.includes('mid-term') || s.includes('mid term')) return 'midterm'
  if (s.includes('endterm') || s.includes('end-term') || s.includes('end term')) return 'endterm'
  if (s.includes('assignment')) return 'assignment'
  return 'other'
}

function isExamLike(subject: string): boolean {
  const s = subject.toLowerCase()
  return s.includes('quiz') || s.includes('midterm') || s.includes('mid-term') || s.includes('mid term') || s.includes('endterm') || s.includes('end-term') || s.includes('end term') || s.includes('assignment')
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const timetable: DaySchedule[] = await getActiveTimetable()

  // Build candidates — deduplicate by date+subject+start, track which sections have it
  const candidateMap = new Map<string, {
    subject: string; type: string; date: string; start: string; end: string; sections: string[]
  }>()

  for (const day of timetable) {
    const sectionEntries: { section: 'A' | 'B'; sessions: DaySchedule['sectionA'] }[] = [
      { section: 'A', sessions: day.sectionA },
      { section: 'B', sessions: day.sectionB },
    ]
    for (const { section, sessions } of sectionEntries) {
      for (const session of sessions) {
        if (!isExamLike(session.subject)) continue
        const key = `${day.date}|${session.subject}|${session.start}`
        if (candidateMap.has(key)) {
          const existing = candidateMap.get(key)!
          if (!existing.sections.includes(section)) existing.sections.push(section)
        } else {
          candidateMap.set(key, {
            subject: session.subject,
            type: guessType(session.subject),
            date: day.date,
            start: session.start,
            end: session.end,
            sections: [section],
          })
        }
      }
    }
  }

  if (candidateMap.size === 0) {
    return NextResponse.json({ inserted: 0, skipped: 0 })
  }

  // Delete all previous pending timetable-sourced suggestions
  await supabase
    .from('exams')
    .delete()
    .eq('source', 'timetable')
    .eq('status', 'pending')

  const toInsert = Array.from(candidateMap.values())
    .map(v => ({ ...v, status: 'pending', source: 'timetable' }))

  if (toInsert.length === 0) {
    return NextResponse.json({ inserted: 0, skipped: candidateMap.size })
  }

  const { error: insertErr } = await supabase.from('exams').insert(toInsert)
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

  return NextResponse.json({ inserted: toInsert.length, skipped: 0 })
}
