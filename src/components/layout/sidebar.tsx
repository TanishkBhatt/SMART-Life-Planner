"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/lib/sidebar-context"
import { X } from "lucide-react"
import {
  LayoutDashboard,
  ListTodo,
  Target,
  Calendar,
  GitCompare,
  Clock,
  Timer,
  BookOpen,
  Feather,
  StickyNote,
  Smile,
  BarChart3,
  Settings,
} from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Todos", href: "/todos", icon: ListTodo },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Habits", href: "/habits", icon: GitCompare },
  { label: "Time Logs", href: "/timelogs", icon: Clock },
  { label: "Pomodoro", href: "/pomodoro", icon: Timer },
  { label: "Diary", href: "/diary", icon: BookOpen },
  { label: "Journal", href: "/journal", icon: Feather },
  { label: "Notes", href: "/notes", icon: StickyNote },
  { label: "Mood", href: "/mood", icon: Smile },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { open, setOpen } = useSidebar()

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-56 border-r border-slate-200 bg-white transition-transform duration-200 dark:border-slate-800 dark:bg-slate-950",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
          <Link href="/dashboard" className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            SMART Planner
          </Link>
          <button onClick={() => setOpen(false)} className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="space-y-0.5 overflow-y-auto p-2" style={{ height: "calc(100vh - 3.5rem)" }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
