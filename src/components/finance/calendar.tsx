'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Plus, Trash2, Clock } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { toast } from 'sonner'

interface ClassType {
  id: string
  name: string
  subject: string
  grade: string
  hourlyRate: number
  color: string
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

export function Calendar() {
  const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear } = useAppStore()
  const [sessions, setSessions] = useState<Session[]>([])
  const [classTypes, setClassTypes] = useState<ClassType[]>([])
  const [currentDate, setCurrentDate] = useState(new Date(selectedYear, selectedMonth - 1))
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [form, setForm] = useState({ classTypeId: '', startTime: '09:00', endTime: '10:00', hours: '1', notes: '' })

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

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)

  const days: Date[] = []
  let day = calStart
  while (day <= calEnd) { days.push(day); day = addDays(day, 1) }

  const getSessionsForDate = (date: Date) => sessions.filter(s => isSameDay(new Date(s.date), date))

  const handlePrev = () => {
    const d = subMonths(currentDate, 1)
    setCurrentDate(d)
    setSelectedMonth(d.getMonth() + 1)
    setSelectedYear(d.getFullYear())
  }

  const handleNext = () => {
    const d = addMonths(currentDate, 1)
    setCurrentDate(d)
    setSelectedMonth(d.getMonth() + 1)
    setSelectedYear(d.getFullYear())
  }

  const handleAddSession = (date: Date) => {
    setSelectedDate(date)
    setForm({ classTypeId: classTypes[0]?.id || '', startTime: '09:00', endTime: '10:00', hours: '1', notes: '' })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.classTypeId || !selectedDate) return
    const ct = classTypes.find(c => c.id === form.classTypeId)
    const income = parseFloat(form.hours) * (ct?.hourlyRate || 0)
    await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, date: selectedDate.toISOString(), income }),
    })
    toast.success('Session added successfully')
    setDialogOpen(false)
    reloadData()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
    toast.success('Session deleted')
    reloadData()
  }

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    const newForm = { ...form, [field]: value }
    if (newForm.startTime && newForm.endTime) {
      const [sh, sm] = newForm.startTime.split(':').map(Number)
      const [eh, em] = newForm.endTime.split(':').map(Number)
      const hours = Math.max(0.5, ((eh * 60 + em - sh * 60 - sm) / 60))
      newForm.hours = hours.toFixed(1)
    }
    setForm(newForm)
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const totalHours = sessions.reduce((s, sess) => s + sess.hours, 0)
  const totalIncome = sessions.reduce((s, sess) => s + sess.income, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Teaching Schedule</h2>
          <p className="text-muted-foreground">
            {totalSessions(sessions)} sessions  •  {totalHours.toFixed(1)}h total  •  Rp {totalIncome.toLocaleString('id-ID')} earned
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrev}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-medium min-w-36 text-center">{format(currentDate, 'MMMM yyyy')}</span>
          <Button variant="outline" size="icon" onClick={handleNext}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Legend for class types */}
      {classTypes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {classTypes.map(ct => (
            <Badge key={ct.id} variant="outline" className="text-xs gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ct.color }} />
              {ct.name} (Rp {ct.hourlyRate.toLocaleString('id-ID')}/h)
            </Badge>
          ))}
        </div>
      )}

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-2 md:p-4">
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {weekDays.map(d => (
              <div key={d} className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
            ))}
            {days.map((d, i) => {
              const daySessions = getSessionsForDate(d)
              const isCurrentMonth = isSameMonth(d, currentDate)
              const isToday = isSameDay(d, new Date())
              return (
                <div
                  key={i}
                  className={`bg-card min-h-20 md:min-h-28 p-1 md:p-2 relative transition-colors hover:bg-accent/50 ${!isCurrentMonth ? 'opacity-40' : ''}`}
                  onClick={() => isCurrentMonth && handleAddSession(d)}
                >
                  <div className={`text-xs md:text-sm font-medium mb-1 ${isToday ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                    {format(d, 'd')}
                  </div>
                  <div className="space-y-0.5 max-h-16 md:max-h-20 overflow-y-auto">
                    {daySessions.slice(0, 3).map(s => (
                      <div
                        key={s.id}
                        className="text-xs p-0.5 rounded truncate cursor-pointer flex items-center gap-1"
                        style={{ backgroundColor: s.classType.color + '20', color: s.classType.color }}
                        onClick={(e) => { e.stopPropagation() }}
                      >
                        <Clock className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{s.startTime}-{s.endTime}</span>
                        <button
                          className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 hover:text-red-500"
                          onClick={(e) => { e.stopPropagation(); handleDelete(s.id) }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {daySessions.length > 3 && (
                      <div className="text-xs text-muted-foreground pl-1">+{daySessions.length - 3} more</div>
                    )}
                  </div>
                  {isCurrentMonth && (
                    <button
                      className="absolute bottom-1 right-1 p-0.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                      onClick={(e) => { e.stopPropagation(); handleAddSession(d) }}
                    >
                      <Plus className="h-3 w-3 text-primary" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add Session Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-6">
          <DialogHeader className="pb-4">
            <DialogTitle>Add Teaching Session</DialogTitle>
            <p className="text-sm text-muted-foreground">{selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <Label>Class Type</Label>
              <Select value={form.classTypeId} onValueChange={v => setForm({ ...form, classTypeId: v })}>
                <SelectTrigger><SelectValue placeholder="Select class type" /></SelectTrigger>
                <SelectContent>
                  {classTypes.map(ct => (
                    <SelectItem key={ct.id} value={ct.id}>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ct.color }} />
                        {ct.name} (Rp {ct.hourlyRate.toLocaleString('id-ID')}/h)
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Start Time</Label>
                <Input type="time" value={form.startTime} onChange={e => handleTimeChange('startTime', e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5 block">End Time</Label>
                <Input type="time" value={form.endTime} onChange={e => handleTimeChange('endTime', e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Hours</Label>
              <Input type="number" step="0.5" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block">Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." />
            </div>
            {form.classTypeId && (
              <div className="bg-muted rounded-lg p-3 text-sm">
                <span className="text-muted-foreground">Estimated Income: </span>
                <span className="font-semibold">
                  Rp {(parseFloat(form.hours || '0') * (classTypes.find(c => c.id === form.classTypeId)?.hourlyRate || 0)).toLocaleString('id-ID')}
                </span>
              </div>
            )}
          </div>
          <DialogFooter className="pt-5">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.classTypeId}>Add Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function totalSessions(sessions: Session[]) { return sessions.length }
