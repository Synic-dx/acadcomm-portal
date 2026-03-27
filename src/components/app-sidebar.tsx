'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Link2,
  ChevronDown,
  LogOut,
  User,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useState } from 'react'

type NavItem =
  | { label: string; href: string; icon: React.ReactNode; children?: never }
  | { label: string; href?: never; icon: React.ReactNode; children: { label: string; href: string }[] }

const nav: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard size={16} />,
  },
  {
    label: 'Academics',
    icon: <GraduationCap size={16} />,
    children: [
      { label: 'Grades', href: '/academics/grades' },
      { label: 'Course Materials', href: '/academics/materials' },
      { label: 'Attendance Tracker', href: '/academics/attendance' },
    ],
  },
  {
    label: 'Important Links',
    href: '/important-links',
    icon: <Link2 size={16} />,
  },
]

export function AppSidebar({ user }: { user: { email: string; full_name?: string; section?: string } }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [academicsOpen, setAcademicsOpen] = useState(
    pathname.startsWith('/academics')
  )

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = user.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase()

  return (
    <aside className="flex h-full w-60 flex-col border-r border-zinc-100 bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-zinc-100 px-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">IPM · IIM Indore</p>
          <p className="text-sm font-semibold text-zinc-900 leading-tight">AcadComm Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {nav.map((item) => {
          if (item.children) {
            const isActive = pathname.startsWith('/academics')
            return (
              <div key={item.label}>
                <button
                  onClick={() => setAcademicsOpen((o) => !o)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-zinc-100 text-zinc-900 font-medium'
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    {item.icon}
                    {item.label}
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn('transition-transform', academicsOpen && 'rotate-180')}
                  />
                </button>
                {academicsOpen && (
                  <div className="mt-0.5 ml-6 space-y-0.5 border-l border-zinc-100 pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'block rounded-md px-2 py-1.5 text-sm transition-colors',
                          pathname === child.href
                            ? 'bg-zinc-900 text-white font-medium'
                            : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-zinc-900 text-white font-medium'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-zinc-100 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-md p-2 text-left hover:bg-zinc-50 transition-colors">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-zinc-900 text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900 leading-tight">
                {user.full_name || 'Student'}
              </p>
              <p className="truncate text-xs text-zinc-400 leading-tight">
                Section {user.section || '—'}
              </p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="gap-2 text-sm">
              <User size={14} /> Account
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut} className="gap-2 text-sm text-red-500 focus:text-red-500">
              <LogOut size={14} /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
