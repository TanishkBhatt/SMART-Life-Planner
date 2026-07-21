"use client"

import { useEffect, useState, useCallback } from "react"
import { BarChart3, FileJson, FileText, TrendingUp, CheckCircle2, Target, Clock, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ReportsPage() {
  const [data, setData] = useState<{
    todos: number; completedTodos: number; goals: number; completedGoals: number
    habits: number; habitLogs: number; totalMinutes: number; moodAvg: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const [todos, goals, habits, timelogs, mood] = await Promise.all([
      fetch("/api/todos").then((r) => r.json()),
      fetch("/api/goals").then((r) => r.json()),
      fetch("/api/habits").then((r) => r.json()),
      fetch("/api/timelogs").then((r) => r.json()),
      fetch("/api/mood").then((r) => r.json()),
    ])
    setData({
      todos: todos.length,
      completedTodos: todos.filter((t: any) => t.status === "completed").length,
      goals: goals.length,
      completedGoals: goals.filter((g: any) => g.status === "completed").length,
      habits: habits.length,
      habitLogs: habits.reduce((s: number, h: any) => s + h.logs.length, 0),
      totalMinutes: timelogs.reduce((s: number, l: any) => s + l.duration, 0),
      moodAvg: mood.length > 0 ? Math.round(mood.reduce((s: number, m: any) => s + m.mood, 0) / mood.length * 10) / 10 : 0,
    })
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function exportCSV() {
    if (!data) return
    const rows = [
      ["Report", "Value"],
      ["Total Todos", String(data.todos)],
      ["Completed Todos", String(data.completedTodos)],
      ["Total Goals", String(data.goals)],
      ["Completed Goals", String(data.completedGoals)],
      ["Habits Tracked", String(data.habits)],
      ["Habit Check-ins", String(data.habitLogs)],
      ["Total Time (min)", String(data.totalMinutes)],
      ["Avg Mood (7d)", String(data.moodAvg)],
      ["Generated", new Date().toISOString()],
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `smart-life-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  async function exportJSON() {
    if (!data) return
    const json = JSON.stringify({ ...data, exportedAt: new Date().toISOString() }, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `smart-life-report-${new Date().toISOString().split("T")[0]}.json`
    a.click(); URL.revokeObjectURL(url)
  }

  if (loading) return <p className="text-sm text-slate-500">Loading report...</p>
  if (!data) return null

  const todoCompletion = data.todos > 0 ? Math.round(data.completedTodos / data.todos * 100) : 0
  const goalCompletion = data.goals > 0 ? Math.round(data.completedGoals / data.goals * 100) : 0
  const totalHours = Math.floor(data.totalMinutes / 60)
  const totalMins = data.totalMinutes % 60

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="mt-1 text-sm text-slate-500">Your life at a glance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={exportCSV}><FileText className="mr-1.5 h-4 w-4" /> CSV</Button>
          <Button variant="secondary" size="sm" onClick={exportJSON}><FileJson className="mr-1.5 h-4 w-4" /> JSON</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Todos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{data.todos}</p>
              <span className="text-xs text-slate-400">tasks</span>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500">{data.completedTodos} done</span>
                <span className="text-emerald-600 font-medium">{todoCompletion}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${todoCompletion}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{data.goals}</p>
              <span className="text-xs text-slate-400">goals</span>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500">{data.completedGoals} achieved</span>
                <span className="text-emerald-600 font-medium">{goalCompletion}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${goalCompletion}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Habits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{data.habits}</p>
              <span className="text-xs text-slate-400">tracked</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">{data.habitLogs} total check-ins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Time Logged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{totalHours}</p>
              <span className="text-sm text-slate-500">h {totalMins}m</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">{Math.round(data.totalMinutes / 60 / 7)}h/week avg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Avg Mood</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">{data.moodAvg}</p>
              <span className="text-xs text-slate-400">/5</span>
            </div>
            <div className="mt-2 flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= Math.round(data.moodAvg) ? "bg-rose-500" : "bg-slate-200 dark:bg-slate-700"}`} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-950 border-indigo-100 dark:border-indigo-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            Weekly Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-3 rounded-lg bg-white/60 p-4 dark:bg-slate-900/60">
              <div className="rounded-full bg-indigo-100 p-2 dark:bg-indigo-900/30">
                <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">Tasks</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {data.completedTodos} of {data.todos} completed ({todoCompletion}%)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-white/60 p-4 dark:bg-slate-900/60">
              <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/30">
                <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">Goals</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {data.completedGoals} of {data.goals} achieved ({goalCompletion}%)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-white/60 p-4 dark:bg-slate-900/60">
              <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/30">
                <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">Habits</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {data.habitLogs} check-ins across {data.habits} habits
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-white/60 p-4 dark:bg-slate-900/60">
              <div className="rounded-full bg-rose-100 p-2 dark:bg-rose-900/30">
                <Star className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">Wellbeing</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mood average {data.moodAvg}/5 · {totalHours}h tracked
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
