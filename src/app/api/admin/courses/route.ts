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

export async function GET(request: NextRequest) {
  const { supabase, error } = await requireAdmin()
  if (error) return error

  const term_id = request.nextUrl.searchParams.get('term_id')
  let query = supabase!.from('courses').select('*').order('name')
  if (term_id) query = query.eq('term_id', term_id)

  const { data, error: dbErr } = await query
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const { supabase, error } = await requireAdmin()
  if (error) return error

  const body = await request.json()
  const { term_id, name, abbreviation, credits, total_classes, outline_link, notes_folder_link, color } = body

  if (!term_id || !name || !abbreviation) {
    return NextResponse.json({ error: 'term_id, name, and abbreviation are required' }, { status: 400 })
  }

  const { data, error: dbErr } = await supabase!
    .from('courses')
    .insert({ term_id, name, abbreviation, credits, total_classes, outline_link, notes_folder_link, color })
    .select()
    .single()

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
