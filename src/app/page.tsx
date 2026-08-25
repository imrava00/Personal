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
              <svg className="h-9 w-9" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="36" height="36" rx="9" fill="url(#lg)"/>
                <path d="M11 10h14v2.5H11z" fill="white" fill-opacity="0.95"/>
                <path d="M11 16.5h9v2.5H11z" fill="white" fill-opacity="0.95"/>
                <path d="M11 23h6v2.5H11z" fill="white" fill-opacity="0.6"/>
                <circle cx="27" cy="25" r="4" fill="white" fill-opacity="0.25"/>
                <path d="M25.5 25l1 1.5 2.5-3" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <defs><linearGradient id="lg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse"><stop stop-color="#059669"/><stop offset="1" stop-color="#0f766e"/></linearGradient></defs>
              </svg>
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
            <p className="text-xs text-muted-foreground">Secure cloud-powered finance management</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
