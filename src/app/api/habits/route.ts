import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    include: { logs: true, streak: true },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(habits)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, description, frequency, color } = await req.json()
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 })

  const habit = await prisma.habit.create({
    data: { userId: session.user.id, name, description: description || "", frequency: frequency || "daily", color: color || "#6366f1" },
  })
  await prisma.habitStreak.create({ data: { habitId: habit.id } })
  return NextResponse.json(habit, { status: 201 })
}
