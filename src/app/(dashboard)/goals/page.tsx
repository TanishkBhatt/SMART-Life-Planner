"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Target, Trash2, Check, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

type Milestone = { id: string; title: string; completed: boolean; dueDate: string | null; order: number }
type Goal = { id: string; title: string; description: string; targetDate: string | null; status: string; color: string; milestones: Milestone[] }

const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [color, setColor] = useState(colors[0])
  const [newMilestones, setNewMilestones] = useState<string[]>([])

  const fetchGoals = useCallback(async () => {
    const res = await fetch("/api/goals")
    if (res.ok) setGoals(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchGoals() }, [fetchGoals])

  async function createGoal(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, targetDate: targetDate || null, color }),
    })
    if (res.ok) {
      const goal = await res.json()
      for (const mt of newMilestones) {
        if (mt.trim()) await fetch(`/api/goals/${goal.id}/milestones`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: mt }),
        })
      }
      setTitle(""); setDescription(""); setTargetDate(""); setColor(colors[0]); setNewMilestones([]); setShowForm(false)
      fetchGoals()
    }
  }

  async function toggleMilestone(goalId: string, milestone: Milestone) {
    await fetch(`/api/goals/${goalId}/milestones/${milestone.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !milestone.completed }),
    })
    fetchGoals()
  }

  async function deleteGoal(id: string) {
    await fetch(`/api/goals/${id}`, { method: "DELETE" })
    fetchGoals()
  }

  async function updateGoalStatus(goal: Goal, status: string) {
    await fetch(`/api/goals/${goal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    fetchGoals()
  }

  function calcProgress(goal: Goal) {
    if (goal.milestones.length === 0) return 0
    return Math.round((goal.milestones.filter(m => m.completed).length / goal.milestones.length) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Goals</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-1.5 h-4 w-4" /> New Goal</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={createGoal} className="space-y-4">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Goal title" required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={2}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500">Target date</label>
                  <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500">Color</label>
                  <div className="mt-1 flex gap-2">
                    {colors.map((c) => (
                      <button key={c} type="button" onClick={() => setColor(c)}
                        className="h-6 w-6 rounded-full border-2 transition-all"
                        style={{ backgroundColor: c, borderColor: color === c ? c : "transparent" }}>
                        {color === c && <Check className="h-full w-full p-1 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500">Milestones (press Enter to add)</label>
                <input onKeyDown={(e) => { if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) { e.preventDefault(); setNewMilestones([...newMilestones, (e.target as HTMLInputElement).value]); (e.target as HTMLInputElement).value = "" } }}
                  placeholder="Add a milestone..."
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
                {newMilestones.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {newMilestones.map((m, i) => (
                      <span key={i} className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">
                        {m}
                        <button type="button" onClick={() => setNewMilestones(newMilestones.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Goal</Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : goals.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Target className="mx-auto mb-2 h-8 w-8 text-slate-300" /><p className="text-sm text-slate-500">No goals yet. Set your first goal!</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal) => {
            const progress = calcProgress(goal)
            return (
              <Card key={goal.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: goal.color }} />
                      <CardTitle className="text-base">{goal.title}</CardTitle>
                    </div>
                    <button onClick={() => deleteGoal(goal.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  {goal.description && <p className="mt-1 text-xs text-slate-500">{goal.description}</p>}
                  {goal.targetDate && <p className="mt-1 text-xs text-slate-400">Due: {formatDate(goal.targetDate)}</p>}
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: goal.color }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    {goal.milestones.map((m) => (
                      <div key={m.id} className="flex items-center gap-2">
                        <button onClick={() => toggleMilestone(goal.id, m)}>
                          {m.completed ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Circle className="h-3.5 w-3.5 text-slate-300" />}
                        </button>
                        <span className={`text-xs ${m.completed ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-300"}`}>{m.title}</span>
                      </div>
                    ))}
                    {goal.milestones.length === 0 && <p className="text-xs text-slate-400">No milestones yet</p>}
                  </div>
                  {goal.status === "active" && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => updateGoalStatus(goal, "completed")} className="text-xs">Complete</Button>
                      <Button size="sm" variant="ghost" onClick={() => updateGoalStatus(goal, "cancelled")} className="text-xs text-red-500">Cancel</Button>
                    </div>
                  )}
                  {goal.status !== "active" && (
                    <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${goal.status === "completed" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {goal.status}
                    </span>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
