import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TimetableUploader } from './timetable-uploader'
import { UserManager } from './user-manager'
import { UserImporter } from './user-importer'
import { ExamManager } from './exam-manager'
import { TermManager } from './term-manager'
import { CourseManager } from './course-manager'
import type { Exam } from './exam-manager'
import type { Term, Course } from '@/data/timetable'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const [uploadsRes, usersRes, examsRes, termsRes] = await Promise.all([
    supabase
      .from('timetable_uploads')
      .select('id, filename, uploaded_at, is_active, timetable')
      .order('uploaded_at', { ascending: false })
      .limit(5),
    supabase
      .from('profiles')
      .select('id, email, full_name, section, roll_number, role')
      .order('email'),
    supabase
      .from('exams')
      .select('*')
      .order('date', { ascending: true })
      .order('start', { ascending: true }),
    supabase
      .from('terms')
      .select('*')
      .order('created_at', { ascending: false }),
  ])

  const uploads = uploadsRes.data
  const users   = usersRes.data ?? []
  const exams   = (examsRes.data ?? []) as Exam[]
  const terms   = (termsRes.data ?? []) as Term[]
  const activeTerm = terms.find(t => t.is_active) ?? null

  const coursesRes = activeTerm
    ? await supabase.from('courses').select('*').eq('term_id', activeTerm.id).order('name')
    : { data: [] }
  const courses = (coursesRes.data ?? []) as Course[]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900">Admin Panel</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Manage timetable, exams, and user profiles.</p>
      </div>

      {/* ── Terms ── */}
      <TermManager initialTerms={terms} />

      <div className="border-t border-zinc-100" />

      {/* ── Courses ── */}
      <CourseManager activeTerm={activeTerm} initialCourses={courses} />

      <div className="border-t border-zinc-100" />

      {/* ── Timetable ── */}
      <div className="max-w-2xl space-y-6">
        <TimetableUploader terms={terms} />

        {uploads && uploads.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
              Upload History
            </h2>
            <div className="rounded-lg border border-zinc-100 overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium">File</th>
                    <th className="px-4 py-2.5 text-left font-medium">Days</th>
                    <th className="px-4 py-2.5 text-left font-medium">Uploaded</th>
                    <th className="px-4 py-2.5 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {uploads.map((u) => (
                    <tr key={u.id} className="bg-white">
                      <td className="px-4 py-3 text-zinc-900 font-medium">{u.filename}</td>
                      <td className="px-4 py-3 text-zinc-500">
                        {Array.isArray(u.timetable) ? u.timetable.length : '—'}
                      </td>
                      <td className="px-4 py-3 text-zinc-500">
                        {new Date(u.uploaded_at).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        {u.is_active ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Active</span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">Inactive</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      <div className="border-t border-zinc-100" />

      {/* ── Exam Dates ── */}
      <ExamManager initialExams={exams} />

      <div className="border-t border-zinc-100" />

      {/* ── Import Users ── */}
      <UserImporter />

      <div className="border-t border-zinc-100" />

      {/* ── User Management ── */}
      <UserManager users={users} />
    </div>
  )
}
