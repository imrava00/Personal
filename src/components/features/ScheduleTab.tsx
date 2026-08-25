'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { CalendarDays, Plus, Trash2, Clock, CheckCircle2, Circle, ListFilter, Edit } from 'lucide-react'
import { format, isSameDay, parseISO } from 'date-fns'
import { toast } from 'sonner'

interface Schedule {
  id: string
  title: string
  description: string | null
  date: string
  time: string | null
  category: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

const CATEGORIES = [
  { value: 'general', label: 'General', color: 'bg-slate-100 text-slate-700' },
  { value: 'work', label: 'Work', color: 'bg-blue-100 text-blue-700' },
  { value: 'personal', label: 'Personal', color: 'bg-green-100 text-green-700' },
  { value: 'health', label: 'Health', color: 'bg-red-100 text-red-700' },
  { value: 'finance', label: 'Finance', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'social', label: 'Social', color: 'bg-purple-100 text-purple-700' },
  { value: 'education', label: 'Education', color: 'bg-amber-100 text-amber-700' },
]

export default function ScheduleTab() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    category: 'general',
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch('/api/schedules')
      const data = await res.json()
      setSchedules(data)
    } catch {
      toast.error('Failed to fetch schedules')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  const resetForm = () => {
    setForm({ title: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), time: '09:00', category: 'general' })
    setEditingId(null)
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error('Please enter a title')
      return
    }
    if (!form.date) {
      toast.error('Please select a date')
      return
    }

    try {
      if (editingId) {
        await fetch('/api/schedules', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...form }),
        })
        toast.success('Schedule updated!')
      } else {
        await fetch('/api/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        toast.success('Schedule created!')
      }
      setDialogOpen(false)
      resetForm()
      fetchSchedules()
    } catch {
      toast.error('Failed to save schedule')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/schedules?id=${id}`, { method: 'DELETE' })
      toast.success('Schedule deleted')
      fetchSchedules()
    } catch {
      toast.error('Failed to delete schedule')
    }
  }

  const toggleComplete = async (schedule: Schedule) => {
    try {
      await fetch('/api/schedules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: schedule.id, completed: !schedule.completed }),
      })
      fetchSchedules()
    } catch {
      toast.error('Failed to update schedule')
    }
  }

  const startEdit = (schedule: Schedule) => {
    setEditingId(schedule.id)
    setForm({
      title: schedule.title,
      description: schedule.description || '',
      date: format(new Date(schedule.date), 'yyyy-MM-dd'),
      time: schedule.time || '09:00',
      category: schedule.category,
    })
    setDialogOpen(true)
  }

  const selectedDateSchedules = schedules.filter((s) => isSameDay(parseISO(s.date), selectedDate))
  const filteredSchedules = filterCategory === 'all'
    ? selectedDateSchedules
    : selectedDateSchedules.filter((s) => s.category === filterCategory)

  const dateHasSchedules = (date: Date) =>
    schedules.some((s) => isSameDay(parseISO(s.date), date))

  const getCategoryMeta = (cat: string) => CATEGORIES.find((c) => c.value === cat) || CATEGORIES[0]

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="animate-pulse lg:col-span-3"><CardContent className="h-96 p-6" /></Card>
        <Card className="animate-pulse lg:col-span-2"><CardContent className="h-96 p-6" /></Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Calendar */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Calendar
          </CardTitle>
          <CardDescription>Select a date to view and manage schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full [&_[data-slot=calendar]]:w-full [&_.rdp-months]:w-full [&_.rdp-month]:w-full [&_.rdp-table]:w-full">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              modifiers={{
                hasSchedule: (date) => dateHasSchedules(date),
              }}
              modifiersClassNames={{
                hasSchedule: 'bg-primary/10 font-bold',
              }}
              className="rounded-md border w-full [--cell-size:--spacing(11)] text-sm [&_.rdp-weekday]:text-xs [&_.rdp-day_button]:text-sm [&_.rdp-caption_label]:text-base"
            />
          </div>
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold">
              Schedules for {format(selectedDate, 'MMMM d, yyyy')}
              <span className="ml-2 text-muted-foreground font-normal">({filteredSchedules.length})</span>
            </h3>
            {filteredSchedules.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredSchedules
                  .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                  .map((schedule) => {
                    const catMeta = getCategoryMeta(schedule.category)
                    return (
                      <div
                        key={schedule.id}
                        className={`flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 ${schedule.completed ? 'opacity-60' : ''}`}
                      >
                        <button onClick={() => toggleComplete(schedule)} className="mt-0.5 shrink-0">
                          {schedule.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium ${schedule.completed ? 'line-through' : ''}`}>{
                              schedule.title
                            }</p>
                            <Badge variant="secondary" className={`text-xs shrink-0 ${catMeta.color}`}>
                              {schedule.category}
                            </Badge>
                          </div>
                          {schedule.description && (
                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{schedule.description}</p>
                          )}
                          {schedule.time && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" /> {schedule.time}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(schedule)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => handleDelete(schedule.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <div className="flex h-24 items-center justify-center text-sm text-muted-foreground rounded-lg border border-dashed">
                No schedules for this date
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sidebar: Add & Filter */}
      <div className="space-y-6 lg:col-span-2">
        {/* Add New Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5" />
              Add Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Team Meeting"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional details..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleSubmit}>
              {editingId ? 'Update Schedule' : 'Add Schedule'}
            </Button>
            {editingId && (
              <Button variant="outline" className="w-full" onClick={() => { resetForm() }}>
                Cancel Edit
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Category Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListFilter className="h-5 w-5" />
              Filter by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={filterCategory === 'all' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFilterCategory('all')}
              >
                All
              </Badge>
              {CATEGORIES.map((cat) => (
                <Badge
                  key={cat.value}
                  variant={filterCategory === cat.value ? 'default' : 'outline'}
                  className={`cursor-pointer ${filterCategory !== cat.value ? cat.color : ''}`}
                  onClick={() => setFilterCategory(cat.value)}
                >
                  {cat.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Schedules</span>
              <span className="font-semibold">{schedules.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completed</span>
              <span className="font-semibold text-green-600">{schedules.filter((s) => s.completed).length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pending</span>
              <span className="font-semibold text-amber-600">{schedules.filter((s) => !s.completed).length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Today</span>
              <span className="font-semibold">{schedules.filter((s) => isSameDay(parseISO(s.date), new Date())).length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
