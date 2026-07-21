import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ListTodo, Target, GitCompare, Smile, Timer, Clock } from "lucide-react"

async function getStats(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [todoCount, goalCount, habitCount, todayLogs, todayMood] = await Promise.all([
    prisma.todo.count({ where: { userId, status: { not: "completed" } } }),
    prisma.goal.count({ where: { userId, status: "active" } }),
    prisma.habit.count({ where: { userId } }),
    prisma.timeLog.count({ where: { userId, date: { gte: today } } }),
    prisma.moodLog.findFirst({ where: { userId, date: { gte: today } }, orderBy: { date: "desc" } }),
  ])
  return { todoCount, goalCount, habitCount, todayLogs, mood: todayMood?.mood ?? null }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  const stats = await getStats(session.user.id)

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const moodLabels = ["Awful", "Bad", "Okay", "Good", "Great"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Welcome back{session.user.name ? `, ${session.user.name}` : ""}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{today}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending Todos</CardTitle>
            <ListTodo className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.todoCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.goalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Habits Tracked</CardTitle>
            <GitCompare className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.habitCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Today Logs</CardTitle>
            <Clock className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.todayLogs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Mood Today</CardTitle>
            <Smile className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.mood ? moodLabels[stats.mood - 1] : "--"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Use the sidebar to navigate through your planner. Track todos, set goals, build habits, and more.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Focus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Timer className="mb-2 h-8 w-8 text-indigo-500" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Start a Pomodoro session or check your todos to kick off your day.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
