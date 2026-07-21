import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const goal = await prisma.goal.findFirst({ where: { id, userId: session.user.id } })
  if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { title, dueDate } = await req.json()
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 })

  const count = await prisma.milestone.count({ where: { goalId: id } })
  const milestone = await prisma.milestone.create({ data: { goalId: id, title, dueDate: dueDate ? new Date(dueDate) : null, order: count } })
  return NextResponse.json(milestone, { status: 201 })
}
