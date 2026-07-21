import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const todos = await prisma.todo.findMany({
    where: { userId: session.user.id },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  })
  return NextResponse.json(todos)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { title, description, priority, dueDate, category } = await req.json()
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 })

  const count = await prisma.todo.count({ where: { userId: session.user.id } })
  const todo = await prisma.todo.create({
    data: {
      userId: session.user.id,
      title,
      description: description || "",
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : null,
      category: category || "",
      order: count,
    },
  })
  return NextResponse.json(todo, { status: 201 })
}
