"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Feather, Pin, PinOff, Trash2, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import ReactMarkdown from "react-markdown"

type JournalEntry = { id: string; title: string; content: string; tags: string; pinned: boolean; createdAt: string }

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ title: "", content: "", tags: "" })
  const [tagFilter, setTagFilter] = useState("")
  const [showPreview, setShowPreview] = useState<string | null>(null)

  const fetchEntries = useCallback(async () => {
    const res = await fetch("/api/journal")
    if (res.ok) setEntries(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!form.title || !form.content) return
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean)
    const res = await fetch("/api/journal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, tags }) })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Failed to save")
      return
    }
    setForm({ title: "", content: "", tags: "" }); setShowForm(false); fetchEntries()
  }

  async function togglePin(entry: JournalEntry) {
    await fetch(`/api/journal/${entry.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pinned: !entry.pinned }) })
    fetchEntries()
  }

  const allTags = [...new Set(entries.flatMap((e) => {
    try { return JSON.parse(e.tags) } catch { return [] }
  }))] as string[]

  const filtered = entries.filter((e) => {
    if (!tagFilter) return true
    try { return JSON.parse(e.tags).includes(tagFilter) } catch { return false }
  })

  const sorted = [...filtered].sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Journal</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-1.5 h-4 w-4" /> New Entry</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4">
            {error && <p className="mb-3 rounded-md bg-red-50 p-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>}
            <form onSubmit={save} className="space-y-3">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              <div className="grid grid-cols-2 gap-4">
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write in **Markdown**..." rows={12} required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
                <div className="prose prose-sm max-w-none overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/50 dark:prose-invert">
                  <ReactMarkdown>{form.content || "*Start typing to see preview...*"}</ReactMarkdown>
                </div>
              </div>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma separated)"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setTagFilter("")} className={`rounded-full px-3 py-1 text-xs font-medium ${!tagFilter ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"}`}>
            All
          </button>
          {allTags.map((tag) => (
            <button key={tag} onClick={() => setTagFilter(tag)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${tagFilter === tag ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"}`}>
              {tag}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : sorted.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Feather className="mx-auto mb-2 h-8 w-8 text-slate-300" /><p className="text-sm text-slate-400">No journal entries</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((entry) => {
            const tags = (() => { try { return JSON.parse(entry.tags) } catch { return [] } })() as string[]
            return (
              <Card key={entry.id}>
                <CardContent className="py-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{entry.title}</h3>
                        {entry.pinned && <Pin className="h-3 w-3 text-indigo-500" />}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">{formatDate(entry.createdAt)}</p>
                      <div className="mt-2 prose prose-sm max-w-none dark:prose-invert line-clamp-3">
                        <ReactMarkdown>{entry.content}</ReactMarkdown>
                      </div>
                      {tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {tags.map((t: string) => (
                            <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0 ml-2">
                      <button onClick={() => togglePin(entry)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                        {entry.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={async () => { await fetch(`/api/journal/${entry.id}`, { method: "DELETE" }); fetchEntries() }}
                        className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
