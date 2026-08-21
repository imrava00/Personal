'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown, Banknote, BarChart3, PackageOpen } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts'

const INVESTMENT_TYPES = [
  'Stocks', 'Bonds', 'Mutual Funds', 'ETF', 'Real Estate',
  'Fixed Deposit', 'Gold', 'Crypto', 'Retirement Fund', 'Other',
]

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#a855f7']

const fmtRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

interface Investment {
  id: string
  name: string
  type: string
  amount: number
  currentValue: number
  purchaseDate: string
  notes: string | null
}

export function InvestmentTracker() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', type: 'Stocks', amount: '', currentValue: '',
    purchaseDate: new Date().toISOString().split('T')[0], notes: '',
  })

  const loadInvestments = async () => {
    const res = await fetch('/api/investments')
    setInvestments(await res.json())
  }

  useEffect(() => {
    let cancelled = false
    fetch('/api/investments')
      .then(r => r.json())
      .then(data => { if (!cancelled) setInvestments(data) })
    return () => { cancelled = true }
  }, [])

  const totalInvested = investments.reduce((s, i) => s + i.amount, 0)
  const totalValue = investments.reduce((s, i) => s + i.currentValue, 0)
  const totalReturn = totalValue - totalInvested
  const returnPct = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0

  const byType = investments.reduce((acc, i) => {
    acc[i.type] = (acc[i.type] || 0) + i.currentValue
    return acc
  }, {} as Record<string, number>)
  const pieData = Object.entries(byType).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))

  const handleSubmit = async () => {
    if (!form.name || !form.amount) return
    if (editingId) {
      await fetch(`/api/investments/${editingId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      toast.success('Investment updated')
    } else {
      await fetch('/api/investments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      toast.success('Investment added')
    }
    setDialogOpen(false); setEditingId(null)
    setForm({ name: '', type: 'Stocks', amount: '', currentValue: '', purchaseDate: new Date().toISOString().split('T')[0], notes: '' })
    loadInvestments()
  }

  const handleEdit = (inv: Investment) => {
    setEditingId(inv.id)
    setForm({
      name: inv.name, type: inv.type, amount: inv.amount.toString(),
      currentValue: inv.currentValue.toString(),
      purchaseDate: new Date(inv.purchaseDate).toISOString().split('T')[0], notes: inv.notes || '',
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/investments/${id}`, { method: 'DELETE' })
    toast.success('Investment deleted'); loadInvestments()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Investment Portfolio</h2>
          <p className="text-muted-foreground">Track and manage your investments</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm({ name: '', type: 'Stocks', amount: '', currentValue: '', purchaseDate: new Date().toISOString().split('T')[0], notes: '' }); setDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />Add Investment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Banknote className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Invested</span>
            </div>
            <p className="text-xl font-bold">{fmtRp(totalInvested)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Current Value</span>
            </div>
            <p className="text-xl font-bold">{fmtRp(totalValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              {totalReturn >= 0
                ? <TrendingUp className="h-4 w-4 text-emerald-500" />
                : <TrendingDown className="h-4 w-4 text-red-500" />
              }
              <span className="text-sm text-muted-foreground">Total Return</span>
            </div>
            <p className={`text-xl font-bold ${totalReturn >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {totalReturn >= 0 ? '+' : ''}{fmtRp(Math.abs(totalReturn))} ({returnPct.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                        {pieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1 mt-2">
                  {pieData.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{fmtRp(item.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                Add investments to see allocation
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              {investments.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <PackageOpen className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                  <p>No investments yet. Start building your portfolio!</p>
                </div>
              ) : (
                investments.map((inv, i) => {
                  const returnAmt = inv.currentValue - inv.amount
                  const returnP = inv.amount > 0 ? (returnAmt / inv.amount) * 100 : 0
                  return (
                    <div key={inv.id} className={`flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors ${i > 0 ? 'border-t' : ''}`}>
                      <div className={`p-2 rounded-lg ${returnAmt >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                        {returnAmt >= 0
                          ? <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          : <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{inv.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-xs">{inv.type}</Badge>
                          <span className="text-xs text-muted-foreground">Purchased {format(new Date(inv.purchaseDate), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{fmtRp(inv.currentValue)}</p>
                        <p className={`text-xs ${returnAmt >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {returnAmt >= 0 ? '+' : ''}{returnP.toFixed(1)}%
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(inv)}><Edit2 className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(inv.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-6">
          <DialogHeader className="pb-4">
            <DialogTitle>{editingId ? 'Edit Investment' : 'Add Investment'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <Label className="mb-1.5 block">Name</Label>
              <Input placeholder="e.g., Apple Inc. (AAPL)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block">Type</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{INVESTMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Invested Amount (Rp)</Label>
                <Input type="number" step="1" placeholder="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div>
                <Label className="mb-1.5 block">Current Value (Rp)</Label>
                <Input type="number" step="1" placeholder="0" value={form.currentValue} onChange={e => setForm({ ...form, currentValue: e.target.value })} />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Purchase Date</Label>
              <Input type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block">Notes</Label>
              <Textarea placeholder="Optional notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="pt-5">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.name || !form.amount}>{editingId ? 'Update' : 'Add Investment'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
