import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { FolderOpen, ExternalLink } from 'lucide-react'
import type { Term, Course } from '@/data/timetable'

export default async function MaterialsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: termsData } = await supabase
    .from('terms')
    .select('*')
    .order('start_date', { ascending: true })

  const terms = (termsData ?? []) as Term[]

  const coursesPerTerm: Record<string, Course[]> = {}
  if (terms.length > 0) {
    const { data: allCourses } = await supabase
      .from('courses')
      .select('*')
      .in('term_id', terms.map(t => t.id))
      .order('name')

    for (const course of (allCourses ?? []) as Course[]) {
      if (!coursesPerTerm[course.term_id]) coursesPerTerm[course.term_id] = []
      coursesPerTerm[course.term_id].push(course)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Course Materials</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Study materials, slides, and resources by term</p>
      </div>

      {terms.length === 0 ? (
        <p className="text-sm text-zinc-400 py-4">No terms found. Ask your admin to set up terms and courses.</p>
      ) : (
        <div className="space-y-4">
          {terms.slice().reverse().map(term => {
            const courses = coursesPerTerm[term.id] ?? []
            return (
              <div key={term.id} className="rounded-xl border border-zinc-100 bg-white overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-50">
                  <div className="flex items-center gap-2">
                    <FolderOpen size={16} className="text-zinc-400" />
                    <h2 className="text-sm font-semibold text-zinc-900">{term.name}</h2>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      term.is_active
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 text-xs'
                        : 'border-zinc-200 text-zinc-400 text-xs'
                    }
                  >
                    {term.is_active ? 'Current' : 'Archived'}
                  </Badge>
                </div>

                {courses.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-zinc-400">No courses added for this term.</p>
                ) : (
                  <div className="p-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {courses.map(course => (
                      <div
                        key={course.id}
                        className="flex items-start justify-between gap-2 rounded-lg p-3 border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50 transition-all group"
                      >
                        <div className="min-w-0">
                          <p className="text-sm text-zinc-700 group-hover:text-zinc-900 font-medium truncate">
                            {course.name}
                          </p>
                          <p className="text-xs text-zinc-400 font-mono mt-0.5">{course.abbreviation}</p>
                        </div>
                        {course.notes_folder_link && (
                          <a
                            href={course.notes_folder_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-blue-500 hover:text-blue-700"
                            title="Open notes folder"
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {term.is_active && (
                  <p className="px-5 pb-4 text-xs text-zinc-400">
                    Materials will be uploaded by faculty and shared via the Academic Committee.
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
