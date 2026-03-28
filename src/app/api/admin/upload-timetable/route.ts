import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseTimetableXls } from '@/lib/parse-timetable-xls'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const termId = formData.get('term_id') as string | null

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!['xls', 'xlsx'].includes(ext ?? '')) {
    return NextResponse.json({ error: 'Only .xls and .xlsx files are supported' }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()
  const { timetable, warnings } = parseTimetableXls(buffer)

  if (timetable.length === 0) {
    return NextResponse.json({ error: 'Could not parse timetable from file', warnings }, { status: 422 })
  }

  // Deactivate previous uploads for this term (or all if no term specified)
  const deactivateQuery = supabase.from('timetable_uploads').update({ is_active: false })
  if (termId) {
    await deactivateQuery.eq('term_id', termId)
  } else {
    await deactivateQuery.eq('is_active', true)
  }

  const { error: insertError } = await supabase
    .from('timetable_uploads')
    .insert({ uploaded_by: user.id, filename: file.name, timetable, is_active: true, term_id: termId ?? null })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, days: timetable.length, warnings })
}
