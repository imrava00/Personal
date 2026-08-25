'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Filter,
  Edit,
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string | null
  date: string
  createdAt: string
}

const INCOME_CATEGORIES = ['Gaji', 'Freelance', 'Investasi', 'Bisnis', 'Hadiah', 'Lainnya']
const EXPENSE_CATEGORIES = ['Makanan & Minuman', 'Transportasi', 'Penginapan', 'Utilitas', 'Belanja', 'Hiburan', 'Kesehatan', 'Pendidikan', 'Langganan', 'Lainnya']

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f59e0b']

export default function CalculatorTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [dialogOpen, setDialogOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  })
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<'date' | 'amount'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch(`/api/transactions?month=${selectedMonth}`)
      const data = await res.json()
      setTransactions(data)
    } catch {
      toast.error('Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }, [selectedMonth])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const resetForm = () => {
    setForm({ type: 'expense', amount: '', category: '', description: '', date: format(new Date(), 'yyyy-MM-dd') })
    setEditingId(null)
  }

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const handleSubmit = async () => {
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (!form.category) {
      toast.error('Please select a category')
      return
    }
    if (!form.date) {
      toast.error('Please select a date')
      return
    }
    try {
      if (editingId) {
        await fetch('/api/transactions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...form }),
        })
        toast.success('Transaction updated!')
      } else {
        await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        toast.success(`${form.type === 'income' ? 'Income' : 'Expense'} added!`)
      }
      setDialogOpen(false)
      resetForm()
      fetchTransactions()
    } catch {
      toast.error('Failed to save transaction')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' })
      toast.success('Transaction deleted')
      fetchTransactions()
    } catch {
      toast.error('Failed to delete transaction')
    }
  }

  const startEdit = (t: Transaction) => {
    setEditingId(t.id)
    setForm({
      type: t.type,
      amount: String(t.amount),
      category: t.category,
      description: t.description || '',
      date: format(new Date(t.date), 'yyyy-MM-dd'),
    })
    setDialogOpen(true)
  }

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const filtered = typeFilter === 'all' ? transactions : transactions.filter((t) => t.type === typeFilter)
  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1
    if (sortField === 'date') return dir * (new Date(a.date).getTime() - new Date(b.date).getTime())
    return dir * (a.amount - b.amount)
  })

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : '0.0'

  const expenseByCategory: Record<string, number> = {}
  transactions.filter((t) => t.type === 'expense').forEach((t) => {
    expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount
  })
  const expensePieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name, value: Math.round(value * 100) / 100,
  }))

  const incomeByCategory: Record<string, number> = {}
  transactions.filter((t) => t.type === 'income').forEach((t) => {
    incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount
  })
  const incomePieData = Object.entries(incomeByCategory).map(([name, value]) => ({
    name, value: Math.round(value * 100) / 100,
  }))

  const fmt = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse"><CardContent className="h-40 p-6" /></Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-green-600">{fmt(totalIncome)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{fmt(totalExpense)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
        <Card className={`border-l-4 ${balance >= 0 ? 'border-l-emerald-500' : 'border-l-orange-500'}`}>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Net Balance</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>{fmt(balance)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-sky-500">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Savings Rate</p>
              <p className="text-2xl font-bold text-sky-600">{savingsRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-48"
        />
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm() }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Transaction</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Tabs value={form.type} onValueChange={(v) => setForm({ ...form, type: v as 'income' | 'expense', category: '' })}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="expense">Expense</TabsTrigger>
                  <TabsTrigger value="income">Income</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="space-y-2">
                <Label>Amount (Rp)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Optional details..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={handleSubmit}>
                {editingId ? 'Update' : 'Add'} Transaction
              </Button>
              {editingId && (
                <Button variant="outline" className="w-full" onClick={() => { resetForm(); setDialogOpen(false) }}>
                  Cancel
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-1">
            {(['all', 'income', 'expense'] as const).map((type) => (
              <Badge
                key={type}
                variant={typeFilter === type ? 'default' : 'outline'}
                className="cursor-pointer capitalize"
                onClick={() => setTypeFilter(type)}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expense Breakdown</CardTitle>
            <CardDescription>By category for selected month</CardDescription>
          </CardHeader>
          <CardContent>
            {expensePieData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expensePieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {expensePieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`Rp${value.toLocaleString('id-ID')}`]} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-muted-foreground">No expenses this month</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Income Sources</CardTitle>
            <CardDescription>By category for selected month</CardDescription>
          </CardHeader>
          <CardContent>
            {incomePieData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomePieData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tickFormatter={(v) => `Rp${(v / 1000).toLocaleString('id-ID')}K`} tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                    <Tooltip formatter={(value: number) => [`Rp${value.toLocaleString('id-ID')}`]} />
                    <Bar dataKey="value" fill="#22c55e" radius={[0, 4, 4, 0]} name="Income" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-muted-foreground">No income this month</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transaction History</CardTitle>
          <CardDescription>{sorted.length} transactions for {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}</CardDescription>
        </CardHeader>
        <CardContent>
          {sorted.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Type</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('date')}>
                      <div className="flex items-center gap-1">
                        Date <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="hidden sm:table-cell">Description</TableHead>
                    <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort('amount')}>
                      <div className="flex items-center justify-end gap-1">
                        Amount <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <Badge variant={t.type === 'income' ? 'default' : 'destructive'} className="text-xs">
                          {t.type === 'income' ? '+' : '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{format(new Date(t.date), 'MMM d')}</TableCell>
                      <TableCell className="text-sm">{t.category}</TableCell>
                      <TableCell className="hidden max-w-32 truncate sm:table-cell text-sm text-muted-foreground">
                        {t.description || '-'}
                      </TableCell>
                      <TableCell className={`text-right text-sm font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(t)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => handleDelete(t.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-muted-foreground rounded-lg border border-dashed">
              No transactions found. Click &quot;Add Transaction&quot; to get started!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
