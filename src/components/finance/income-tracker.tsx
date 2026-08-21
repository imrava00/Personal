'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Edit2, GraduationCap, Clock, Banknote, BookOpen, Coins } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts'

const fmtRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

interface ClassType {
  id: string
  name: string
  subject: string
  grade: string
  hourlyRate: number
  color: string
  _count?: { sessions: number }
}

interface Session {
  id: string
  date: string
  startTime: string
  endTime: string
  hours: number
  income: number
  notes: string | null
  classType: ClassType
}

export function IncomeTracker() {
  const { selectedMonth, selectedYear } = useAppStore()
  const [sessions, setSessions] = useState<Session[]>([])
  const [classTypes, setClassTypes] = useState<ClassType[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [classDialogOpen, setClassDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingClassId, setEditingClassId] = useState<string | null>(null)
  const [form, setForm] = useState({
    classTypeId: '', date: new Date().toISOString().split('T')[0],
    startTime: '09:00', endTime: '10:00', hours: '1', notes: '',
  })
  const [classForm, setClassForm] = useState({
    name: '', subject: '', grade: '', hourlyRate: '', color: '#f59e0b',
  })

  const reloadData = async () => {
    const [sessRes, ctRes] = await Promise.all([
      fetch(`/api/sessions?month=${selectedMonth}&year=${selectedYear}`),
      fetch('/api/class-types'),
    ])
    setSessions(await sessRes.json())
    setClassTypes(await ctRes.json())
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch(`/api/sessions?month=${selectedMonth}&year=${selectedYear}`).then(r => r.json()),
      fetch('/api/class-types').then(r => r.json()),
    ]).then(([sessData, ctData]) => {
      if (!cancelled) { setSessions(sessData); setClassTypes(ctData) }
    })
    return () => { cancelled = true }
  }, [selectedMonth, selectedYear])

  const totalIncome = sessions.reduce((s, sess) => s + sess.income, 0)
  const totalHours = sessions.reduce((s, sess) => s + sess.hours, 0)
  const avgHourlyRate = totalHours > 0 ? totalIncome / totalHours : 0

  const incomeByType = classTypes.map(ct => {
    const ctSessions = sessions.filter(s => s.classTypeId === ct.id)
    const income = ctSessions.reduce((sum, s) => sum + s.income, 0)
    const hours = ctSessions.reduce((sum, s) => sum + s.hours, 0)
    return { name: ct.name, income: Math.round(income * 100) / 100, hours: Math.round(hours * 10) / 10, color: ct.color }
  }).filter(ct => ct.income > 0)

  const handleSubmit = async () => {
    if (!form.classTypeId || !form.date) return
    const ct = classTypes.find(c => c.id === form.classTypeId)
    const income = parseFloat(form.hours) * (ct?.hourlyRate || 0)
    if (editingId) {
      await fetch(`/api/sessions/${editingId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, income }),
      })
      toast.success('Session updated')
    } else {
      await fetch('/api/sessions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, income }),
      })
      toast.success('Income session added')
    }
    setDialogOpen(false); setEditingId(null)
    setForm({ classTypeId: '', date: new Date().toISOString().split('T')[0], startTime: '09:00', endTime: '10:00', hours: '1', notes: '' })
    reloadData()
  }

  const handleClassSubmit = async () => {
    if (!classForm.name || !classForm.hourlyRate) return
    if (editingClassId) {
      await fetch(`/api/class-types/${editingClassId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(classForm),
      })
      toast.success('Class type updated')
    } else {
      await fetch('/api/class-types', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(classForm),
      })
      toast.success('Class type added')
    }
    setClassDialogOpen(false); setEditingClassId(null)
    setClassForm({ name: '', subject: '', grade: '', hourlyRate: '', color: '#f59e0b' })
    reloadData()
  }

  const handleEditSession = (session: Session) => {
    setEditingId(session.id)
    setForm({
      classTypeId: session.classTypeId, date: new Date(session.date).toISOString().split('T')[0],
      startTime: session.startTime, endTime: session.endTime, hours: session.hours.toString(), notes: session.notes || '',
    })
    setDialogOpen(true)
  }

  const handleEditClass = (ct: ClassType) => {
    setEditingClassId(ct.id)
    setClassForm({ name: ct.name, subject: ct.subject, grade: ct.grade, hourlyRate: ct.hourlyRate.toString(), color: ct.color })
    setClassDialogOpen(true)
  }

  const handleDeleteSession = async (id: string) => {
    await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
    toast.success('Session deleted'); reloadData()
  }

  const handleDeleteClass = async (id: string) => {
    await fetch(`/api/class-types/${id}`, { method: 'DELETE' })
    toast.success('Class type deleted'); reloadData()
  }

  const monthName = format(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Income Tracker</h2>
          <p className="text-muted-foreground">{monthName}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setEditingClassId(null); setClassForm({ name: '', subject: '', grade: '', hourlyRate: '', color: '#f59e0b' }); setClassDialogOpen(true) }}>
            <GraduationCap className="h-4 w-4 mr-2" />Manage Classes
          </Button>
          <Button onClick={() => { setEditingId(null); setForm({ classTypeId: classTypes[0]?.id || '', date: new Date().toISOString().split('T')[0], startTime: '09:00', endTime: '10:00', hours: '1', notes: '' }); setDialogOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />Log Income
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Banknote className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-emerald-700 dark:text-emerald-400">Total Income</span>
            </div>
            <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">{fmtRp(totalIncome)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Hours</span>
            </div>
            <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg Hourly Rate</span>
            </div>
            <p className="text-2xl font-bold">{fmtRp(avgHourlyRate)}/h</p>
          </CardContent>
        </Card>
      </div>

      {/* Income by Class Type Chart */}
      {incomeByType.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Income by Class Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeByType}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number, name: string) => name === 'income' ? `Rp ${value.toLocaleString('id-ID')}` : `${value}h`} />
                  <Legend />
                  <Bar dataKey="income" name="Income (Rp)" radius={[4, 4, 0, 0]}>
                    {incomeByType.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Types */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Class Types & Rates</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {classTypes.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  <GraduationCap className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p>No class types yet. Add your teaching classes!</p>
                </div>
              ) : (
                classTypes.map((ct, i) => {
                  const ctSessions = sessions.filter(s => s.classTypeId === ct.id)
                  const ctIncome = ctSessions.reduce((sum, s) => sum + s.income, 0)
                  return (
                    <div key={ct.id} className={`flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors ${i > 0 ? 'border-t' : ''}`}>
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: ct.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{ct.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-xs">{ct.subject}</Badge>
                          <span className="text-xs text-muted-foreground">Grade {ct.grade}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{fmtRp(ct.hourlyRate)}/h</p>
                        {ctIncome > 0 && <p className="text-xs text-muted-foreground">{fmtRp(ctIncome)} this month</p>}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditClass(ct)}><Edit2 className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteClass(ct.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Session List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {sessions.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  <Coins className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p>No income sessions this month.</p>
                </div>
              ) : (
                sessions.slice(0, 20).map((session, i) => (
                  <div key={session.id} className={`flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors ${i > 0 ? 'border-t' : ''}`}>
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: session.classType.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{session.classType.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{format(new Date(session.date), 'MMM d')}</span>
                        <span className="text-xs text-muted-foreground">{session.startTime}-{session.endTime}</span>
                        <span className="text-xs text-muted-foreground">{session.hours}h</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-600">+{fmtRp(session.income)}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditSession(session)}><Edit2 className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteSession(session.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-6">
          <DialogHeader className="pb-4">
            <DialogTitle>{editingId ? 'Edit Session' : 'Log Income Session'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <Label className="mb-1.5 block">Class Type</Label>
              <Select value={form.classTypeId} onValueChange={v => setForm({ ...form, classTypeId: v })}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classTypes.map(ct => (
                    <SelectItem key={ct.id} value={ct.id}>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ct.color }} />
                        {ct.name} ({fmtRp(ct.hourlyRate)}/h)
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Start Time</Label>
                <Input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
              </div>
              <div>
                <Label className="mb-1.5 block">End Time</Label>
                <Input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Hours</Label>
              <Input type="number" step="0.5" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block">Notes</Label>
              <Input placeholder="Optional notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            {form.classTypeId && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3 text-sm">
                <span className="text-muted-foreground">Estimated Income: </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {fmtRp(parseFloat(form.hours || '0') * (classTypes.find(c => c.id === form.classTypeId)?.hourlyRate || 0))}
                </span>
              </div>
            )}
          </div>
          <DialogFooter className="pt-5">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.classTypeId}>{editingId ? 'Update' : 'Log Income'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Class Type Dialog */}
      <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
        <DialogContent className="sm:max-w-[480px] p-6">
          <DialogHeader className="pb-4">
            <DialogTitle>{editingClassId ? 'Edit Class Type' : 'Add Class Type'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <Label className="mb-1.5 block">Class Name</Label>
              <Input placeholder="e.g., Advanced Math" value={classForm.name} onChange={e => setClassForm({ ...classForm, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Subject</Label>
                <Input placeholder="e.g., Mathematics" value={classForm.subject} onChange={e => setClassForm({ ...classForm, subject: e.target.value })} />
              </div>
              <div>
                <Label className="mb-1.5 block">Grade</Label>
                <Input placeholder="e.g., 10" value={classForm.grade} onChange={e => setClassForm({ ...classForm, grade: e.target.value })} />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Hourly Rate (Rp)</Label>
              <Input type="number" step="1" placeholder="0" value={classForm.hourlyRate} onChange={e => setClassForm({ ...classForm, hourlyRate: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block">Color</Label>
              <div className="flex items-center gap-3">
                <input type="color" value={classForm.color} onChange={e => setClassForm({ ...classForm, color: e.target.value })} className="h-10 w-16 rounded cursor-pointer border" />
                <span className="text-sm text-muted-foreground">Pick a color for this class type</span>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-5">
            <Button variant="outline" onClick={() => setClassDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleClassSubmit} disabled={!classForm.name || !classForm.hourlyRate}>{editingClassId ? 'Update' : 'Add Class'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
