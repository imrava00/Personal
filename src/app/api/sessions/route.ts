import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    let where: Record<string, unknown> = {}
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
      where = {
        date: {
          gte: startDate,
          lte: endDate,
        },
      }
    }

    const sessions = await db.teachingSession.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { classType: true },
    })
    return NextResponse.json(sessions)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const session = await db.teachingSession.create({
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
    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}
