import * as XLSX from 'xlsx'
import type { DaySchedule, SessionType } from '@/data/timetable'

// ---------------------------------------------------------------------------
// Confirmed sheet layout (from debug):
//
//   Row 0-2 : Title / institution text — skip
//   Row 3   : Headers
//               col 0 = "Date"
//               col 1 = "Classroom"   (values: "D-301" = Sec A, "D-303" = Sec B)
//               col 2 = "7:00 am to 8:15 am …"
//               col 3 = "9.00 am\n  10.15 am"
//               col 4 = "10.30 am\n  11.45 am"
//               col 5 = "12.00 noon\n  1.15 pm"
//               col 6 = "" (gap — no class)
//               col 7 = "2.30 pm\n  3.45 pm"
//               col 8 = "4.00 pm\n  5.15 pm"
//               col 9 = "5.30 pm\n  6.45 pm"
//               col10 = "7.00 pm\n  8.15 pm"  (if present)
//   Row 4+  : Data rows in pairs per calendar day
//               even: date (Excel serial), "D-301", subA₁, subA₂ …
//               odd : ""               , "D-303", subB₁, subB₂ …
// ---------------------------------------------------------------------------

// --- Date helpers -----------------------------------------------------------

/**
 * Convert an Excel date serial (e.g. 46099 = 9-Mar-2026) to "YYYY-MM-DD".
 * We use XLSX.SSF.parse_date_code which is fully timezone-free.
 */
