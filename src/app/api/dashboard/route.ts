import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export async function GET() {
  try {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const currentMonth = format(now, 'yyyy-MM')

    // Monthly transactions
    const monthlyTransactions = await db.transaction.findMany({
      where: {
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    })

    const monthlyIncome = monthlyTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const monthlyExpense = monthlyTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const monthlyBalance = monthlyIncome - monthlyExpense

    // Expense by category for current month
    const expenseByCategory: Record<string, number> = {}
    monthlyTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount
      })

    // Income by category for current month
    const incomeByCategory: Record<string, number> = {}
    monthlyTransactions
      .filter((t) => t.type === 'income')
      .forEach((t) => {
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount
      })

    // Last 6 months trend
    const trend: { month: string; income: number; expense: number; balance: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const ms = startOfMonth(d)
      const me = endOfMonth(d)
      const label = format(d, 'MMM yyyy')

      const monthTxns = await db.transaction.findMany({
        where: { date: { gte: ms, lte: me } },
      })

      const inc = monthTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const exp = monthTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

      trend.push({ month: label, income: inc, expense: exp, balance: inc - exp })
    }

    // Upcoming schedules (next 7 days)
    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)
    const upcomingSchedules = await db.schedule.findMany({
      where: {
        date: { gte: now, lte: nextWeek },
        completed: false,
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
      take: 5,
    })

    // Goals progress
    const goals = await db.financialGoal.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Budget plans
    const budgets = await db.budgetPlan.findMany()

    // Budget usage
    const budgetUsage = budgets.map((b) => {
      const spent = monthlyTransactions
        .filter((t) => t.type === 'expense' && t.category === b.category)
        .reduce((s, t) => s + t.amount, 0)
      return {
        category: b.category,
        limit: b.monthlyLimit,
        spent,
        remaining: b.monthlyLimit - spent,
        percentage: b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0,
      }
    })

    // Total all-time stats
    const allTransactions = await db.transaction.findMany()
    const totalIncome = allTransactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)
    const totalExpense = allTransactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)

    return NextResponse.json({
      currentMonth,
      monthlyIncome,
      monthlyExpense,
      monthlyBalance,
      totalIncome,
      totalExpense,
      totalBalance: totalIncome - totalExpense,
      expenseByCategory,
      incomeByCategory,
      trend,
      upcomingSchedules,
      goals,
      budgetUsage,
      transactionCount: monthlyTransactions.length,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
