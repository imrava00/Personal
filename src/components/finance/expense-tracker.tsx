'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Edit2, Search, UtensilsCrossed, Car, Home, Lightbulb, BookOpen, Heart, Film, ShoppingBag, Sparkles, ShieldCheck, Smartphone, Package, Wallet } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { type LucideIcon } from 'lucide-react'

const EXPENSE_CATEGORIES = [
  'Food & Dining', 'Transportation', 'Housing & Rent', 'Utilities',
  'Education & Books', 'Healthcare', 'Entertainment', 'Shopping',
  'Personal Care', 'Insurance', 'Subscriptions', 'Other',
]

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Food & Dining': UtensilsCrossed,
  'Transportation': Car,
  'Housing & Rent': Home,
  'Utilities': Lightbulb,
  'Education & Books': BookOpen,
  'Healthcare': Heart,
  'Entertainment': Film,
  'Shopping': ShoppingBag,
  'Personal Care': Sparkles,
  'Insurance': ShieldCheck,
  'Subscriptions': Smartphone,
  'Other': Package,
}

const fmtRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

interface Expense {
  id: string
  date: string
  amount: number
  category: string
  description: string
}

export function ExpenseTracker() {
  const { selectedMonth, selectedYear } = useAppStore()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'Food & Dining',
    description: '',
  })

  const loadExpenses = async () => {
    const res = await fetch(`/api/expenses?month=${selectedMonth}&year=${selectedYear}`)
    setExpenses(await res.json())
  }

  useEffect(() => {
    let cancelled = false
    fetch(`/api/expenses?month=${selectedMonth}&year=${selectedYear}`)
      .then(r => r.json())
      .then(data => { if (!cancelled) setExpenses(data) })
    return () => { cancelled = true }
  }, [selectedMonth, selectedYear])

  const filtered = expenses.filter(e => {
    const matchSearch = !searchQuery ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCategory = filterCategory === 'all' || e.category === filterCategory
    return matchSearch && matchCategory
  })

  const total = filtered.reduce((s, e) => s + e.amount, 0)
  const byCategory = filtered.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {} as Record<string, number>)

  const handleSubmit = async () => {
    if (!form.amount || !form.category) return
    if (editingId) {
      await fetch(`/api/expenses/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      toast.success('Expense updated')
    } else {
      await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      toast.success('Expense added')
    }
    setDialogOpen(false)
    setEditingId(null)
    setForm({ date: new Date().toISOString().split('T')[0], amount: '', category: 'Food & Dining', description: '' })
    loadExpenses()
  }

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id)
    setForm({
      date: new Date(expense.date).toISOString().split('T')[0],
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    toast.success('Expense deleted')
    loadExpenses()
  }

  const monthName = format(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daily Expenses</h2>
          <p className="text-muted-foreground">{monthName} • Total: {fmtRp(total)}</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm({ date: new Date().toISOString().split('T')[0], amount: '', category: 'Food & Dining', description: '' }); setDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />Add Expense
        </Button>
      </div>

      {/* Category Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Object.entries(byCategory)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([cat, amt]) => {
            const Icon = CATEGORY_ICONS[cat] || Package
            return (
              <Card key={cat} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setFilterCategory(filterCategory === cat ? 'all' : cat)}>
                <CardContent className="p-3 text-center">
                  <div className="flex justify-center mb-1"><Icon className="h-6 w-6 text-muted-foreground" /></div>
                  <p className="text-xs font-medium truncate">{cat}</p>
                  <p className="text-sm font-bold">{fmtRp(amt)}</p>
                </CardContent>
              </Card>
            )
          })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search expenses..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Expense List */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Wallet className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                <p>No expenses found. Click &quot;Add Expense&quot; to start tracking.</p>
              </div>
            ) : (
              filtered.map((expense, i) => {
                const Icon = CATEGORY_ICONS[expense.category] || Package
                return (
                  <div key={expense.id} className={`flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors ${i > 0 ? 'border-t' : ''}`}>
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted"><Icon className="h-4 w-4 text-muted-foreground" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{expense.description || expense.category}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-xs">{expense.category}</Badge>
                        <span className="text-xs text-muted-foreground">{format(new Date(expense.date), 'MMM d')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">-{fmtRp(expense.amount)}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(expense)}><Edit2 className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(expense.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px] p-6">
          <DialogHeader className="pb-4">
            <DialogTitle>{editingId ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <Label className="mb-1.5 block">Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block">Amount (Rp)</Label>
              <Input type="number" step="1" placeholder="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block">Category</Label>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Description</Label>
              <Input placeholder="What did you spend on?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="pt-5">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.amount}>{editingId ? 'Update' : 'Add Expense'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
