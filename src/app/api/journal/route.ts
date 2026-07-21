import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const entries = await prisma.journalEntry.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } })
  return NextResponse.json(entries)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { title, content, tags } = await req.json()
  if (!title || !content) return NextResponse.json({ error: "Title and content required" }, { status: 400 })

  const entry = await prisma.journalEntry.create({
    data: { userId: session.user.id, title, content, tags: JSON.stringify(tags || []) },
  })
  return NextResponse.json(entry, { status: 201 })
}
