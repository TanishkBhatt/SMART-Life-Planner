import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; mid: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, mid } = await params
  const goal = await prisma.goal.findFirst({ where: { id, userId: session.user.id } })
  if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const milestone = await prisma.milestone.update({ where: { id: mid }, data: body })
  return NextResponse.json(milestone)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; mid: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, mid } = await params
  const goal = await prisma.goal.findFirst({ where: { id, userId: session.user.id } })
  if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.milestone.delete({ where: { id: mid } })
  return NextResponse.json({ success: true })
}
