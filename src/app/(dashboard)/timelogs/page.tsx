"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Clock, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { CategorySelect } from "@/components/ui/category-select"
import { getCategory } from "@/lib/categories"

type TimeLog = { id: string; description: string; duration: number; category: string; date: string }

export default function TimeLogsPage() {
  const [logs, setLogs] = useState<TimeLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ description: "", duration: "", category: "" })

  const fetchLogs = useCallback(async () => {
    const res = await fetch("/api/timelogs")
    if (res.ok) setLogs(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  async function createLog(e: React.FormEvent) {
    e.preventDefault()
    if (!form.description || !form.duration) return
    await fetch("/api/timelogs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    setForm({ description: "", duration: "", category: "" }); setShowForm(false); fetchLogs()
  }

  const totalMinutes = logs.reduce((sum, l) => sum + l.duration, 0)
  const totalHours = Math.floor(totalMinutes / 60)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Time Logs</h1>
          <p className="mt-1 text-sm text-slate-500">{totalHours}h {totalMinutes % 60}m logged</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-1.5 h-4 w-4" /> Log Time</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={createLog} className="flex flex-wrap gap-3">
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What did you do?" required
                className="flex-1 min-w-[200px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="Minutes" required min="1"
                className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              <div className="w-40">
                <CategorySelect value={form.category} onChange={(v) => setForm({ ...form, category: v })} placeholder="Category" />
              </div>
              <Button type="submit" size="sm">Save</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : logs.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Clock className="mx-auto mb-2 h-8 w-8 text-slate-300" /><p className="text-sm text-slate-400">No time logs yet</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="flex items-center gap-3 py-3">
                <Clock className="h-4 w-4 text-slate-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{log.description}</p>
                  <p className="text-xs text-slate-400">{log.category && (() => { const c = getCategory(log.category); return c ? `${c.label} · ` : `${log.category} · ` })()}{formatDate(log.date)}</p>
                </div>
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{Math.floor(log.duration / 60)}h {log.duration % 60}m</span>
                <button onClick={async () => { await fetch(`/api/timelogs/${log.id}`, { method: "DELETE" }); fetchLogs() }}
                  className="text-slate-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
