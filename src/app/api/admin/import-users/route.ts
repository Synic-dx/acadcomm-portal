import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' })

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No data rows found in file' }, { status: 400 })
  }

  // Normalise header names (case-insensitive, trimmed)
  function getField(row: Record<string, string>, ...candidates: string[]): string {
    for (const key of Object.keys(row)) {
      if (candidates.some(c => key.trim().toLowerCase() === c.toLowerCase())) {
        return String(row[key]).trim()
      }
    }
    return ''
  }

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const results: { roll_number: string; status: 'created' | 'error'; error?: string }[] = []

  for (const row of rows) {
    const roll_number = getField(row, 'roll_number', 'roll number', 'roll')
    const full_name   = getField(row, 'full_name', 'full name', 'name')
    const section     = getField(row, 'section').toUpperCase()
    const password    = getField(row, 'password')
    const email       = getField(row, 'email')

    if (!roll_number) continue

    const emailToUse = email || `${roll_number.toLowerCase()}@iimidr.ac.in`

    if (!password) {
      results.push({ roll_number, status: 'error', error: 'Missing password' })
      continue
    }

    const { data: created, error: createErr } = await adminSupabase.auth.admin.createUser({
      email: emailToUse,
      password,
      email_confirm: true,
    })

    if (createErr || !created.user) {
      results.push({ roll_number, status: 'error', error: createErr?.message ?? 'Unknown error' })
      continue
    }

    const { error: profileErr } = await adminSupabase.from('profiles').upsert({
      id: created.user.id,
      email: emailToUse,
      full_name: full_name || null,
      roll_number: roll_number || null,
      section: section || null,
      role: 'student',
    })

    if (profileErr) {
      results.push({ roll_number, status: 'error', error: `User created but profile failed: ${profileErr.message}` })
    } else {
      results.push({ roll_number, status: 'created' })
    }
  }

  const created = results.filter(r => r.status === 'created').length
  const failed  = results.filter(r => r.status === 'error').length

  return NextResponse.json({ created, failed, results })
}
