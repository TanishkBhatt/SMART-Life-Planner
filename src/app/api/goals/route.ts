import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id },
    include: { milestones: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(goals)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { title, description, targetDate, color } = await req.json()
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 })

  const goal = await prisma.goal.create({
    data: { userId: session.user.id, title, description: description || "", targetDate: targetDate ? new Date(targetDate) : null, color: color || "#6366f1" },
    include: { milestones: true },
  })
  return NextResponse.json(goal, { status: 201 })
}
