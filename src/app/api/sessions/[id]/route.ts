import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const session = await db.teachingSession.update({
      where: { id },
      data: {
        classTypeId: body.classTypeId,
        date: new Date(body.date),
        startTime: body.startTime,
        endTime: body.endTime,
        hours: parseFloat(body.hours),
        income: parseFloat(body.income),
        notes: body.notes || null,
      },
      include: { classType: true },
    })
    return NextResponse.json(session)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.teachingSession.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 })
  }
}
