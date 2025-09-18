import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import dayjs from 'dayjs'

export type CurrentMonthState = {
    currentMonth: Date
    setCurrentMonth: (next: Date | ((prev: Date) => Date)) => void
    prevMonth: () => void
    nextMonth: () => void
    resetToCurrentMonth: () => void

    selectedDate: Date | null
    setSelectedDate: (date: Date | null) => void

    showDayModal: boolean
    setShowDayModal: (show: boolean) => void
}

export const useCurrentMonthStore = create<CurrentMonthState>()(
    devtools((set, get) => ({
        currentMonth: new Date(),
        setCurrentMonth: (next) =>
            set((state) => ({
                currentMonth: typeof next === 'function' ? (next as (d: Date) => Date)(state.currentMonth) : next,
            })),
        prevMonth: () =>
            set((state) => ({
                currentMonth: dayjs(state.currentMonth).subtract(1, 'month').toDate()
            })),
        nextMonth: () =>
            set((state) => ({
                currentMonth: dayjs(state.currentMonth).add(1, 'month').toDate()
            })),
        resetToCurrentMonth: () => {
            const today = new Date();
            // 일자는 1일로 설정하고 현재 년월만 사용
            const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            set({ currentMonth });
        },

        selectedDate: new Date(),
        setSelectedDate: (date) => set({ selectedDate: date }),

        showDayModal: false,
        setShowDayModal: (show) => set({ showDayModal: show }),
    }))
)

export const useCurrentMonth = () => useCurrentMonthStore((s) => s.currentMonth)
export const useSetCurrentMonth = () => useCurrentMonthStore((s) => s.setCurrentMonth)
export const usePrevMonth = () => useCurrentMonthStore((s) => s.prevMonth)
export const useNextMonth = () => useCurrentMonthStore((s) => s.nextMonth)
export const useResetToCurrentMonth = () => useCurrentMonthStore((s) => s.resetToCurrentMonth)

export const useSelectedDate = () => useCurrentMonthStore((s) => s.selectedDate)
export const useSetSelectedDate = () => useCurrentMonthStore((s) => s.setSelectedDate)

export const useShowDayModal = () => useCurrentMonthStore((s) => s.showDayModal)
export const useSetShowDayModal = () => useCurrentMonthStore((s) => s.setShowDayModal)
