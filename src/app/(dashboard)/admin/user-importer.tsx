'use client'

import { useRef, useState } from 'react'
import { Upload, FileSpreadsheet, CheckCircle, XCircle } from 'lucide-react'

type ImportResult = {
  created: number
  failed: number
  results: { roll_number: string; status: 'created' | 'error'; error?: string }[]
}

export function UserImporter() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function upload(file: File) {
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/admin/import-users', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
        Import Users from Excel
      </h2>
      <p className="text-xs text-zinc-500">
        Upload an XLS/XLSX file with columns: <code className="bg-zinc-100 px-1 rounded">roll_number</code>, <code className="bg-zinc-100 px-1 rounded">full_name</code>, <code className="bg-zinc-100 px-1 rounded">section</code>, <code className="bg-zinc-100 px-1 rounded">password</code>, <code className="bg-zinc-100 px-1 rounded">email</code> (optional — defaults to roll@iimidr.ac.in).
      </p>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 transition-colors ${
          dragging ? 'border-zinc-400 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xls,.xlsx"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }}
        />
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
            Importing users…
          </div>
        ) : (
          <>
            <FileSpreadsheet size={24} className="text-zinc-400" />
            <p className="text-sm text-zinc-500">Drop XLS/XLSX here or <span className="text-zinc-900 underline">browse</span></p>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {result && (
        <div className="space-y-3 rounded-lg border border-zinc-100 p-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle size={14} /> {result.created} created
            </span>
            {result.failed > 0 && (
              <span className="flex items-center gap-1.5 text-red-500">
                <XCircle size={14} /> {result.failed} failed
              </span>
            )}
          </div>
          {result.results.some(r => r.status === 'error') && (
            <div className="max-h-40 overflow-y-auto space-y-1">
              {result.results.filter(r => r.status === 'error').map((r, i) => (
                <p key={i} className="text-xs text-red-500">
                  <span className="font-medium">{r.roll_number}</span>: {r.error}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
