'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutDashboard, CalendarDays, Calculator, Target } from 'lucide-react'
import DashboardTab from '@/components/features/DashboardTab'
import ScheduleTab from '@/components/features/ScheduleTab'
import CalculatorTab from '@/components/features/CalculatorTab'
import PlannerTab from '@/components/features/PlannerTab'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <span className="text-lg font-bold text-white">F</span>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">FinPlan</h1>
                <p className="hidden text-xs text-muted-foreground sm:block">Personal Finance Hub</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 sm:inline-flex">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="dashboard" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Home</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="gap-2">
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">Schedule</span>
                <span className="sm:hidden">Plan</span>
              </TabsTrigger>
              <TabsTrigger value="calculator" className="gap-2">
                <Calculator className="h-4 w-4" />
                <span className="hidden sm:inline">Calculator</span>
                <span className="sm:hidden">Track</span>
              </TabsTrigger>
              <TabsTrigger value="planner" className="gap-2">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Planner</span>
                <span className="sm:hidden">Goals</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <DashboardTab />
            </TabsContent>
            <TabsContent value="schedule">
              <ScheduleTab />
            </TabsContent>
            <TabsContent value="calculator">
              <CalculatorTab />
            </TabsContent>
            <TabsContent value="planner">
              <PlannerTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="border-t bg-white mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-xs text-muted-foreground">FinPlan — Personal Finance Hub</p>
            <p className="text-xs text-muted-foreground">All data stored locally on your device</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
