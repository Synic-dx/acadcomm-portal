export type SessionType = 'lecture' | 'quiz' | 'midterm' | 'endterm' | 'activity' | 'event' | 'tutorial'

export type Term = {
  id: string
  name: string
  start_date: string   // "YYYY-MM-DD"
  end_date: string     // "YYYY-MM-DD"
  is_active: boolean
  created_at?: string
}

export type Course = {
  id: string
  term_id: string
  name: string
  abbreviation: string  // matches subject string in timetable JSON
  credits: number | null
  total_classes: number | null
  outline_link: string | null
  notes_folder_link: string | null
  color: string | null
  created_at?: string
}

export type Session = {
  start: string   // "HH:MM"
  end: string     // "HH:MM"
  subject: string
  type: SessionType
  venue?: string
}

export type DaySchedule = {
  date: string    // "YYYY-MM-DD"
  sectionA: Session[]
  sectionB: Session[]
}

// Term III — IPM 2025-30 Batch, Academic Year 2025-26
// Parsed from Tentative Time Table IPM 2025-30 Batch Term III
// D-301 → Section A   |   D-303 → Section B
// Time slots: 07:00-08:15 | 09:00-10:15 | 10:30-11:45 | 12:00-13:15 | 14:30-15:45 | 16:00-17:15 | 17:30-18:45 | 19:00-20:15

