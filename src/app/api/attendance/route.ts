import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST — upsert attendance for a session
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { date, subject, start, status, course_id } = await request.json()
  if (!date || !subject || !start || !status) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const record: Record<string, unknown> = { user_id: user.id, date, subject, start, status }
  if (course_id) record.course_id = course_id

  // Use course_id-based conflict key when available, else fall back to subject-based
  const conflictKey = course_id ? 'user_id,course_id,date,start' : 'user_id,date,subject,start'
  const { error } = await supabase.from('attendance').upsert(record, { onConflict: conflictKey })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
