import { useCurrentMonth, useSelectedDate, useSetSelectedDate, useSetShowDayModal } from "@/modules/stores";
import dayjs from "dayjs";
import isToday from 'dayjs/plugin/isToday';
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

dayjs.extend(isToday);

export const Calendar = () => {
    const currentMonth = useCurrentMonth();
    const selectedDate = useSelectedDate();
    const setSelectedDate = useSetSelectedDate();
    const setShowDayModal = useSetShowDayModal();
    const { currentTheme, theme } = useTheme();
    const themeClasses = theme.classes;
    const [calendarDays, setCalendarDays] = useState<Date[]>([]);

    // 캘린더 일자
    const calculateCalendarDays = () => {
        const startOfMonth = dayjs(currentMonth).startOf('month');
        const endOfMonth = dayjs(currentMonth).endOf('month');

        // 이번 달 첫 요일
        const startWeekday = startOfMonth.day();
        // 이번 달 마지막 날짜
        const endDate = endOfMonth.date();
        // 이번 달 마지막 날 요일
        const endWeekday = endOfMonth.day();

        const days: Date[] = [];

        // 이전 달 날짜
        for (let i = startWeekday - 1; i >= 0; i--) {
            const prevDate = startOfMonth.subtract(i + 1, 'day').toDate();
            days.push(prevDate);
        }

        // 이번달 날짜
        for (let i = 1; i <= endDate; i++) {
            const currentMonthDate = dayjs(startOfMonth).date(i).toDate();
            days.push(currentMonthDate);
        }

        // 현재 달의 마지막 날이 있는 토요일까지만 다음 달 날짜 추가
        if (endWeekday < 6) {
            for (let i = 1; i <= (6 - endWeekday); i++) {
                const nextDate = endOfMonth.add(i, 'day').toDate();
                days.push(nextDate);
            }
        }

        setCalendarDays(days);
    };

    // Week Count
    const calculateWeeksCount = (days: Date[]) => {
        if (days.length === 0) return 0;
        return Math.ceil(days.length / 7);
    };

    const [weeksCount, setWeeksCount] = useState(0);

    useEffect(() => {
        calculateCalendarDays();
    }, [currentMonth]);

    useEffect(() => {
        setWeeksCount(calculateWeeksCount(calendarDays));
    }, [calendarDays]);


    const handleClickDayCell = (day: Date) => {
        setSelectedDate(day);
        setShowDayModal(true); // 날짜 선택시 모달 열기
    }
    
    return (
        <div className="flex flex-col h-full">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 mb-1">
                {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                    <div key={day} className="flex items-center justify-center py-1 sm:py-2">
                        <span className={`text-xs sm:text-sm font-bold ${themeClasses.text}`}>{day}</span>
                    </div>
                ))}
            </div>

            {/* 캘린더 그리드 */}
            <div className={`calendar-container flex flex-col flex-grow border-2 ${themeClasses.border} rounded-lg ${themeClasses.card} shadow-md overflow-hidden`}>
                <div
                    className={`grid grid-cols-7 gap-0 flex-grow h-full w-full relative`}
                    style={{ gridTemplateRows: `repeat(${weeksCount}, 1fr)` }}>
                    
                    <div className={`absolute inset-0 pointer-events-none border-t border-l ${themeClasses.border}`}>
                        {Array.from({ length: weeksCount }).map((_, i) => (
                            <div key={`h-${i}`} 
                                className={`absolute w-full border-b ${themeClasses.border}`} 
                                style={{ 
                                    top: `calc(${(i + 1) / weeksCount * 100}% - 1px)`,
                                }}
                            ></div>
                        ))}
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={`v-${i}`} 
                                className={`absolute h-full border-r ${themeClasses.border}`} 
                                style={{ 
                                    left: `calc(${(i + 1) / 7 * 100}% - 1px)`,
                                }}
                            ></div>
                        ))}
                    </div>

                    {calendarDays.map((day, index) => {
                        const dayObj = dayjs(day);
                        const isCurrentMonthDay = dayObj.month() === dayjs(currentMonth).month();
                        const isToday = dayObj.isToday();
                        const isWeekend = dayObj.day() === 0 || dayObj.day() === 6;

                        return (
                            <div
                                key={index}
                                onClick={() => handleClickDayCell(day)}
                                className={`h-full relative z-2 transition-colors duration-200
                                    ${isCurrentMonthDay ? themeClasses.text : 'opacity-40'}
                                    cursor-pointer hover:bg-black/5
                                `}
                            >
                                <div className="flex flex-col h-full">
                                    {/* 날짜 표시 */}
                                    <div className="text-left p-1 sm:p-1">
                                        {isToday ? (
                                            <span className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full ${themeClasses.primary} text-t${currentTheme}-card text-xs font-bold`}>
                                                {dayObj.format('D')}
                                            </span>
                                        ) : dayjs(day).isSame(selectedDate, 'day') ? (
                                            <span className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full border ${themeClasses.border} ${themeClasses.card} text-xs sm:text-sm font-bold ${themeClasses.text}`}>
                                                {dayObj.format('D')}
                                            </span>
                                        ) : (
                                            <span className={`text-xs sm:text-sm ${themeClasses.text} inline-block`}>
                                                {dayObj.format('D')}
                                            </span>
                                        )}
                                    </div>

                                    {/* 이벤트 표시 공간 */}
                                    {isCurrentMonthDay && (
                                        <div className="px-1 overflow-hidden">
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}