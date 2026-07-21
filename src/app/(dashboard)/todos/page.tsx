"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Pencil, Trash2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { CategorySelect } from "@/components/ui/category-select"
import { getCategory } from "@/lib/categories"

type Todo = {
  id: string
  title: string
  description: string
  status: string
  priority: string
  dueDate: string | null
  category: string
}

type FormData = {
  title: string
  description: string
  priority: string
  dueDate: string
  category: string
}

const emptyForm: FormData = { title: "", description: "", priority: "medium", dueDate: "", category: "" }

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  high: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)

  const fetchTodos = useCallback(async () => {
    const res = await fetch("/api/todos")
    if (res.ok) setTodos(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchTodos() }, [fetchTodos])

  async function saveTodo(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    const res = editing
      ? await fetch(`/api/todos/${editing}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      : await fetch("/api/todos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    if (res.ok) {
      setForm(emptyForm)
      setShowForm(false)
      setEditing(null)
      fetchTodos()
    }
  }

  async function toggleStatus(todo: Todo) {
    const newStatus = todo.status === "completed" ? "pending" : "completed"
    await fetch(`/api/todos/${todo.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) })
    fetchTodos()
  }

  async function deleteTodo(id: string) {
    await fetch(`/api/todos/${id}`, { method: "DELETE" })
    fetchTodos()
  }

  function editTodo(todo: Todo) {
    setForm({ title: todo.title, description: todo.description, priority: todo.priority, dueDate: todo.dueDate ? todo.dueDate.split("T")[0] : "", category: todo.category })
    setEditing(todo.id)
    setShowForm(true)
  }

  const filtered = todos.filter((t) => {
    if (filter === "active") return t.status !== "completed"
    if (filter === "completed") return t.status === "completed"
    return true
  }).filter((t) => {
    if (priorityFilter === "all") return true
    return t.priority === priorityFilter
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Todos</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{todos.length} total · {todos.filter(t => t.status !== "completed").length} active</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm) }}>
          <Plus className="mr-1.5 h-4 w-4" /> Add Todo
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={saveTodo} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="What needs to be done?"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Due date</label>
                  <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Category</label>
                  <div className="mt-1">
                    <CategorySelect value={form.category} onChange={(v) => setForm({ ...form, category: v })} placeholder="Select category" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editing ? "Update" : "Create"}</Button>
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm) }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {["all", "active", "completed"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === f ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          <option value="all">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">No todos found. Create one above!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((todo) => (
            <Card key={todo.id} className={`transition-opacity ${todo.status === "completed" ? "opacity-60" : ""}`}>
              <CardContent className="flex items-center gap-3 py-3">
                <button onClick={() => toggleStatus(todo)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${todo.status === "completed" ? "border-indigo-500 bg-indigo-500 text-white" : "border-slate-300 hover:border-indigo-400 dark:border-slate-600"}`}>
                  {todo.status === "completed" && <Check className="h-3 w-3" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${todo.status === "completed" ? "line-through text-slate-400" : "text-slate-900 dark:text-slate-100"}`}>{todo.title}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${priorityColors[todo.priority] || priorityColors.medium}`}>{todo.priority}</span>
                    {todo.category && (() => {
                      const cat = getCategory(todo.category)
                      return <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600 dark:bg-indigo-900/10 dark:text-indigo-400">{cat ? `${cat.emoji} ${cat.label}` : todo.category}</span>
                    })()}
                    {todo.dueDate && <span className="text-[10px] text-slate-400">{formatDate(todo.dueDate)}</span>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => editTodo(todo)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => deleteTodo(todo.id)} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
