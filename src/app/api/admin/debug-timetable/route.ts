import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  // Raw rows as-is
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

  // Return first 15 rows with type info for each cell
  const preview = rows.slice(0, 15).map((row, ri) =>
    (row as unknown[]).slice(0, 10).map((cell, ci) => ({
      r: ri, c: ci,
      type: cell instanceof Date ? 'Date' : typeof cell,
      value: cell instanceof Date ? cell.toISOString() : cell,
    }))
  )

  return NextResponse.json({ sheetName, totalRows: rows.length, preview })
}
