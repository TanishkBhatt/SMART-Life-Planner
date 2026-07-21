"use client"

import { useEffect, useState, useCallback } from "react"
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type Event = { id: string; title: string; description: string; start: string; end: string | null; allDay: boolean; color: string }

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startPad = first.getDay()
  const days: (number | null)[] = []
  for (let i = 0; i < startPad; i++) days.push(null)
  for (let d = 1; d <= last.getDate(); d++) days.push(d)
  while (days.length % 7 !== 0) days.push(null)
  return days
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [today] = useState(new Date())
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: "", start: "", end: "", color: "#6366f1" })
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const fetchEvents = useCallback(async () => {
    const start = new Date(year, month, 1).toISOString()
    const end = new Date(year, month + 1, 0, 23, 59).toISOString()
    const res = await fetch(`/api/events?start=${start}&end=${end}`)
    if (res.ok) setEvents(await res.json())
  }, [year, month])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  function getEventsForDay(day: number) {
    const date = new Date(year, month, day)
    return events.filter((e) => sameDay(new Date(e.start), date))
  }

  async function createEvent(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.start) return
    const res = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    if (res.ok) {
      setForm({ title: "", start: "", end: "", color: "#6366f1" })
      setShowForm(false)
      setSelectedDay(null)
      fetchEvents()
    }
  }

  async function deleteEvent(id: string) {
    await fetch(`/api/events/${id}`, { method: "DELETE" })
    fetchEvents()
  }

  const days = getMonthDays(year, month)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <Button onClick={() => { setShowForm(true); setSelectedDay(null) }}><Plus className="mr-1.5 h-4 w-4" /> Add Event</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <button onClick={() => { if (month === 0) { setYear(year - 1); setMonth(11) } else setMonth(month - 1) }} className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h2 className="text-lg font-semibold">{monthNames[month]} {year}</h2>
              <button onClick={() => { if (month === 11) { setYear(year + 1); setMonth(0) } else setMonth(month + 1) }} className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-500 mb-2">
              {dayNames.map((d) => (<div key={d} className="py-1">{d}</div>))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((day, i) => {
                const dayEvents = day ? getEventsForDay(day) : []
                const isToday = day ? sameDay(new Date(year, month, day), today) : false
                return (
                  <div
                    key={i}
                    onClick={() => { if (day) { setSelectedDay(new Date(year, month, day)); setShowForm(true); setForm({ ...form, start: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T09:00` }) } }}
                    className={`min-h-[80px] cursor-pointer border-b border-r border-slate-100 p-1 text-xs transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 ${!day ? "bg-slate-50/50 dark:bg-slate-900/50" : ""} ${isToday ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""}`}
                  >
                    {day && (
                      <>
                        <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${isToday ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400"}`}>{day}</span>
                        <div className="mt-1 space-y-0.5">
                          {dayEvents.slice(0, 2).map((ev) => (
                            <div key={ev.id} className="truncate rounded px-1 py-0.5 text-[10px] font-medium text-white" style={{ backgroundColor: ev.color }}>
                              {ev.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && <span className="text-[10px] text-slate-400">+{dayEvents.length - 2} more</span>}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {showForm && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">New Event</h3>
                  <button onClick={() => { setShowForm(false); setSelectedDay(null) }}><X className="h-4 w-4" /></button>
                </div>
                <form onSubmit={createEvent} className="space-y-3">
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
                  <div>
                    <label className="text-xs font-medium text-slate-500">Start</label>
                    <input type="datetime-local" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500">End</label>
                    <input type="datetime-local" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500">Color</label>
                    <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="mt-1 h-8 w-full rounded border border-slate-300 cursor-pointer" />
                  </div>
                  <Button type="submit" className="w-full">Save Event</Button>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-4">
              <h3 className="mb-3 text-sm font-semibold">Events</h3>
              {events.length === 0 ? (
                <p className="text-xs text-slate-400">No events this month</p>
              ) : (
                <div className="space-y-2">
                  {events.map((ev) => (
                    <div key={ev.id} className="flex items-center gap-2 rounded-lg border border-slate-100 p-2 dark:border-slate-800">
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{ev.title}</p>
                        <p className="text-[10px] text-slate-400">{new Date(ev.start).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
                      </div>
                      <button onClick={() => deleteEvent(ev.id)} className="text-slate-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
