import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const now = new Date()
    const currentMonth = month ? parseInt(month) : now.getMonth() + 1
    const currentYear = year ? parseInt(year) : now.getFullYear()

    const startDate = new Date(currentYear, currentMonth - 1, 1)
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59)

    const [sessions, expenses, investments] = await Promise.all([
      db.teachingSession.findMany({
        where: { date: { gte: startDate, lte: endDate } },
        include: { classType: true },
      }),
      db.expense.findMany({
        where: { date: { gte: startDate, lte: endDate } },
      }),
      db.investment.findMany(),
    ])

    const totalIncome = sessions.reduce((sum, s) => sum + s.income, 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const totalHours = sessions.reduce((sum, s) => sum + s.hours, 0)
    const netSavings = totalIncome - totalExpenses

    const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0)
    const totalCurrentValue = investments.reduce((sum, i) => sum + i.currentValue, 0)
    const investmentReturn = totalCurrentValue - totalInvested
    const investmentReturnPct = totalInvested > 0 ? ((investmentReturn / totalInvested) * 100) : 0

    // Expense by category
    const expenseByCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {} as Record<string, number>)

    // Income by class type
    const incomeByClassType = sessions.reduce((acc, s) => {
      const name = s.classType.name
      acc[name] = (acc[name] || 0) + s.income
      return acc
    }, {} as Record<string, number>)

    // Daily expenses for chart
    const dailyExpenses: Record<string, number> = {}
    expenses.forEach(e => {
      const day = new Date(e.date).getDate().toString()
      dailyExpenses[day] = (dailyExpenses[day] || 0) + e.amount
    })

    // Monthly trend (last 6 months)
    const monthlyTrend = []
    for (let i = 5; i >= 0; i--) {
      const mDate = new Date(currentYear, currentMonth - 1 - i, 1)
      const mEndDate = new Date(currentYear, currentMonth - i, 0, 23, 59, 59)
      monthlyTrend.push({
        month: mDate.toLocaleString('default', { month: 'short' }),
        year: mDate.getFullYear(),
        monthNum: mDate.getMonth() + 1,
      })
    }

    const monthlyData = await Promise.all(
      monthlyTrend.map(async (m) => {
        const mStart = new Date(m.year, m.monthNum - 1, 1)
        const mEnd = new Date(m.year, m.monthNum, 0, 23, 59, 59)
        const [mSessions, mExpenses] = await Promise.all([
          db.teachingSession.findMany({ where: { date: { gte: mStart, lte: mEnd } } }),
          db.expense.findMany({ where: { date: { gte: mStart, lte: mEnd } } }),
        ])
        return {
          month: m.month,
          income: mSessions.reduce((s, sess) => s + sess.income, 0),
          expenses: mExpenses.reduce((s, e) => s + e.amount, 0),
        }
      })
    )

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      netSavings,
      totalHours,
      totalSessions: sessions.length,
      totalInvested,
      totalCurrentValue,
      investmentReturn,
      investmentReturnPct,
      expenseByCategory,
      incomeByClassType,
      dailyExpenses,
      monthlyTrend: monthlyData,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