export const timetable: DaySchedule[] = [
  {
    date: '2026-03-09',
    sectionA: [
      { start: '09:00', end: '13:15', subject: 'Term Registration', type: 'event' },
      { start: '14:30', end: '15:45', subject: 'LA 1', type: 'lecture' },
      { start: '16:00', end: '17:15', subject: 'ITD 1', type: 'lecture' },
    ],
    sectionB: [
      { start: '09:00', end: '13:15', subject: 'Term Registration', type: 'event' },
      { start: '14:30', end: '15:45', subject: 'ITD 1', type: 'lecture' },
      { start: '16:00', end: '17:15', subject: 'LA 1', type: 'lecture' },
    ],
  },
  {
    date: '2026-03-10',
    sectionA: [
      { start: '07:00', end: '08:15', subject: 'Swimming / Football / Yoga', type: 'activity' },
      { start: '09:00', end: '10:15', subject: 'DMG 1', type: 'lecture' },
      { start: '10:30', end: '11:45', subject: 'LA 2', type: 'lecture' },
      { start: '19:00', end: '20:15', subject: 'Dance-III', type: 'activity' },
    ],
    sectionB: [
      { start: '09:00', end: '10:15', subject: 'LA 2', type: 'lecture' },
      { start: '16:00', end: '17:15', subject: 'PS 1', type: 'quiz' },
    ],
  },
  {
    date: '2026-03-11',
    sectionA: [
      { start: '07:00', end: '08:15', subject: 'Swimming / PT', type: 'activity' },
      { start: '09:00', end: '10:15', subject: 'LA 3', type: 'lecture' },
      { start: '10:30', end: '11:45', subject: 'PS 2', type: 'quiz' },
    ],
    sectionB: [
      { start: '10:30', end: '11:45', subject: 'LA 3', type: 'lecture' },
    ],
  },
  {
    date: '2026-03-12',
    sectionA: [
      { start: '07:00', end: '08:15', subject: 'Swimming / Football / PT', type: 'activity' },
      { start: '09:00', end: '15:45', subject: 'I-help Activities', type: 'event' },
      { start: '17:30', end: '18:45', subject: 'Drama-III', type: 'activity' },
    ],
    sectionB: [
      { start: '09:00', end: '15:45', subject: 'I-help Activities', type: 'event' },
    ],
  },
  {
    date: '2026-03-13',
    sectionA: [
      { start: '09:00', end: '10:15', subject: 'PS 3', type: 'quiz' },
      { start: '10:30', end: '11:45', subject: 'DMG 2', type: 'lecture' },
      { start: '16:00', end: '17:15', subject: 'ITD 2', type: 'lecture' },
    ],
    sectionB: [
      { start: '09:00', end: '10:15', subject: 'DMG 2', type: 'lecture' },
      { start: '16:00', end: '17:15', subject: 'ITD 2', type: 'lecture' },
    ],
  },
  {
    date: '2026-03-14',
    sectionA: [
      { start: '07:00', end: '08:15', subject: 'Swimming / Yoga', type: 'activity' },
      { start: '09:00', end: '10:15', subject: 'DMG 2B', type: 'lecture' },
      { start: '10:30', end: '11:45', subject: 'LA 4', type: 'lecture' },
    ],
    sectionB: [
      { start: '10:30', end: '11:45', subject: 'LA 4', type: 'lecture' },
    ],
  },
  {
    date: '2026-03-16',
    sectionA: [
      { start: '09:00', end: '10:15', subject: 'MIE-II 1', type: 'lecture' },
      { start: '10:30', end: '11:45', subject: 'ETH 1', type: 'lecture' },
      { start: '16:00', end: '17:15', subject: 'PS 4', type: 'quiz' },
      { start: '19:00', end: '20:15', subject: 'Dance-III', type: 'activity' },
    ],
    sectionB: [
      { start: '09:00', end: '10:15', subject: 'MIE-II 1', type: 'lecture' },
      { start: '10:30', end: '11:45', subject: 'ETH 1', type: 'lecture' },
      { start: '14:30', end: '15:45', subject: 'PS 4', type: 'quiz' },
    ],
  },
  {
    date: '2026-03-17',
    sectionA: [
      { start: '07:00', end: '08:15', subject: 'Swimming / Football / PT', type: 'activity' },
      { start: '09:00', end: '10:15', subject: 'PS 5', type: 'quiz' },
      { start: '10:30', end: '11:45', subject: 'DMG 3', type: 'lecture' },
      { start: '16:00', end: '17:15', subject: 'LA 5', type: 'lecture' },
      { start: '17:30', end: '18:45', subject: 'T-LA 1', type: 'tutorial' },
    ],
    sectionB: [
      { start: '09:00', end: '10:15', subject: 'DMG 3', type: 'lecture' },
      { start: '10:30', end: '11:45', subject: 'PS 5', type: 'quiz' },
      { start: '16:00', end: '17:15', subject: 'LA 5', type: 'lecture' },
    ],
  },
  {
    date: '2026-03-18',
    sectionA: [
      { start: '07:00', end: '08:15', subject: 'Swimming / Football / PT', type: 'activity' },
      { start: '09:00', end: '10:15', subject: 'Copy Showing', type: 'event' },
      { start: '10:30', end: '11:45', subject: 'MIE-II 2', type: 'lecture' },
      { start: '16:00', end: '17:15', subject: 'PS 6', type: 'quiz' },
      { start: '19:00', end: '20:15', subject: 'Dance-III', type: 'activity' },
    ],
    sectionB: [
      { start: '09:00', end: '10:15', subject: 'MIE-II 2', type: 'lecture' },
      { start: '10:30', end: '11:45', subject: 'Copy Showing', type: 'event' },
      { start: '16:00', end: '17:15', subject: 'PS 6', type: 'quiz' },
    ],
  },
  {
    date: '2026-03-19',
    sectionA: [
      { start: '07:00', end: '08:15', subject: 'Swimming', type: 'activity' },
      { start: '10:30', end: '11:45', subject: 'ETH 2', type: 'lecture' },
      { start: '19:00', end: '20:15', subject: 'Drama-III', type: 'activity' },
    ],
    sectionB: [
      { start: '09:00', end: '10:15', subject: 'MIE-II 2', type: 'lecture' },
    ],
  },
  {
    date: '2026-03-20',
    sectionA: [
      { start: '09:00', end: '10:15', subject: 'MIE-II 3', type: 'lecture' },
      { start: '19:00', end: '20:15', subject: 'Drama-III', type: 'activity' },
    ],
    sectionB: [
      { start: '09:00', end: '10:15', subject: 'MIE-II 3', type: 'lecture' },
    ],
  },
  {
    date: '2026-03-21',
    sectionA: [
      { start: '07:00', end: '08:15', subject: 'Swimming', type: 'activity' },
      { start: '16:00', end: '17:15', subject: 'LA 6', type: 'lecture' },
    ],
    sectionB: [
      { start: '16:00', end: '17:15', subject: 'LA 6', type: 'lecture' },
    ],
  },
  {
    date: '2026-03-23',
    sectionA: [
      { start: '09:00', end: '10:15', subject: 'FRM 1', type: 'lecture' },
      { start: '10:30', end: '11:45', subject: 'LA 7', type: 'lecture' },
      { start: '12:00', end: '13:15', subject: 'MIE-II 4', type: 'lecture' },
      { start: '19:00', end: '20:15', subject: 'Dance-III', type: 'activity' },
    ],
    sectionB: [
      { start: '09:00', end: '10:15', subject: 'LA 7', type: 'lecture' },
      { start: '12:00', end: '13:15', subject: 'MIE-II 4', type: 'lecture' },
    ],
  },
  {
    date: '2026-03-24',
    sectionA: [
      { start: '09:00', end: '10:15', subject: 'DMG 3', type: 'lecture' },
      { start: '10:30', end: '11:45', subject: 'LA 8', type: 'lecture' },
      { start: '16:00', end: '17:15', subject: 'ITD 3', type: 'lecture' },
    ],
    sectionB: [
      { start: '07:00', end: '08:15', subject: 'Yoga', type: 'activity' },
      { start: '09:00', end: '10:15', subject: 'DMG 3', type: 'lecture' },
      { start: '10:30', end: '11:45', subject: 'LA 8', type: 'lecture' },
      { start: '17:30', end: '18:45', subject: 'ITD 3', type: 'lecture' },
    ],
  },
  {
    date: '2026-03-25',
    sectionA: [
      { start: '07:00', end: '08:15', subject: 'Yoga', type: 'activity' },
      { start: '09:00', end: '10:15', subject: 'MIE-II 5', type: 'lecture' },
      { start: '10:30', end: '11:45', subject: 'LA 9', type: 'lecture' },
      { start: '16:00', end: '17:15', subject: 'FRM 2', type: 'lecture' },
      { start: '17:30', end: '18:45', subject: 'SI 1', type: 'lecture' },
    ],
    sectionB: [
      { start: '10:30', end: '11:45', subject: 'MIE-II 5', type: 'lecture' },
      { start: '16:00', end: '17:15', subject: 'FRM 2', type: 'lecture' },
      { start: '17:30', end: '18:45', subject: 'SI 1', type: 'lecture' },
    ],
  },
  {
    date: '2026-03-26',
    sectionA: [
      { start: '07:00', end: '08:15', subject: 'Swimming / Yoga', type: 'activity' },
      { start: '09:00', end: '15:45', subject: 'I-help Activities', type: 'event' },
      { start: '14:30', end: '15:45', subject: 'PS 7', type: 'quiz' },
      { start: '16:00', end: '17:15', subject: 'FRM 3', type: 'lecture' },
    ],
    sectionB: [
      { start: '09:00', end: '15:45', subject: 'I-help Activities', type: 'event' },
      { start: '16:00', end: '17:15', subject: 'FRM 3', type: 'lecture' },
    ],
  },
  {
    date: '2026-03-27',
    sectionA: [
      { start: '10:30', end: '11:45', subject: 'DMG 4', type: 'lecture' },
      { start: '14:30', end: '15:45', subject: 'MIE-II 6', type: 'lecture' },
      { start: '17:30', end: '18:45', subject: 'PRE CONVO', type: 'event' },
    ],
    sectionB: [
      { start: '14:30', end: '15:45', subject: 'MIE-II 6', type: 'lecture' },
    ],
  },
  {
    date: '2026-03-28',
    sectionA: [
      { start: '07:00', end: '08:15', subject: 'Swimming', type: 'activity' },
      { start: '09:00', end: '17:15', subject: 'CONVOCATION', type: 'event' },
    ],
    sectionB: [
      { start: '09:00', end: '17:15', subject: 'CONVOCATION', type: 'event' },
    ],
  },
]

