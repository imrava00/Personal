import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const budgets = await db.budgetPlan.findMany({
      orderBy: { category: 'asc' },
    })
    return NextResponse.json(budgets)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, monthlyLimit } = body

    if (!category || !monthlyLimit) {
      return NextResponse.json(
        { error: 'Category and monthly limit are required' },
        { status: 400 }
      )
    }

    const budget = await db.budgetPlan.create({
      data: {
        category,
        monthlyLimit: parseFloat(monthlyLimit),
      },
    })
    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, category, monthlyLimit } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const budget = await db.budgetPlan.update({
      where: { id },
      data: {
        ...(category !== undefined && { category }),
        ...(monthlyLimit !== undefined && { monthlyLimit: parseFloat(monthlyLimit) }),
      },
    })
    return NextResponse.json(budget)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await db.budgetPlan.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 })
  }
}
