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

export async function GET() {
  const { supabase, error } = await requireAdmin()
  if (error) return error

  const { data, error: dbErr } = await supabase!
    .from('terms')
    .select('*')
    .order('created_at', { ascending: false })

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const { supabase, error } = await requireAdmin()
  if (error) return error

  const { name, start_date, end_date, is_active } = await request.json()
  if (!name || !start_date || !end_date) {
    return NextResponse.json({ error: 'name, start_date, and end_date are required' }, { status: 400 })
  }

  // If activating this term, deactivate all others first
  if (is_active) {
    await supabase!.from('terms').update({ is_active: false }).eq('is_active', true)
  }

  const { data, error: dbErr } = await supabase!
    .from('terms')
    .insert({ name, start_date, end_date, is_active: is_active ?? false })
    .select()
    .single()

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