// Scheduled exams / evaluations
export type Exam = {
  date: string        // "YYYY-MM-DD"
  start: string
  end: string
  subject: string
  type: 'quiz' | 'midterm' | 'endterm'
  sections: ('A' | 'B')[]
}

export const exams: Exam[] = [
  { date: '2026-03-10', start: '16:00', end: '17:15', subject: 'PS 1 — Problem Solving Quiz', type: 'quiz', sections: ['B'] },
  { date: '2026-03-11', start: '10:30', end: '11:45', subject: 'PS 2 — Problem Solving Quiz', type: 'quiz', sections: ['A'] },
  { date: '2026-03-13', start: '09:00', end: '10:15', subject: 'PS 3 — Problem Solving Quiz', type: 'quiz', sections: ['A'] },
  { date: '2026-03-16', start: '16:00', end: '17:15', subject: 'PS 4 — Problem Solving Quiz', type: 'quiz', sections: ['A'] },
  { date: '2026-03-16', start: '14:30', end: '15:45', subject: 'PS 4 — Problem Solving Quiz', type: 'quiz', sections: ['B'] },
  { date: '2026-03-17', start: '09:00', end: '10:15', subject: 'PS 5 — Problem Solving Quiz', type: 'quiz', sections: ['A'] },
  { date: '2026-03-17', start: '10:30', end: '11:45', subject: 'PS 5 — Problem Solving Quiz', type: 'quiz', sections: ['B'] },
  { date: '2026-03-18', start: '16:00', end: '17:15', subject: 'PS 6 — Problem Solving Quiz', type: 'quiz', sections: ['A', 'B'] },
  { date: '2026-03-26', start: '14:30', end: '15:45', subject: 'PS 7 — Problem Solving Quiz', type: 'quiz', sections: ['A'] },
]

export function getUpcomingExams(section: 'A' | 'B', count = 5): Exam[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return exams
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

export function getDaySchedule(dateStr: string, section: 'A' | 'B'): Session[] {
  const day = timetable.find((d) => d.date === dateStr)
  if (!day) return []
  return section === 'A' ? day.sectionA : day.sectionB
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}
