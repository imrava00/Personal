import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const investments = await db.investment.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(investments)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch investments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const investment = await db.investment.create({
      data: {
        name: body.name,
        type: body.type,
        amount: parseFloat(body.amount),
        currentValue: parseFloat(body.currentValue),
        purchaseDate: new Date(body.purchaseDate),
        notes: body.notes || null,
      },
    })
    return NextResponse.json(investment, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create investment' }, { status: 500 })
  }
}
