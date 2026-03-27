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

// PATCH — update an exam (approve/reject/edit)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await request.json()
  const { subject, type, date, start, end, sections, notes, status } = body

  const updates: Record<string, unknown> = {}
  if (subject !== undefined) updates.subject = subject
  if (type !== undefined) updates.type = type
  if (date !== undefined) updates.date = date
  if (start !== undefined) updates.start = start
  if (end !== undefined) updates.end = end
  if (sections !== undefined) updates.sections = sections
  if (notes !== undefined) updates.notes = notes
  if (status !== undefined) updates.status = status

  const { data, error: dbErr } = await supabase!
    .from('exams')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE — remove an exam
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const { error: dbErr } = await supabase!.from('exams').delete().eq('id', id)
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
