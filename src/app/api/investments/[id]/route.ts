import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const investment = await db.investment.update({
      where: { id },
      data: {
        name: body.name,
        type: body.type,
        amount: parseFloat(body.amount),
        currentValue: parseFloat(body.currentValue),
        purchaseDate: new Date(body.purchaseDate),
        notes: body.notes || null,
      },
    })
    return NextResponse.json(investment)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update investment' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.investment.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete investment' }, { status: 500 })
  }
}