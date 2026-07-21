"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, StickyNote, Pin, PinOff, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

type Note = { id: string; title: string; content: string; tags: string; pinned: boolean; createdAt: string }

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: "", content: "" })
  const [search, setSearch] = useState("")

  const fetchNotes = useCallback(async () => {
    const res = await fetch("/api/notes")
    if (res.ok) setNotes(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title) return
    await fetch("/api/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    setForm({ title: "", content: "" }); setShowForm(false); fetchNotes()
  }

  async function togglePin(note: Note) {
    await fetch(`/api/notes/${note.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pinned: !note.pinned }) })
    fetchNotes()
  }

  const filtered = notes.filter((n) => {
    if (!search) return true
    return n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())
  })
  const sorted = [...filtered].sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notes</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-1.5 h-4 w-4" /> New Note</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={save} className="space-y-3">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Note title" required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write something..." rows={6}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes..."
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : sorted.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><StickyNote className="mx-auto mb-2 h-8 w-8 text-slate-300" /><p className="text-sm text-slate-400">No notes yet</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((note) => (
            <Card key={note.id} className={`${note.pinned ? "ring-1 ring-indigo-200 dark:ring-indigo-800" : ""}`}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-sm font-semibold">{note.title}</h3>
                  <button onClick={() => togglePin(note)} className="text-slate-400 hover:text-indigo-500 shrink-0">
                    {note.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {note.content && <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-4 whitespace-pre-wrap">{note.content}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">{formatDate(note.createdAt)}</span>
                  <button onClick={async () => { await fetch(`/api/notes/${note.id}`, { method: "DELETE" }); fetchNotes() }}
                    className="text-slate-400 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
