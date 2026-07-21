"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-14 items-center border-b border-slate-200 px-4 dark:border-slate-800">
        <Link href="/dashboard" className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
          SMART Planner
        </Link>
      </div>
      <nav className="space-y-0.5 overflow-y-auto p-2" style={{ height: "calc(100vh - 3.5rem)" }}>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
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
  )
}
