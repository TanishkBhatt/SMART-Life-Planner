import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startOfDay } from "date-fns"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const logs = await prisma.moodLog.findMany({ where: { userId: session.user.id }, orderBy: { date: "desc" }, take: 30 })
  return NextResponse.json(logs)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { mood, note, date } = await req.json()
  if (!mood) return NextResponse.json({ error: "Mood value required" }, { status: 400 })

  const logDate = date ? startOfDay(new Date(date)) : startOfDay(new Date())
  const existing = await prisma.moodLog.findFirst({ where: { userId: session.user.id, date: logDate } })

  if (existing) {
    const updated = await prisma.moodLog.update({ where: { id: existing.id }, data: { mood: parseInt(mood), note: note || "" } })
    return NextResponse.json(updated)
  }

  const log = await prisma.moodLog.create({ data: { userId: session.user.id, mood: parseInt(mood), note: note || "", date: logDate } })
  return NextResponse.json(log, { status: 201 })
}
