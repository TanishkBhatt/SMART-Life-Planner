"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Timer, Play, Square, RotateCcw, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

type Session = { id: string; duration: number; intervalsCompleted: number; date: string }

const FOCUS_TIME = 25 * 60
const BREAK_TIME = 5 * 60

export default function PomodoroPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME)
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState<"focus" | "break">("focus")
  const [customMinutes, setCustomMinutes] = useState("25")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const completedRef = useRef(false)

  const fetchSessions = useCallback(async () => {
    const res = await fetch("/api/pomodoro")
    if (res.ok) setSessions(await res.json())
  }, [])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => t - 1)
    }, 1000)
    return () => { clearInterval(intervalRef.current!); intervalRef.current = null }
  }, [running])

  useEffect(() => {
    if (timeLeft !== 0 || !running || completedRef.current) return
    completedRef.current = true
    setRunning(false)
    if (phase === "focus") {
      fetch("/api/pomodoro", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ duration: parseInt(customMinutes || "25"), intervalsCompleted: 1 }) })
      fetchSessions()
    }
  }, [timeLeft, running, phase, customMinutes])

  function toggleTimer() {
    if (timeLeft === 0) return
    completedRef.current = false
    setRunning(!running)
  }

  function resetTimer() {
    completedRef.current = false
    setRunning(false)
    setTimeLeft(parseInt(customMinutes || "25") * 60)
    setPhase("focus")
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  function setCustomTimer() {
    const mins = parseInt(customMinutes)
    if (mins > 0) {
      completedRef.current = false
      setRunning(false)
      setTimeLeft(mins * 60)
      setPhase("focus")
    }
  }

  const totalFocus = sessions.reduce((s, sesh) => s + sesh.duration, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pomodoro</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card>
          <CardContent className="flex flex-col items-center py-10">
            <div className="mb-2 text-sm font-medium text-slate-500 uppercase tracking-wider">{phase}</div>
            <div className="text-7xl font-bold tabular-nums text-indigo-600 dark:text-indigo-400">{formatTime(timeLeft)}</div>
            <div className="mt-8 flex items-center gap-4">
              <button onClick={toggleTimer} className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                {running ? <Square className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>
              <button onClick={resetTimer} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <input type="number" value={customMinutes} onChange={(e) => setCustomMinutes(e.target.value)} min="1" max="120"
                className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-center text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              <span className="text-sm text-slate-500">min</span>
              <Button size="sm" variant="secondary" onClick={setCustomTimer}>Set</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-2xl font-bold text-indigo-600 dark:text-indigo-400">{Math.floor(totalFocus / 60)}h {totalFocus % 60}m</p>
            {sessions.length === 0 ? (
              <p className="text-sm text-slate-400">No sessions yet</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {sessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{formatDate(s.date)}</span>
                    <span className="font-medium">{s.duration}m</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
