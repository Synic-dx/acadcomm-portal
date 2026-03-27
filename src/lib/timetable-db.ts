import { createClient } from '@/lib/supabase/server'
import { timetable as staticTimetable, exams as staticExams } from '@/data/timetable'
import type { DaySchedule, Exam } from '@/data/timetable'

/**
 * Returns the active timetable from the DB upload, or falls back to the
 * static timetable.ts data if no upload exists yet.
 */
export async function getActiveTimetable(): Promise<DaySchedule[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('timetable_uploads')
    .select('timetable')
    .eq('is_active', true)
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .single()

  if (data?.timetable && Array.isArray(data.timetable)) {
    return data.timetable as DaySchedule[]
  }

  return staticTimetable
}

export function getDayScheduleFromData(
  data: DaySchedule[],
  dateStr: string,
  section: 'A' | 'B'
) {
  const day = data.find((d) => d.date === dateStr)
  if (!day) return []
  return section === 'A' ? day.sectionA : day.sectionB
}

export async function getUpcomingExams(
  section: 'A' | 'B',
  count = 5
): Promise<Exam[]> {
  const supabase = await createClient()
  const todayStr = new Date().toISOString().slice(0, 10)

  const { data } = await supabase
    .from('exams')
    .select('*')
    .eq('status', 'approved')
    .gte('date', todayStr)
    .contains('sections', [section])
    .order('date', { ascending: true })
    .order('start', { ascending: true })
    .limit(count)

  if (data && data.length > 0) {
    return data.map(e => ({
      date: e.date,
      subject: e.subject,
      type: e.type,
      start: e.start.slice(0, 5),
      end: e.end.slice(0, 5),
      sections: e.sections,
    })) as Exam[]
  }

  // Fallback to static data
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return staticExams
    .filter((e) => {
      const d = new Date(e.date)
      d.setHours(0, 0, 0, 0)
      return d >= today && e.sections.includes(section)
    })
    .sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime()
      return diff !== 0 ? diff : a.start.localeCompare(b.start)
    })
    .slice(0, count)
}

export function getUpcomingExamsFromData(
  _data: DaySchedule[],
  section: 'A' | 'B',
  count = 5
): Exam[] {
  // Legacy sync version — still used in server components that call getActiveTimetable first.
  // Prefer getUpcomingExams() which reads from the DB exams table.
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return staticExams
    .filter((e) => {
      const d = new Date(e.date)
      d.setHours(0, 0, 0, 0)
      return d >= today && e.sections.includes(section)
    })
    .sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime()
      return diff !== 0 ? diff : a.start.localeCompare(b.start)
    })
    .slice(0, count)
}
