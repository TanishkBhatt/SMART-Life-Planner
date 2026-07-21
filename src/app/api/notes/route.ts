import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const notes = await prisma.note.findMany({ where: { userId: session.user.id }, orderBy: [{ pinned: "desc" }, { createdAt: "desc" }] })
  return NextResponse.json(notes)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { title, content, tags } = await req.json()
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 })

  const note = await prisma.note.create({
    data: { userId: session.user.id, title, content: content || "", tags: JSON.stringify(tags || []) },
  })
  return NextResponse.json(note, { status: 201 })
}
