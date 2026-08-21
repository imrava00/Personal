'use client'

import { useAppStore, ActiveTab } from '@/lib/store'
import { Dashboard } from '@/components/finance/dashboard'
import { Calendar } from '@/components/finance/calendar'
import { ExpenseTracker } from '@/components/finance/expense-tracker'
import { InvestmentTracker } from '@/components/finance/investment-tracker'
import { IncomeTracker } from '@/components/finance/income-tracker'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  LayoutDashboard, CalendarDays, Receipt, TrendingUp, DollarSign,
  GraduationCap, Menu, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

const MONTHS = [
  { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
  { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
  { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
  { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' },
]

const TABS: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calendar', label: 'Schedule', icon: CalendarDays },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'investments', label: 'Investments', icon: TrendingUp },
  { id: 'income', label: 'Income', icon: DollarSign },
]

export default function FinanceApp() {
  const { activeTab, setActiveTab, selectedMonth, selectedYear, setSelectedMonth, setSelectedYear } = useAppStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [ready, setReady] = useState(false)

  // Auto-setup database tables on first load
  useEffect(() => {
    fetch('/api/setup').then(r => r.json()).then(() => setReady(true)).catch(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <GraduationCap className="h-10 w-10 mx-auto mb-3 text-primary animate-pulse" />
          <p className="text-sm text-muted-foreground">Setting up your database...</p>
        </div>
      </div>
    )
  }

  const years = [selectedYear - 1, selectedYear, selectedYear + 1]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between h-14 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold leading-tight">TeacherFinance</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Personal Finance Planner</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Select value={selectedMonth.toString()} onValueChange={v => setSelectedMonth(parseInt(v))}>
                <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label.slice(0, 3)}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={selectedYear.toString()} onValueChange={v => setSelectedYear(parseInt(v))}>
                <SelectTrigger className="w-20 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex w-56 flex-col border-r bg-card">
          <nav className="flex-1 p-3 space-y-1">
            {TABS.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
          <div className="p-4 border-t">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg p-3">
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Teacher Finance</p>
              <p className="text-xs text-amber-700/70 dark:text-amber-400/70 mt-0.5">Track, plan & grow your finances</p>
            </div>
          </div>
        </aside>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <aside className="fixed left-0 top-14 bottom-0 w-64 bg-card border-r shadow-xl z-50">
              <nav className="p-3 space-y-1">
                {TABS.map(tab => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false) }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">
            {/* Mobile Tab Bar */}
            <div className="lg:hidden mb-4">
              <div className="flex gap-1 p-1 bg-muted rounded-lg overflow-x-auto">
                {TABS.map(tab => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'calendar' && <Calendar />}
            {activeTab === 'expenses' && <ExpenseTracker />}
            {activeTab === 'investments' && <InvestmentTracker />}
            {activeTab === 'income' && <IncomeTracker />}
          </div>
        </main>
      </div>
    </div>
  )
}
