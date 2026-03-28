'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil, ExternalLink } from 'lucide-react'
import type { Course, Term } from '@/data/timetable'

type CourseFormData = {
  name: string
  abbreviation: string
  credits: string
  total_classes: string
  outline_link: string
  notes_folder_link: string
}

const EMPTY_FORM: CourseFormData = {
  name: '', abbreviation: '', credits: '', total_classes: '',
  outline_link: '', notes_folder_link: '',
}

function CourseForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: CourseFormData
  onSave: (data: CourseFormData) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<CourseFormData>(initial)
  const f = (key: keyof CourseFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="sm:col-span-2">
        <label className="text-xs font-medium text-zinc-500">Course name</label>
        <input className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
          value={form.name} onChange={f('name')} placeholder="e.g. Linear Algebra" />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-500">Abbreviation</label>
        <input className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
          value={form.abbreviation} onChange={f('abbreviation')} placeholder="e.g. LA — must match timetable" />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-500">Credits</label>
        <input type="number" min="0" className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
          value={form.credits} onChange={f('credits')} placeholder="e.g. 3" />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-500">Total planned classes</label>
        <input type="number" min="0" className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
          value={form.total_classes} onChange={f('total_classes')} placeholder="e.g. 24" />
      </div>
      <div className="sm:col-span-2">
        <label className="text-xs font-medium text-zinc-500">Course outline link</label>
        <input className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
          value={form.outline_link} onChange={f('outline_link')} placeholder="https://…" />
      </div>
      <div className="sm:col-span-2">
        <label className="text-xs font-medium text-zinc-500">Notes folder link</label>
        <input className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
          value={form.notes_folder_link} onChange={f('notes_folder_link')} placeholder="https://drive.google.com/…" />
      </div>
      <div className="sm:col-span-2 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-md px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 transition-colors">
          Cancel
        </button>
        <button
          type="button"
          disabled={saving || !form.name || !form.abbreviation}
          onClick={() => onSave(form)}
          className="rounded-md bg-zinc-900 px-4 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-40 transition-colors"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export function CourseManager({
  activeTerm,
  initialCourses,
}: {
  activeTerm: Term | null
  initialCourses: Course[]
}) {
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  if (!activeTerm) {
    return (
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Courses</h2>
        <p className="text-sm text-zinc-400">Create and activate a term above before adding courses.</p>
      </section>
    )
  }

  async function create(data: CourseFormData) {
    setSaving(true)
    const res = await fetch('/api/admin/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        term_id: activeTerm!.id,
        name: data.name,
        abbreviation: data.abbreviation,
        credits: data.credits ? Number(data.credits) : null,
        total_classes: data.total_classes ? Number(data.total_classes) : null,
        outline_link: data.outline_link || null,
        notes_folder_link: data.notes_folder_link || null,
      }),
    })
    if (res.ok) {
      const created: Course = await res.json()
      setCourses(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      setShowAddForm(false)
    }
    setSaving(false)
  }

  async function update(id: string, data: CourseFormData) {
    setSaving(true)
    const res = await fetch(`/api/admin/courses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        abbreviation: data.abbreviation,
        credits: data.credits ? Number(data.credits) : null,
        total_classes: data.total_classes ? Number(data.total_classes) : null,
        outline_link: data.outline_link || null,
        notes_folder_link: data.notes_folder_link || null,
      }),
    })
    if (res.ok) {
      const updated: Course = await res.json()
      setCourses(prev => prev.map(c => c.id === id ? updated : c))
      setEditingId(null)
    }
    setSaving(false)
  }

  async function remove(id: string) {
    if (!confirm('Delete this course? This will also remove linked attendance and exams.')) return
    await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
    setCourses(prev => prev.filter(c => c.id !== id))
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Courses — {activeTerm.name}
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">Abbreviations must exactly match subject strings in the timetable.</p>
        </div>
        <button
          onClick={() => { setShowAddForm(v => !v); setEditingId(null) }}
          className="flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          <Plus size={12} /> Add Course
        </button>
      </div>

      {showAddForm && (
        <CourseForm initial={EMPTY_FORM} onSave={create} onCancel={() => setShowAddForm(false)} saving={saving} />
      )}

      {courses.length === 0 && !showAddForm ? (
        <p className="text-sm text-zinc-400 py-2">No courses yet for this term.</p>
      ) : (
        <div className="rounded-lg border border-zinc-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Course</th>
                <th className="px-4 py-2.5 text-left font-medium">Abbrev.</th>
                <th className="px-4 py-2.5 text-left font-medium">Credits</th>
                <th className="px-4 py-2.5 text-left font-medium">Classes</th>
                <th className="px-4 py-2.5 text-left font-medium">Links</th>
                <th className="px-4 py-2.5 text-left font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {courses.map(course => (
                editingId === course.id ? (
                  <tr key={course.id}>
                    <td colSpan={6} className="px-4 py-3">
                      <CourseForm
                        initial={{
                          name: course.name, abbreviation: course.abbreviation,
                          credits: course.credits?.toString() ?? '',
                          total_classes: course.total_classes?.toString() ?? '',
                          outline_link: course.outline_link ?? '',
                          notes_folder_link: course.notes_folder_link ?? '',
                        }}
                        onSave={(data) => update(course.id, data)}
                        onCancel={() => setEditingId(null)}
                        saving={saving}
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={course.id} className="bg-white">
                    <td className="px-4 py-3 font-medium text-zinc-900">{course.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-mono font-medium text-zinc-700">
                        {course.abbreviation}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{course.credits ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-500">{course.total_classes ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {course.outline_link && (
                          <a href={course.outline_link} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                            <ExternalLink size={10} /> Outline
                          </a>
                        )}
                        {course.notes_folder_link && (
                          <a href={course.notes_folder_link} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                            <ExternalLink size={10} /> Notes
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditingId(course.id); setShowAddForm(false) }}
                          className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => remove(course.id)}
                          className="rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
