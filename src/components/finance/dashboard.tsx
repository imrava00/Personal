'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp, TrendingDown, Clock, GraduationCap,
  PiggyBank, Wallet, ArrowUpRight, ArrowDownRight, Banknote
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

interface DashboardData {
  totalIncome: number
  totalExpenses: number
  netSavings: number
  totalHours: number
  totalSessions: number
  totalInvested: number
  totalCurrentValue: number
  investmentReturn: number
  investmentReturnPct: number
  expenseByCategory: Record<string, number>
  incomeByClassType: Record<string, number>
  dailyExpenses: Record<string, number>
  monthlyTrend: { month: string; income: number; expenses: number }[]
}

export function Dashboard() {
  const { selectedMonth, selectedYear } = useAppStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/dashboard?month=${selectedMonth}&year=${selectedYear}`)
      .then(res => res.json())
      .then(json => { if (!cancelled) { setData(json); setLoading(false) } })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [selectedMonth, selectedYear])

  if (loading || !data) {
    return <DashboardSkeleton />
  }

  const expensePieData = Object.entries(data.expenseByCategory).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
  const incomePieData = Object.entries(data.incomeByClassType).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
  const dailyData = Object.entries(data.dailyExpenses)
    .map(([day, amount]) => ({ day: `Day ${day}`, amount: Math.round(amount * 100) / 100 }))
    .sort((a, b) => parseInt(a.day.replace('Day ', '')) - parseInt(b.day.replace('Day ', '')))

  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`
  const fmtShort = (n: number) => `Rp ${n.toLocaleString('id-ID')}`
  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Financial Overview</h2>
        <p className="text-muted-foreground">{monthName} Summary</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Income</span>
            </div>
            <p className="text-xl font-bold text-emerald-800 dark:text-emerald-300">{fmt(data.totalIncome)}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50">
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-xs font-medium text-red-700 dark:text-red-400">Expenses</span>
            </div>
            <p className="text-xl font-bold text-red-800 dark:text-red-300">{fmt(data.totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                <Wallet className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Net Savings</span>
            </div>
            <p className={`text-xl font-bold ${data.netSavings >= 0 ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'}`}>
              {fmt(data.netSavings)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/50">
                <Clock className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-xs font-medium text-violet-700 dark:text-violet-400">Hours Taught</span>
            </div>
            <p className="text-xl font-bold text-violet-800 dark:text-violet-300">{data.totalHours}h</p>
            <p className="text-xs text-violet-600 dark:text-violet-500">{data.totalSessions} sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Investment Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Invested</span>
            </div>
            <p className="text-lg font-semibold">{fmt(data.totalInvested)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Banknote className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Current Value</span>
            </div>
            <p className="text-lg font-semibold">{fmt(data.totalCurrentValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              {data.investmentReturn >= 0
                ? <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                : <ArrowDownRight className="h-4 w-4 text-red-500" />
              }
              <span className="text-sm text-muted-foreground">Investment Return</span>
            </div>
            <p className={`text-lg font-semibold ${data.investmentReturn >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {fmt(data.investmentReturn)} ({data.investmentReturnPct.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense by Category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center">
              {expensePieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {expensePieData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-sm w-full text-center">No expenses this month</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {expensePieData.map((item, idx) => (
                <Badge key={item.name} variant="secondary" className="text-xs">
                  <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  {item.name}: {fmt(item.value)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Income by Class Type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Income by Class Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center">
              {incomePieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {incomePieData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-sm w-full text-center">No income this month</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {incomePieData.map((item, idx) => (
                <Badge key={item.name} variant="secondary" className="text-xs">
                  <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  {item.name}: {fmt(item.value)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Expense Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Daily Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
                    <Line type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Amount" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground text-sm">No expense data this month</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-7 w-48 bg-muted animate-pulse rounded" />
        <div className="h-4 w-36 bg-muted animate-pulse rounded mt-2" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardContent className="p-4"><div className="h-20 bg-muted animate-pulse rounded" /></CardContent></Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardContent className="p-4"><div className="h-64 bg-muted animate-pulse rounded" /></CardContent></Card>
        ))}
      </div>
    </div>
  )
}