import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const note = await prisma.note.findFirst({ where: { id, userId: session.user.id } })
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  if (body.tags) body.tags = JSON.stringify(body.tags)
  const updated = await prisma.note.update({ where: { id }, data: body })
  return NextResponse.json(updated)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const note = await prisma.note.findFirst({ where: { id, userId: session.user.id } })
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 })
  await prisma.note.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
