import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const classTypes = await db.classType.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { sessions: true } } },
    })
    return NextResponse.json(classTypes)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch class types' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const classType = await db.classType.create({
      data: {
        name: body.name,
        subject: body.subject,
        grade: body.grade,
        hourlyRate: parseFloat(body.hourlyRate),
        color: body.color || '#6366f1',
      },
    })
    return NextResponse.json(classType, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create class type' }, { status: 500 })
  }
}
