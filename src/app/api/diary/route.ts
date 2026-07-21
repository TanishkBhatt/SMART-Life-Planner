import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const entries = await prisma.diaryEntry.findMany({ where: { userId: session.user.id }, orderBy: { date: "desc" } })
  return NextResponse.json(entries)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { title, content, date, mood } = await req.json()
  if (!title || !content) return NextResponse.json({ error: "Title and content required" }, { status: 400 })

  const entry = await prisma.diaryEntry.create({
    data: { userId: session.user.id, title, content, date: date ? new Date(date) : new Date(), mood: mood || 3 },
  })
  return NextResponse.json(entry, { status: 201 })
}
