import { useCurrentDate, useSetCurrentDate } from "@/modules/stores/calendarStore";
import dayjs from "dayjs";
import { useState, useEffect } from "react";

export const Calendar = () => {
    const currentDate = useCurrentDate();
    const setCurrentDate = useSetCurrentDate();
    const [calendarDays, setCalendarDays] = useState<Date[]>([]);


    // 이전 달로 이동
    const prevMonth = () => {
        setCurrentDate(dayjs(currentDate).subtract(1, 'month').toDate());
    };

    // 다음 달로 이동
    const nextMonth = () => {
        setCurrentDate(dayjs(currentDate).add(1, 'month').toDate());
    };

    // 오늘 날짜로 이동
    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // 캘린더 일자 계산
    const calculateCalendarDays = () => {
        const startOfMonth = dayjs(currentDate).startOf('month');
        const endOfMonth = dayjs(currentDate).endOf('month');

        // 이번 달 첫 날의 요일 (0: 일요일, 6: 토요일)
        const startWeekday = startOfMonth.day();

        // 이번 달의 마지막 날짜
        const endDate = endOfMonth.date();

        // 이번 달의 마지막 날의 요일 (0: 일요일, 6: 토요일)
        const endWeekday = endOfMonth.day();

        // 캘린더에 표시할 날짜들 (이전 달, 현재 달, 다음 달)
        const days: Date[] = [];

        // 이전 달의 날짜들 추가
        for (let i = startWeekday - 1; i >= 0; i--) {
            const prevDate = startOfMonth.subtract(i + 1, 'day').toDate();
            days.push(prevDate);
        }

        // 현재 달의 날짜들 추가
        for (let i = 1; i <= endDate; i++) {
            const currentMonthDate = dayjs(startOfMonth).date(i).toDate();
            days.push(currentMonthDate);
        }

        if (endWeekday < 6) {
            // 마지막 날 이후 해당 주의 토요일까지만 날짜 추가 (6 - endWeekday)일 추가
            for (let i = 1; i <= (6 - endWeekday); i++) {
                const nextDate = endOfMonth.add(i, 'day').toDate();
                days.push(nextDate);
            }
        }

        setCalendarDays(days);
    };

    useEffect(() => {
        calculateCalendarDays();
    }, [currentDate]);

    return (
        <>
            {/* 캘린더 헤더 */}
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h2 className="text-xl font-semibold">
                        {dayjs(currentDate).format('YYYY년 M월')}
                    </h2>
                    <button
                        onClick={nextMonth}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <button
                    onClick={goToToday}
                    className="px-3 py-1 rounded bg-blue-500 text-white text-sm hover:bg-blue-600"
                >
                    오늘
                </button>
            </div>
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                    <div key={day} className="flex items-center justify-center">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border text-xs font-medium
                            ${index === 0 ? 'text-red-500 border-red-200' :
                                index === 6 ? 'text-blue-500 border-blue-200' :
                                    'border-gray-200 dark:border-gray-700'}`}>
                            {day}
                        </div>
                    </div>
                ))}
            </div>
            <div className="calendar-container p-2 pb-1 flex flex-col h-[calc(100vh-180px)]">

                {/* 캘린더 그리드 */}
                <div className="grid grid-cols-7 gap-0.5 border-gray-200 dark:border-gray-700 flex-grow h-full" style={{ gridTemplateRows: 'repeat(6, 1fr)' }}>
                    {calendarDays.map((day, index) => {
                        const dayObj = dayjs(day);
                        const dateKey = dayObj.format('YYYY-MM-DD');
                        const isCurrentMonthDay = dayObj.month() === dayjs(currentDate).month();
                        const isSelectedDate = dayObj.isToday();

                        return (
                            <div
                                key={index}
                                className={`h-full min-h-0 border-b border-r border-gray-200 dark:border-gray-700 transition-colors text-gray-400 dark:text-gray-600 
                                ${index % 7 === 6 ? 'border-r-0' : ''}
                                ${isSelectedDate ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                                hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer
                            `}
                            >
                                <div className="flex flex-col h-full">
                                    {/* 날짜 표시 */}
                                    <div className={`
                                        text-left p-1
                                        ${!isCurrentMonthDay ? 'text-gray-400 dark:text-gray-600' : ''}
                                        ${isSelectedDate ? 'font-bold' : ''}
                                    `}>
                                        {isSelectedDate ? (
                                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs">
                                                {dayObj.format('D')}
                                            </span>
                                        ) : (
                                            <span className={`text-xs ${isCurrentMonthDay ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}`}>
                                                {dayObj.format('D')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    )
}