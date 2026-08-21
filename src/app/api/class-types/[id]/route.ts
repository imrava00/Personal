import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const classType = await db.classType.update({
      where: { id },
      data: {
        name: body.name,
        subject: body.subject,
        grade: body.grade,
        hourlyRate: parseFloat(body.hourlyRate),
        color: body.color,
      },
    })
    return NextResponse.json(classType)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update class type' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.classType.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete class type' }, { status: 500 })
  }
}
