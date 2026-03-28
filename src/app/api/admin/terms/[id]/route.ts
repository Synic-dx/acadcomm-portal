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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await request.json()

  // If setting is_active = true, deactivate all others first
  if (body.is_active === true) {
    await supabase!.from('terms').update({ is_active: false }).eq('is_active', true)
  }

  const { data, error: dbErr } = await supabase!
    .from('terms')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const { error: dbErr } = await supabase!.from('terms').delete().eq('id', id)
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