function serialToISO(serial: number): string {
  const d = XLSX.SSF.parse_date_code(serial)
  return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`
}

// --- Time slot header helpers -----------------------------------------------

/**
 * Parse a time string like "9.00 am", "1.15 pm", "12.00 noon" → "HH:MM".
 * Handles both dot and colon separators.
 */
function parseAmPm(raw: string): string | null {
  const s = raw.trim().toLowerCase().replace(/\s+/g, ' ')
  // Special case: noon
  if (/^12[.:]00\s*(noon|pm)?/.test(s)) return '12:00'
  // General: H.MM am/pm or H:MM am/pm
  const m = s.match(/^(\d{1,2})[.:](\d{2})\s*(am|pm)/)
  if (!m) return null
  let h = parseInt(m[1])
  const min = m[2]
  const period = m[3]
  if (period === 'pm' && h !== 12) h += 12
  if (period === 'am' && h === 12) h = 0
  return `${String(h).padStart(2, '0')}:${min}`
}

/**
 * Parse a column header like "9.00 am\n  10.15 am" or "7:00 am to 8:15 am …"
 * into { start: "HH:MM", end: "HH:MM" }.
 */
function parseSlotHeader(header: string): { start: string; end: string } | null {
  const cleaned = header
    .replace(/\(only for physical activities\)/gi, '')
    .replace(/\(.*?\)/g, '')
    .trim()

  // Split on "to", newline, or "/"
  const parts = cleaned
    .split(/\bto\b|\/|\n/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (parts.length >= 2) {
    const start = parseAmPm(parts[0])
    const end = parseAmPm(parts[1])
    if (start && end) return { start, end }
  }

  // Single token — match start to known slot
  if (parts.length === 1) {
    const start = parseAmPm(parts[0])
    const ends: Record<string, string> = {
      '07:00': '08:15', '09:00': '10:15', '10:30': '11:45', '12:00': '13:15',
      '14:30': '15:45', '16:00': '17:15', '17:30': '18:45', '19:00': '20:15',
    }
    if (start && ends[start]) return { start, end: ends[start] }
  }

  return null
}

// --- Session type -----------------------------------------------------------

function guessType(subject: string): SessionType {
  const s = subject.toLowerCase()
  if (/\bps\s*\d/i.test(s) || s.includes('quiz')) return 'quiz'
  if (s.includes('midsem') || s.includes('mid sem') || s.includes('mid-term')) return 'midterm'
  if (s.includes('endsem') || s.includes('end sem') || s.includes('end-term')) return 'endterm'
  if (
    s.includes('swim') || s.includes('yoga') || s.includes('dance') ||
    s.includes('drama') || s.includes('football') || /\bpt\b/.test(s) ||
    s.includes('sport') || s.includes('gym')
  ) return 'activity'
  if (
    s.includes('convo') || s.includes('registration') ||
    s.includes('i-help') || s.includes('ihelp') ||
    s.includes('holiday') || s.includes('pre convo')
  ) return 'event'
  if (/^t-/i.test(s) || s.includes('tutorial')) return 'tutorial'
  return 'lecture'
}

// Strip trailing section suffix: "LA 1 A" → "LA 1", "ITD 1 B" → "ITD 1"
function cleanSubject(raw: string): string {
  return raw.trim().replace(/\s+[AB]$/i, '').trim()
}

// ---------------------------------------------------------------------------

export interface ParseResult {
  timetable: DaySchedule[]
  warnings: string[]
}

export function parseTimetableXls(buffer: ArrayBuffer): ParseResult {
  // Do NOT use cellDates — keep date serials as plain numbers to avoid
  // timezone-mangling bugs when the server is not in IST.
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

  const warnings: string[] = []
  const scheduleMap = new Map<string, DaySchedule>()

  // Find the header row: first row where col 0 trimmed === "Date"
  let headerRowIdx = -1
  for (let r = 0; r < Math.min(10, rows.length); r++) {
    if (String(rows[r][0] ?? '').trim().toLowerCase() === 'date') {
      headerRowIdx = r
      break
    }
  }

  if (headerRowIdx === -1) {
    warnings.push('Could not find header row (no "Date" cell in first 10 rows).')
    return { timetable: [], warnings }
  }

  // Build col → time slot mapping from header row
  const headerRow = rows[headerRowIdx] as string[]
  const slotMap = new Map<number, { start: string; end: string }>()
  for (let c = 2; c < headerRow.length; c++) {
    const h = String(headerRow[c] ?? '').trim()
    if (!h) continue
    const slot = parseSlotHeader(h)
    if (slot) {
      slotMap.set(c, slot)
    } else {
      warnings.push(`Header col ${c}: could not parse time slot "${h.replace(/\n/g, ' ')}"`)
    }
  }

  if (slotMap.size === 0) {
    warnings.push('No time slot headers found — check the sheet.')
    return { timetable: [], warnings }
  }

  // Process data rows
  let currentDate: string | null = null

  for (let r = headerRowIdx + 1; r < rows.length; r++) {
    const row = rows[r] as unknown[]
    if (row.every((c) => c === '' || c === null || c === undefined)) continue

    // Col 0: Excel date serial (number) — only present on D-301 rows
    const rawDate = row[0]
    if (typeof rawDate === 'number' && rawDate > 40000 && rawDate < 60000) {
      currentDate = serialToISO(rawDate)
    }

    if (!currentDate) continue

    // Col 1: classroom code
    const classroom = String(row[1] ?? '').trim()
    const isSecA = /D-?301/i.test(classroom)
    const isSecB = /D-?303/i.test(classroom)
    if (!isSecA && !isSecB) continue

    if (!scheduleMap.has(currentDate)) {
      scheduleMap.set(currentDate, { date: currentDate, sectionA: [], sectionB: [] })
    }
    const day = scheduleMap.get(currentDate)!

    // Each subject column maps to a known time slot
    for (const [col, slot] of slotMap) {
      const raw = String(row[col] ?? '').trim()
      if (!raw) continue
      const subject = cleanSubject(raw)
      if (!subject) continue

      const session = { start: slot.start, end: slot.end, subject, type: guessType(subject) }
      if (isSecA) day.sectionA.push(session)
      else day.sectionB.push(session)
    }
  }

  // Sort sessions within each day by start time
  for (const day of scheduleMap.values()) {
    day.sectionA.sort((a, b) => a.start.localeCompare(b.start))
    day.sectionB.sort((a, b) => a.start.localeCompare(b.start))
  }

  const timetable = Array.from(scheduleMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  )

  if (timetable.length === 0) {
    warnings.push('No data extracted. Verify the sheet has "Date" in the header row and D-301/D-303 in the Classroom column.')
  }

  return { timetable, warnings }
}
