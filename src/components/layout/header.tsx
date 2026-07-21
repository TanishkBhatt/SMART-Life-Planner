"use client"

import { useTheme } from "next-themes"
import { useSession, signOut } from "next-auth/react"
import { Sun, Moon, LogOut, Menu } from "lucide-react"
import { getInitials } from "@/lib/utils"
import { useSidebar } from "@/lib/sidebar-context"
import { useEffect, useState } from "react"

export function Header() {
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()
  const { toggle } = useSidebar()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80 lg:justify-end">
      <button
        onClick={toggle}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
          {getInitials(session?.user?.name)}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
