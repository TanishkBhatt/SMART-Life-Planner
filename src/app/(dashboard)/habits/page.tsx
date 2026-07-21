"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Check, Flame, Award, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type HabitLog = { id: string; date: string; completed: boolean }
type HabitStreak = { currentStreak: number; longestStreak: number; xp: number; level: number }
type Habit = { id: string; name: string; color: string; logs: HabitLog[]; streak: HabitStreak | null }

function getLast7Days() {
  const days = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    days.push(`${y}-${m}-${day}`)
  }
  return days
}

function getLevelBadge(level: number) {
  if (level >= 10) return { label: "Platinum", color: "text-slate-400" }
  if (level >= 5) return { label: "Gold", color: "text-amber-500" }
  if (level >= 3) return { label: "Silver", color: "text-slate-300" }
  return { label: "Bronze", color: "text-amber-700" }
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [color, setColor] = useState("#6366f1")
  const days = getLast7Days()

  const fetchHabits = useCallback(async () => {
    const res = await fetch("/api/habits")
    if (res.ok) setHabits(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchHabits() }, [fetchHabits])

  async function createHabit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const res = await fetch("/api/habits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, color }) })
    if (res.ok) { setName(""); setShowForm(false); fetchHabits() }
  }

  async function toggleLog(habitId: string, date: string) {
    await fetch(`/api/habits/${habitId}/logs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date }) })
    fetchHabits()
  }

  function isLogged(habit: Habit, date: string) {
    return habit.logs.some((l) => l.date.startsWith(date) && l.completed)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Habits</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-1.5 h-4 w-4" /> New Habit</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={createHabit} className="flex items-end gap-3">
              <div className="flex-1">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Habit name" required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              </div>
              <div>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-9 rounded border border-slate-300 cursor-pointer" />
              </div>
              <Button type="submit" size="sm">Add</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : habits.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><p className="text-sm text-slate-400">No habits yet. Start tracking!</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => {
            const badge = getLevelBadge(habit.streak?.level || 1)
            return (
              <Card key={habit.id}>
                <CardContent className="flex items-center gap-4 py-3">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: habit.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{habit.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {habit.streak && (
                        <>
                          <span className="flex items-center gap-0.5 text-xs text-orange-500"><Flame className="h-3 w-3" />{habit.streak.currentStreak}</span>
                          <span className="flex items-center gap-0.5 text-xs text-slate-400"><Award className="h-3 w-3" /> Lv.{habit.streak.level} {badge.label}</span>
                          <span className="text-xs text-slate-400">{habit.streak.xp} XP</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {days.map((day) => {
                      const logged = isLogged(habit, day)
                      const dayDate = new Date(day + "T00:00:00")
                      const dayName = dayDate.toLocaleDateString("en-US", { weekday: "short" }).charAt(0)
                      return (
                        <button key={day} onClick={() => toggleLog(habit.id, day)}
                          className={`flex h-8 w-8 flex-col items-center justify-center rounded-lg text-[10px] transition-colors ${logged ? "text-white" : "border border-slate-200 text-slate-400 hover:border-slate-300 dark:border-slate-700"}`}
                          style={logged ? { backgroundColor: habit.color } : {}}>
                          <span>{dayName}</span>
                          {logged && <Check className="h-2.5 w-2.5" />}
                        </button>
                      )
                    })}
                  </div>
                  <button onClick={async () => { await fetch(`/api/habits/${habit.id}`, { method: "DELETE" }); fetchHabits() }}
                    className="text-slate-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
