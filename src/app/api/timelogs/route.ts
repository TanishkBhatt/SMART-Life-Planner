import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const logs = await prisma.timeLog.findMany({ where: { userId: session.user.id }, orderBy: { date: "desc" } })
  return NextResponse.json(logs)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { description, duration, category, date } = await req.json()
  if (!description || !duration) return NextResponse.json({ error: "Description and duration required" }, { status: 400 })

  const log = await prisma.timeLog.create({
    data: { userId: session.user.id, description, duration: parseInt(duration), category: category || "", date: date ? new Date(date) : new Date() },
  })
  return NextResponse.json(log, { status: 201 })
}
