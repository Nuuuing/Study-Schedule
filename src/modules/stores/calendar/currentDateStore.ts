import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type CurrentDateState = {
    currentDate: Date
    setCurrentDate: (next: Date | ((prev: Date) => Date)) => void
    nextDay: () => void
    prevDay: () => void
    resetToday: () => void
}

export const useCurrentDateStore = create<CurrentDateState>()(
    devtools((set, get) => ({
        currentDate: new Date(),
        setCurrentDate: (next) =>
            set((state) => ({
                currentDate: typeof next === 'function' ? (next as (d: Date) => Date)(state.currentDate) : next,
            })),
        nextDay: () =>
            set((state) => ({ currentDate: new Date(state.currentDate.getTime() + 24 * 60 * 60 * 1000) })),
        prevDay: () =>
            set((state) => ({ currentDate: new Date(state.currentDate.getTime() - 24 * 60 * 60 * 1000) })),
        resetToday: () => set({ currentDate: new Date() }),
    }))
)

export const useCurrentDate = () => useCurrentDateStore((s) => s.currentDate)
export const useSetCurrentDate = () => useCurrentDateStore((s) => s.setCurrentDate)
export const useNextDay = () => useCurrentDateStore((s) => s.nextDay)
export const usePrevDay = () => useCurrentDateStore((s) => s.prevDay)
export const useResetToday = () => useCurrentDateStore((s) => s.resetToday)
