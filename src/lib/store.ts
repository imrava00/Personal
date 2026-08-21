import { create } from 'zustand'

export type ActiveTab = 'dashboard' | 'calendar' | 'expenses' | 'investments' | 'income'

interface AppState {
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
  selectedMonth: number
  selectedYear: number
  setSelectedMonth: (month: number) => void
  setSelectedYear: (year: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  setSelectedMonth: (month) => set({ selectedMonth: month }),
  setSelectedYear: (year) => set({ selectedYear: year }),
}))
