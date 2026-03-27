'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type UploadState =
  | { status: 'idle' }
  | { status: 'uploading' }
  | { status: 'success'; days: number; warnings: string[] }
  | { status: 'error'; message: string }

export function TimetableUploader() {
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<UploadState>({ status: 'idle' })

  function handleFile(f: File) {
    setFile(f)
    setState({ status: 'idle' })
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  async function upload() {
    if (!file) return
    setState({ status: 'uploading' })

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch('/api/admin/upload-timetable', { method: 'POST', body: form })
      const json = await res.json()

      if (!res.ok) {
        setState({ status: 'error', message: json.error ?? 'Upload failed' })
      } else {
        setState({ status: 'success', days: json.days, warnings: json.warnings ?? [] })
        router.refresh()
      }
    } catch {
      setState({ status: 'error', message: 'Network error — please try again' })
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
        Upload Timetable
      </h2>

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => state.status !== 'uploading' && inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-6 py-10 text-center transition hover:border-zinc-400 hover:bg-white"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xls,.xlsx"
          className="hidden"
          onChange={onInputChange}
        />
        {file ? (
          <>
            <FileSpreadsheet size={32} className="mb-3 text-emerald-600" />
            <p className="text-sm font-medium text-zinc-900">{file.name}</p>
            <p className="text-xs text-zinc-400 mt-0.5">
              {(file.size / 1024).toFixed(1)} KB · click to change
            </p>
          </>
        ) : (
          <>
            <Upload size={28} className="mb-3 text-zinc-400" />
            <p className="text-sm font-medium text-zinc-700">Drop your XLS/XLSX file here</p>
            <p className="text-xs text-zinc-400 mt-0.5">or click to browse</p>
          </>
        )}
      </div>

      <Button
        onClick={upload}
        disabled={!file || state.status === 'uploading'}
        className="w-full"
      >
        {state.status === 'uploading' ? (
          <span className="flex items-center gap-2">
            <Loader2 size={15} className="animate-spin" />
            Reading with GPT-4o…
          </span>
        ) : (
          'Upload & Activate Timetable'
        )}
      </Button>

      {state.status === 'success' && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 flex items-start gap-3">
          <CheckCircle size={16} className="mt-0.5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-emerald-800">
              Timetable activated — {state.days} day{state.days !== 1 ? 's' : ''} imported
            </p>
            {state.warnings.length > 0 && (
              <ul className="mt-1 space-y-0.5">
                {state.warnings.map((w, i) => (
                  <li key={i} className="text-xs text-emerald-700">{w}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {state.status === 'error' && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 flex items-start gap-3">
          <AlertCircle size={16} className="mt-0.5 text-red-500 shrink-0" />
          <p className="text-sm font-medium text-red-700">{state.message}</p>
        </div>
      )}
    </section>
  )
}
