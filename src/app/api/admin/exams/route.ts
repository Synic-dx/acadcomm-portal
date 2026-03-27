import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { supabase: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  return { supabase, error: null }
}

// GET — all exams (admin sees all statuses)
export async function GET() {
  const { supabase, error } = await requireAdmin()
  if (error) return error

  const { data, error: dbErr } = await supabase!
    .from('exams')
    .select('*')
    .order('date', { ascending: true })
    .order('start', { ascending: true })

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST — create a new exam
export async function POST(request: NextRequest) {
  const { supabase, error } = await requireAdmin()
  if (error) return error

  const body = await request.json()
  const { subject, type, date, start, end, sections, notes, status, source } = body

  if (!subject || !type || !date || !start || !end) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error: dbErr } = await supabase!
    .from('exams')
    .insert({ subject, type, date, start, end, sections: sections ?? ['A', 'B'], notes, status: status ?? 'pending', source: source ?? 'manual' })
    .select()
    .single()

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
