"use client"

import { useEffect, useState, useCallback } from "react"
import { Smile, Frown, Meh, SmilePlus, Angry } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

type MoodLog = { id: string; mood: number; note: string; date: string }

const moods = [
  { value: 1, label: "Awful", icon: Angry, color: "text-red-500" },
  { value: 2, label: "Bad", icon: Frown, color: "text-orange-500" },
  { value: 3, label: "Okay", icon: Meh, color: "text-yellow-500" },
  { value: 4, label: "Good", icon: Smile, color: "text-lime-500" },
  { value: 5, label: "Great", icon: SmilePlus, color: "text-green-500" },
]

export default function MoodPage() {
  const [logs, setLogs] = useState<MoodLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<number | null>(null)
  const [note, setNote] = useState("")

  const fetchLogs = useCallback(async () => {
    const res = await fetch("/api/mood")
    if (res.ok) setLogs(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  async function saveMood() {
    if (!selected) return
    await fetch("/api/mood", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mood: selected, note }) })
    setSelected(null); setNote(""); fetchLogs()
  }

  const todayLog = logs.find((l) => new Date(l.date).toDateString() === new Date().toDateString())
  const weekLogs = logs.slice(0, 7).reverse()
  const avgMood = weekLogs.length > 0 ? Math.round(weekLogs.reduce((s, l) => s + l.mood, 0) / weekLogs.length) : 0

  function getMoodEmoji(mood: number) {
    return moods[mood - 1] || moods[2]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mood Tracker</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>How are you feeling today?</CardTitle>
          </CardHeader>
          <CardContent>
            {todayLog ? (() => {
              const MoodIcon = getMoodEmoji(todayLog.mood).icon
              return (
                <div className="text-center py-4">
                  <MoodIcon className={`h-16 w-16 mx-auto ${getMoodEmoji(todayLog.mood).color}`} />
                  <p className="text-lg font-medium">{getMoodEmoji(todayLog.mood).label}</p>
                  {todayLog.note && <p className="mt-2 text-sm text-slate-500">{todayLog.note}</p>}
                  <p className="mt-4 text-xs text-slate-400">Already logged today</p>
                </div>
              )
            })() : (
              <>
                <div className="flex flex-wrap justify-center gap-2 py-4">
                  {moods.map((m) => {
                    const Icon = m.icon
                    return (
                      <button key={m.value} onClick={() => setSelected(m.value)}
                        className={`flex flex-col items-center gap-1 rounded-xl p-3 transition-all ${selected === m.value ? "bg-slate-100 scale-110 dark:bg-slate-800" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>
                        <Icon className={`h-8 w-8 ${m.color}`} />
                        <span className="text-[10px] text-slate-500">{m.label}</span>
                      </button>
                    )
                  })}
                </div>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note (optional)"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
                <button onClick={saveMood} disabled={!selected}
                  className="mt-3 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                  Log Mood
                </button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Mood</CardTitle>
          </CardHeader>
          <CardContent>
            {weekLogs.length > 0 ? (
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-3xl font-bold">{avgMood}/5</p>
                  <p className="text-xs text-slate-400">7-day average</p>
                </div>
                <div className="space-y-2">
                  {weekLogs.map((log) => {
                    const m = getMoodEmoji(log.mood)
                    const Icon = m.icon
                    return (
                      <div key={log.id} className="flex items-center gap-2 text-sm">
                        <Icon className={`h-4 w-4 ${m.color}`} />
                        <span className="flex-1 text-xs text-slate-500">{formatDate(log.date)}</span>
                        <span className="text-xs font-medium">{m.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">No mood data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
