import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const event = await prisma.event.findFirst({ where: { id, userId: session.user.id } })
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const data: any = { ...body }
  if (body.start) data.start = new Date(body.start)
  if (body.end) data.end = new Date(body.end)

  const updated = await prisma.event.update({ where: { id }, data })
  return NextResponse.json(updated)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const event = await prisma.event.findFirst({ where: { id, userId: session.user.id } })
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.event.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
