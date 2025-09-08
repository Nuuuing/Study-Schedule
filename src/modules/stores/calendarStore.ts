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


// 개별 함수로 분리하여 각 액션에 대한 메모이제이션 활용
export const useCurrentDate = () => useCurrentDateStore((s) => s.currentDate)
export const useSetCurrentDate = () => useCurrentDateStore((s) => s.setCurrentDate)
export const useNextDay = () => useCurrentDateStore((s) => s.nextDay)
export const usePrevDay = () => useCurrentDateStore((s) => s.prevDay)
export const useResetToday = () => useCurrentDateStore((s) => s.resetToday)

// 모든 액션이 필요한 경우 shallow 비교 사용 (shallow는 별도 설치 필요)
// import { shallow } from 'zustand/shallow'
// export const useCurrentDateActions = () => 
//     useCurrentDateStore(
//         (s) => ({ 
//             setCurrentDate: s.setCurrentDate, 
//             nextDay: s.nextDay, 
//             prevDay: s.prevDay, 
//             resetToday: s.resetToday 
//         }),
//         shallow
//     )