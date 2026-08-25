'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Trash2,
  Target,
  PiggyBank,
  Wallet,
  Edit,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Goal {
  id: string
  title: string
  description: string | null
  targetAmount: number
  currentAmount: number
  deadline: string | null
  category: string
  createdAt: string
}

interface Budget {
  id: string
  category: string
  monthlyLimit: number
}

interface BudgetUsage {
  category: string
  limit: number
  spent: number
  remaining: number
  percentage: number
}

const GOAL_CATEGORIES = ['Tabungan', 'Dana Darurat', 'Liburan', 'Investasi', 'Pelunasan Utang', 'Pendidikan', 'Rumah', 'Mobil', 'Pensiun', 'Lainnya']
const BUDGET_CATEGORIES = ['Makanan & Minuman', 'Transportasi', 'Penginapan', 'Utilitas', 'Belanja', 'Hiburan', 'Kesehatan', 'Pendidikan', 'Langganan', 'Perawatan Diri', 'Lainnya']

export default function PlannerTab() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [budgetUsage, setBudgetUsage] = useState<BudgetUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [goalDialogOpen, setGoalDialogOpen] = useState(false)
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false)
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string>('')
  const [contributionAmount, setContributionAmount] = useState('')
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    targetAmount: '',
    deadline: '',
    category: 'Savings',
  })
  const [budgetForm, setBudgetForm] = useState({
    category: '',
    monthlyLimit: '',
  })

  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetch('/api/goals')
      setGoals(await res.json())
    } catch {
      toast.error('Failed to fetch goals')
    }
  }, [])

  const fetchBudgets = useCallback(async () => {
    try {
      const res = await fetch('/api/budgets')
      setBudgets(await res.json())
    } catch {
      toast.error('Failed to fetch budgets')
    }
  }, [])

  const fetchBudgetUsage = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard')
      const data = await res.json()
      setBudgetUsage(data.budgetUsage || [])
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    Promise.all([fetchGoals(), fetchBudgets(), fetchBudgetUsage()]).finally(() => setLoading(false))
  }, [fetchGoals, fetchBudgets, fetchBudgetUsage])

  const resetGoalForm = () => {
    setGoalForm({ title: '', description: '', targetAmount: '', deadline: '', category: 'Savings' })
    setEditingGoal(null)
  }

  const resetBudgetForm = () => {
    setBudgetForm({ category: '', monthlyLimit: '' })
    setEditingBudget(null)
  }

  // Goal CRUD
  const handleGoalSubmit = async () => {
    if (!goalForm.title.trim()) { toast.error('Please enter a goal title'); return }
    if (!goalForm.targetAmount || parseFloat(goalForm.targetAmount) <= 0) { toast.error('Please enter a valid target amount'); return }
    try {
      if (editingGoal) {
        await fetch('/api/goals', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingGoal.id, ...goalForm }),
        })
        toast.success('Goal updated!')
      } else {
        await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(goalForm),
        })
        toast.success('Goal created!')
      }
      setGoalDialogOpen(false)
      resetGoalForm()
      fetchGoals()
    } catch {
      toast.error('Failed to save goal')
    }
  }

  const handleDeleteGoal = async (id: string) => {
    try {
      await fetch(`/api/goals?id=${id}`, { method: 'DELETE' })
      toast.success('Goal deleted')
      fetchGoals()
    } catch {
      toast.error('Failed to delete goal')
    }
  }

  const handleContribution = async () => {
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    const goal = goals.find((g) => g.id === selectedGoalId)
    if (!goal) return
    try {
      await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedGoalId, currentAmount: goal.currentAmount + parseFloat(contributionAmount) }),
      })
      toast.success(`Rp${parseFloat(contributionAmount).toLocaleString('id-ID')} added to ${goal.title}!`)
      setContributionDialogOpen(false)
      setContributionAmount('')
      setSelectedGoalId('')
      fetchGoals()
    } catch {
      toast.error('Failed to add contribution')
    }
  }

  const startEditGoal = (g: Goal) => {
    setEditingGoal(g)
    setGoalForm({
      title: g.title,
      description: g.description || '',
      targetAmount: String(g.targetAmount),
      deadline: g.deadline ? format(new Date(g.deadline), 'yyyy-MM-dd') : '',
      category: g.category,
    })
    setGoalDialogOpen(true)
  }

  // Budget CRUD
  const handleBudgetSubmit = async () => {
    if (!budgetForm.category) { toast.error('Please select a category'); return }
    if (!budgetForm.monthlyLimit || parseFloat(budgetForm.monthlyLimit) <= 0) { toast.error('Please enter a valid limit'); return }
    try {
      if (editingBudget) {
        await fetch('/api/budgets', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingBudget.id, ...budgetForm }),
        })
        toast.success('Budget updated!')
      } else {
        await fetch('/api/budgets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(budgetForm),
        })
        toast.success('Budget created!')
      }
      setBudgetDialogOpen(false)
      resetBudgetForm()
      fetchBudgets()
      fetchBudgetUsage()
    } catch {
      toast.error('Failed to save budget')
    }
  }

  const handleDeleteBudget = async (id: string) => {
    try {
      await fetch(`/api/budgets?id=${id}`, { method: 'DELETE' })
      toast.success('Budget deleted')
      fetchBudgets()
      fetchBudgetUsage()
    } catch {
      toast.error('Failed to delete budget')
    }
  }

  const startEditBudget = (b: Budget) => {
    setEditingBudget(b)
    setBudgetForm({ category: b.category, monthlyLimit: String(b.monthlyLimit) })
    setBudgetDialogOpen(true)
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)

  // Stats
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0)
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0)
  const completedGoals = goals.filter((g) => g.currentAmount >= g.targetAmount).length
  const totalBudgetLimit = budgets.reduce((s, b) => s + b.monthlyLimit, 0)
  const totalBudgetSpent = budgetUsage.reduce((s, b) => s + b.spent, 0)

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse"><CardContent className="h-40 p-6" /></Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Goals</p>
                <p className="text-2xl font-bold">{goals.length}</p>
              </div>
              <Target className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Saved</p>
                <p className="text-2xl font-bold text-green-600">{fmt(totalSaved)}</p>
              </div>
              <PiggyBank className="h-8 w-8 text-green-100" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-emerald-600">{completedGoals}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-100" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budget Used</p>
                <p className="text-2xl font-bold text-sky-600">{totalBudgetLimit > 0 ? `${((totalBudgetSpent / totalBudgetLimit) * 100).toFixed(0)}%` : 'N/A'}</p>
              </div>
              <Wallet className="h-8 w-8 text-sky-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="goals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="goals" className="gap-2"><Target className="h-4 w-4" /> Financial Goals</TabsTrigger>
          <TabsTrigger value="budgets" className="gap-2"><CircleDollarSign className="h-4 w-4" /> Budget Plans</TabsTrigger>
        </TabsList>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Dialog open={goalDialogOpen} onOpenChange={(o) => { setGoalDialogOpen(o); if (!o) resetGoalForm() }}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> New Goal</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
                  <DialogDescription>Set a financial target to track your progress</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Goal Title</Label>
                    <Input placeholder="e.g., Emergency Fund" value={goalForm.title} onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="What are you saving for?" value={goalForm.description} onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })} rows={2} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Target Amount (Rp)</Label>
                      <Input type="number" placeholder="10000000" min="1" step="100000" value={goalForm.targetAmount} onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={goalForm.category} onValueChange={(v) => setGoalForm({ ...goalForm, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {GOAL_CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Deadline (optional)</Label>
                    <Input type="date" value={goalForm.deadline} onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })} />
                  </div>
                  <Button className="w-full" onClick={handleGoalSubmit}>{editingGoal ? 'Update' : 'Create'} Goal</Button>
                  {editingGoal && (
                    <Button variant="outline" className="w-full" onClick={() => { resetGoalForm(); setGoalDialogOpen(false) }}>Cancel</Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={contributionDialogOpen} onOpenChange={setContributionDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Contribution</DialogTitle>
                  <DialogDescription>Add money towards your financial goal</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Goal</Label>
                    <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
                      <SelectTrigger><SelectValue placeholder="Select a goal" /></SelectTrigger>
                      <SelectContent>
                        {goals.filter((g) => g.currentAmount < g.targetAmount).map((g) => (
                          <SelectItem key={g.id} value={g.id}>{g.title} ({fmt(g.currentAmount)}/{fmt(g.targetAmount)})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount (Rp)</Label>
                    <Input type="number" placeholder="0" min="1" step="10000" value={contributionAmount} onChange={(e) => setContributionAmount(e.target.value)} />
                  </div>
                  <Button className="w-full" onClick={handleContribution} disabled={!selectedGoalId || !contributionAmount}>Add Contribution</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Goals List */}
          {goals.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {goals.map((goal) => {
                const pct = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0
                const isComplete = goal.currentAmount >= goal.targetAmount
                const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
                return (
                  <Card key={goal.id} className={`relative overflow-hidden ${isComplete ? 'border-green-200 bg-green-50/50' : ''}`}>
                    {isComplete && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-600">Completed</Badge>
                      </div>
                    )}
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-1">
                          <h3 className={`font-semibold ${isComplete ? 'text-green-700' : ''}`}>{goal.title}</h3>
                          {goal.description && <p className="text-xs text-muted-foreground line-clamp-1">{goal.description}</p>}
                        </div>
                        <Badge variant="secondary" className="text-xs shrink-0">{goal.category}</Badge>
                      </div>

                      <div className="space-y-1.5 mb-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className={`font-medium ${isComplete ? 'text-green-600' : ''}`}>{fmt(goal.currentAmount)} / {fmt(goal.targetAmount)}</span>
                        </div>
                        <Progress value={pct} className={`h-2.5 ${isComplete ? '[&>div]:bg-green-500' : ''}`} />
                        <p className="text-xs text-muted-foreground">{pct.toFixed(1)}% achieved</p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        {goal.deadline && (
                          <span className={`flex items-center gap-1 ${daysLeft !== null && daysLeft < 0 ? 'text-red-600 font-medium' : ''}`}>
                            {daysLeft !== null && daysLeft < 0 ? <AlertTriangle className="h-3 w-3" /> : null}
                            {daysLeft !== null && daysLeft >= 0 ? `${daysLeft} days left` : daysLeft !== null ? 'Overdue' : format(new Date(goal.deadline), 'MMM d, yyyy')}
                          </span>
                        )}
                        <span>Remaining: {fmt(Math.max(goal.targetAmount - goal.currentAmount, 0))}</span>
                      </div>

                      <div className="flex gap-2">
                        {!isComplete && (
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => { setSelectedGoalId(goal.id); setContributionDialogOpen(true) }}>
                            <TrendingUp className="mr-1 h-3.5 w-3.5" /> Add Funds
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => startEditGoal(goal)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700" onClick={() => handleDeleteGoal(goal.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Target className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
              <h3 className="text-lg font-medium">No financial goals yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Create your first goal to start tracking your savings progress.</p>
            </Card>
          )}
        </TabsContent>

        {/* Budgets Tab */}
        <TabsContent value="budgets" className="space-y-6">
          <Dialog open={budgetDialogOpen} onOpenChange={(o) => { setBudgetDialogOpen(o); if (!o) resetBudgetForm() }}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> New Budget Plan</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingBudget ? 'Edit Budget' : 'Create Budget Plan'}</DialogTitle>
                <DialogDescription>Set monthly spending limits by category</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={budgetForm.category} onValueChange={(v) => setBudgetForm({ ...budgetForm, category: v })}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {BUDGET_CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Monthly Limit (Rp)</Label>
                  <Input type="number" placeholder="500000" min="1" step="50000" value={budgetForm.monthlyLimit} onChange={(e) => setBudgetForm({ ...budgetForm, monthlyLimit: e.target.value })} />
                </div>
                <Button className="w-full" onClick={handleBudgetSubmit}>{editingBudget ? 'Update' : 'Create'} Budget</Button>
                {editingBudget && (
                  <Button variant="outline" className="w-full" onClick={() => { resetBudgetForm(); setBudgetDialogOpen(false) }}>Cancel</Button>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {budgetUsage.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Budget Tracking</CardTitle>
                <CardDescription>Monthly spending vs. your budget limits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {budgetUsage.map((b) => (
                    <div key={b.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{b.category}</span>
                        <span className={`text-sm ${b.percentage > 100 ? 'text-red-600 font-bold' : b.percentage > 80 ? 'text-amber-600 font-semibold' : 'text-muted-foreground'}`}>
                          {fmt(b.spent)} / {fmt(b.limit)}
                        </span>
                      </div>
                      <Progress value={Math.min(b.percentage, 100)} className={`h-3 ${b.percentage > 100 ? '[&>div]:bg-red-500' : b.percentage > 80 ? '[&>div]:bg-amber-500' : ''}`} />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{b.percentage.toFixed(1)}% used</span>
                        <span className={b.remaining < 0 ? 'text-red-600 font-medium' : ''}>
                          {b.remaining >= 0 ? `${fmt(b.remaining)} remaining` : `${fmt(Math.abs(b.remaining))} over budget!`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : budgets.length === 0 ? (
            <Card className="p-8 text-center">
              <CircleDollarSign className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
              <h3 className="text-lg font-medium">No budget plans yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Create budget categories to control your monthly spending.</p>
            </Card>
          ) : null}

          {budgets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Budget Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Monthly Limit</TableHead>
                      <TableHead className="w-24 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgets.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.category}</TableCell>
                        <TableCell className="text-right">{fmt(b.monthlyLimit)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditBudget(b)}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => handleDeleteBudget(b.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
