import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const habit = await prisma.habit.findFirst({ where: { id, userId: session.user.id } })
  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const body = await req.json()
  const updated = await prisma.habit.update({ where: { id }, data: body, include: { logs: true, streak: true } })
  return NextResponse.json(updated)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const habit = await prisma.habit.findFirst({ where: { id, userId: session.user.id } })
  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 })
  await prisma.habit.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
