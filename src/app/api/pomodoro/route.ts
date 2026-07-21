import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const sessions = await prisma.pomodoroSession.findMany({ where: { userId: session.user.id }, orderBy: { date: "desc" }, take: 50 })
  return NextResponse.json(sessions)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { duration, intervalsCompleted, date } = await req.json()
  const p = await prisma.pomodoroSession.create({
    data: { userId: session.user.id, duration: parseInt(duration), intervalsCompleted: intervalsCompleted || 1, date: date ? new Date(date) : new Date() },
  })
  return NextResponse.json(p, { status: 201 })
}
