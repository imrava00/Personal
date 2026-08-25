'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CalendarDays,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { format } from 'date-fns'

interface DashboardData {
  currentMonth: string
  monthlyIncome: number
  monthlyExpense: number
  monthlyBalance: number
  totalIncome: number
  totalExpense: number
  totalBalance: number
  expenseByCategory: Record<string, number>
  incomeByCategory: Record<string, number>
  trend: { month: string; income: number; expense: number; balance: number }[]
  upcomingSchedules: { id: string; title: string; date: string; time: string | null; category: string }[]
  goals: { id: string; title: string; targetAmount: number; currentAmount: number; deadline: string | null }[]
  budgetUsage: { category: string; limit: number; spent: number; remaining: number; percentage: number }[]
  transactionCount: number
}

const EXPENSE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899', '#6366f1']
const INCOME_COLORS = ['#22c55e', '#06b6d4', '#8b5cf6', '#3b82f6', '#14b8a6', '#f59e0b']

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color,
}: {
  title: string
  value: string
  icon: React.ElementType
  trend?: 'up' | 'down'
  trendLabel?: string
  color: string
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {trend && trendLabel && (
              <div className={`flex items-center gap-1 text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                <span>{trendLabel}</span>
              </div>
            )}
          </div>
          <div className={`rounded-full p-3 ${color === 'text-green-600' ? 'bg-green-100' : color === 'text-red-600' ? 'bg-red-100' : color === 'text-emerald-600' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
            <Icon className={`h-5 w-5 ${color === 'text-green-600' ? 'text-green-600' : color === 'text-red-600' ? 'text-red-600' : color === 'text-emerald-600' ? 'text-emerald-600' : 'text-blue-600'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="mt-2 h-8 w-32 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        Failed to load dashboard data. Please try refreshing.
      </Card>
    )
  }

  const expensePieData = Object.entries(data.expenseByCategory).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
  const incomePieData = Object.entries(data.incomeByCategory).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))

  const fmt = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Monthly Income"
          value={fmt(data.monthlyIncome)}
          icon={TrendingUp}
          color="text-green-600"
          trend={data.monthlyIncome > 0 ? 'up' : undefined}
          trendLabel={data.transactionCount > 0 ? `${data.transactionCount} transactions` : undefined}
        />
        <StatCard
          title="Monthly Expenses"
          value={fmt(data.monthlyExpense)}
          icon={TrendingDown}
          color="text-red-600"
        />
        <StatCard
          title="Monthly Balance"
          value={fmt(data.monthlyBalance)}
          icon={Wallet}
          color={data.monthlyBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}
          trend={data.monthlyBalance >= 0 ? 'up' : 'down'}
          trendLabel={data.monthlyBalance >= 0 ? 'Surplus' : 'Deficit'}
        />
        <StatCard
          title="Total Savings"
          value={fmt(data.totalBalance)}
          icon={Wallet}
          color="text-blue-600"
        />
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Income vs Expenses Trend</CardTitle>
          <CardDescription>Monthly comparison over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis className="text-xs" tick={{ fontSize: 12 }} tickFormatter={(v) => `Rp${(v / 1000).toLocaleString('id-ID')}K`} />
                <Tooltip
                  formatter={(value: number) => [`Rp${value.toLocaleString('id-ID')}`, undefined]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                />
                <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pie Charts & Side Panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {expensePieData.length > 0 ? (
              <div className="h-64">
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
                      {expensePieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`Rp${value.toLocaleString('id-ID')}`]} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                No expenses this month
              </div>
            )}
          </CardContent>
        </Card>

        {/* Income Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Income Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {incomePieData.length > 0 ? (
              <div className="h-64">
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
                      {incomePieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`Rp${value.toLocaleString('id-ID')}`]} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                No income this month
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Schedules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="h-5 w-5" />
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingSchedules.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingSchedules.map((s) => (
                  <div key={s.id} className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="mt-0.5 rounded-full bg-primary/10 p-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(s.date), 'MMM d, yyyy')}
                        {s.time && ` at ${s.time}`}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {s.category}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
                No upcoming schedules
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Goals & Budget */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Financial Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5" />
              Financial Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.goals.length > 0 ? (
              <div className="space-y-4">
                {data.goals.slice(0, 4).map((g) => {
                  const pct = g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0
                  return (
                    <div key={g.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{g.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {fmt(g.currentAmount)} / {fmt(g.targetAmount)}
                        </span>
                      </div>
                      <Progress value={pct} className="h-2" />
                      <p className="text-xs text-muted-foreground">{pct.toFixed(1)}% achieved</p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
                No financial goals set. Go to Planner to create one!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Budget Usage</CardTitle>
            <CardDescription>Monthly budget tracking</CardDescription>
          </CardHeader>
          <CardContent>
            {data.budgetUsage.length > 0 ? (
              <div className="space-y-4">
                {data.budgetUsage.map((b) => (
                  <div key={b.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{b.category}</span>
                      <span className={`text-xs ${b.percentage > 90 ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
                        {fmt(b.spent)} / {fmt(b.limit)}
                      </span>
                    </div>
                    <Progress value={Math.min(b.percentage, 100)} className={`h-2 ${b.percentage > 90 ? '[&>div]:bg-red-500' : b.percentage > 70 ? '[&>div]:bg-yellow-500' : ''}`} />
                    <p className="text-xs text-muted-foreground">
                      {b.percentage.toFixed(1)}% used
                      {b.remaining < 0 && ` · Over budget by ${fmt(Math.abs(b.remaining))}`}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
                No budget plans set. Go to Planner to create one!
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Balance Trend Line */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Balance Trend</CardTitle>
          <CardDescription>Cumulative balance over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `Rp${(v / 1000).toLocaleString('id-ID')}K`} />
                <Tooltip
                  formatter={(value: number) => [`Rp${value.toLocaleString('id-ID')}`]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                />
                <Line type="monotone" dataKey="balance" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 4, fill: '#0ea5e9' }} name="Balance" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
