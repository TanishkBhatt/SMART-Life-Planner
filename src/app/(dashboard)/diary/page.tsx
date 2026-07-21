"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

type Entry = { id: string; title: string; content: string; date: string; mood: number }

export default function DiaryPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ title: "", content: "", date: new Date().toISOString().split("T")[0], mood: "3" })

  const fetchEntries = useCallback(async () => {
    const res = await fetch("/api/diary")
    if (res.ok) setEntries(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!form.title || !form.content) return
    const url = editing ? `/api/diary/${editing}` : "/api/diary"
    const method = editing ? "PATCH" : "POST"
    const body = { ...form, mood: parseInt(form.mood) }
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Failed to save")
      return
    }
    setForm({ title: "", content: "", date: new Date().toISOString().split("T")[0], mood: "3" })
    setShowForm(false); setEditing(null); fetchEntries()
  }

  function editEntry(entry: Entry) {
    setForm({ title: entry.title, content: entry.content, date: entry.date.split("T")[0], mood: String(entry.mood) })
    setEditing(entry.id); setShowForm(true)
  }

  const moodLabels = ["Awful", "Bad", "Okay", "Good", "Great"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Diary</h1>
        <Button onClick={() => { setShowForm(true); setEditing(null); setForm({ title: "", content: "", date: new Date().toISOString().split("T")[0], mood: "3" }) }}>
          <Plus className="mr-1.5 h-4 w-4" /> New Entry
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4">
            {error && <p className="mb-3 rounded-md bg-red-50 p-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>}
            <form onSubmit={save} className="space-y-3">
              <div className="flex gap-3">
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" required
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              </div>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your thoughts..." rows={6} required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Mood:</span>
                {moodLabels.map((label, i) => (
                  <button key={i} type="button" onClick={() => setForm({ ...form, mood: String(i + 1) })}
                    className={`rounded px-2 py-0.5 text-xs font-medium transition-all ${form.mood === String(i + 1) ? "bg-indigo-100 text-indigo-700 scale-110 dark:bg-indigo-900/30 dark:text-indigo-400" : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"}`}>{label}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editing ? "Update" : "Save"}</Button>
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setEditing(null) }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : entries.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><BookOpen className="mx-auto mb-2 h-8 w-8 text-slate-300" /><p className="text-sm text-slate-400">No diary entries yet</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="py-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{entry.title}</h3>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800">{moodLabels[entry.mood - 1] || "Okay"}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{formatDate(entry.date)}</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap line-clamp-3">{entry.content}</p>
                  </div>
                  <div className="flex gap-1 shrink-0 ml-2">
                    <button onClick={() => editEntry(entry)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={async () => { await fetch(`/api/diary/${entry.id}`, { method: "DELETE" }); fetchEntries() }}
                      className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
