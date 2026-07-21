import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const start = searchParams.get("start")
  const end = searchParams.get("end")

  const where: any = { userId: session.user.id }
  if (start && end) {
    where.start = { gte: new Date(start) }
    where.end = { lte: new Date(end) }
  }

  const events = await prisma.event.findMany({ where, orderBy: { start: "asc" } })
  return NextResponse.json(events)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { title, description, start, end, allDay, color } = await req.json()
  if (!title || !start) return NextResponse.json({ error: "Title and start are required" }, { status: 400 })

  const event = await prisma.event.create({
    data: { userId: session.user.id, title, description: description || "", start: new Date(start), end: end ? new Date(end) : null, allDay: allDay || false, color: color || "#6366f1" },
  })
  return NextResponse.json(event, { status: 201 })
}
