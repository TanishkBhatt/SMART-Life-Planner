import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const habit = await prisma.habit.findFirst({ where: { id, userId: session.user.id } })
  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { date } = await req.json()
  const [y, m, d] = (date || new Date().toISOString().split("T")[0]).split("-").map(Number)
  const logDate = new Date(y, m - 1, d)

  const existing = await prisma.habitLog.findFirst({
    where: {
      habitId: id,
      date: { gte: new Date(y, m - 1, d), lt: new Date(y, m - 1, d + 1) },
    },
  })

  if (existing) {
    const newCompleted = !existing.completed
    const log = await prisma.habitLog.update({ where: { id: existing.id }, data: { completed: newCompleted } })
    await updateStreak(id, newCompleted)
    return NextResponse.json(log)
  }

  const log = await prisma.habitLog.create({ data: { habitId: id, date: logDate, completed: true } })
  await updateStreak(id, true)
  return NextResponse.json(log, { status: 201 })
}

async function updateStreak(habitId: string, completed: boolean) {
  const streak = await prisma.habitStreak.findUnique({ where: { habitId } })
  if (!streak) return

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (completed) {
    const lastLog = streak.lastLogDate ? new Date(streak.lastLogDate) : null
    let newStreak = streak.currentStreak + 1
    if (lastLog) {
      const diff = Math.round((today.getTime() - lastLog.getTime()) / (1000 * 60 * 60 * 24))
      if (diff > 1) newStreak = 1
    }
    const xp = streak.xp + 10
    const level = Math.floor(xp / 100) + 1
    await prisma.habitStreak.update({
      where: { habitId },
      data: { currentStreak: newStreak, longestStreak: Math.max(streak.longestStreak, newStreak), xp, level, lastLogDate: today },
    })
  } else {
    const xp = Math.max(0, streak.xp - 10)
    const level = Math.max(1, Math.floor(xp / 100) + 1)
    const newStreak = Math.max(0, streak.currentStreak - 1)
    await prisma.habitStreak.update({
      where: { habitId },
      data: { currentStreak: newStreak, xp, level },
    })
  }
}
