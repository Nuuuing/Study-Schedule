import { useCurrentDate } from "@/modules/stores";
import dayjs from "dayjs";
import isToday from 'dayjs/plugin/isToday';
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

// dayjs 플러그인 등록
dayjs.extend(isToday);

export const Calendar = () => {
    const currentDate = useCurrentDate();
    const { currentTheme, theme } = useTheme();
    const themeClasses = theme.classes;
    const [calendarDays, setCalendarDays] = useState<Date[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // 특별한 기능은 모두 MainContainer로 이동

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

        // 현재 달의 마지막 날이 있는 주의 토요일까지만 다음 달 날짜 추가
        if (endWeekday < 6) {
            // 마지막 날 이후 해당 주의 토요일까지만 날짜 추가 (6 - endWeekday)일 추가
            for (let i = 1; i <= (6 - endWeekday); i++) {
                const nextDate = endOfMonth.add(i, 'day').toDate();
                days.push(nextDate);
            }
        }

        setCalendarDays(days);
    };

    // 주의 수 계산
    const calculateWeeksCount = (days: Date[]) => {
        if (days.length === 0) return 0;
        // 일수를 7로 나누어 올림하면 주의 수가 나옴
        return Math.ceil(days.length / 7);
    };

    const [weeksCount, setWeeksCount] = useState(0);

    useEffect(() => {
        calculateCalendarDays();
    }, [currentDate]);

    useEffect(() => {
        setWeeksCount(calculateWeeksCount(calendarDays));
    }, [calendarDays]);

    return (
        <div className="flex flex-col h-full">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 mb-1">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                    <div key={day} className="flex items-center justify-center py-1 sm:py-2">
                        <span className={`text-xs sm:text-sm font-bold ${index === 0 ? 'text-red-500' : index === 6 ? `text-t${currentTheme}-accent` : themeClasses.text}`}>
                            {day}
                        </span>
                    </div>
                ))}
            </div>

            {/* 캘린더 그리드 */}
            <div className={`calendar-container flex flex-col flex-grow border-2 ${themeClasses.border} rounded-lg ${themeClasses.card} shadow-md overflow-hidden`}>
                <div
                    className={`grid grid-cols-7 gap-0 flex-grow h-full w-full`}
                    style={{ gridTemplateRows: `repeat(${weeksCount}, 1fr)` }}>
                    {calendarDays.map((day, index) => {
                        const dayObj = dayjs(day);
                        const isCurrentMonthDay = dayObj.month() === dayjs(currentDate).month();
                        const isSelectedDate = dayObj.isToday();
                        const isWeekend = dayObj.day() === 0 || dayObj.day() === 6;

                        return (
                            <div
                                key={index}
                                onClick={() => setSelectedDate(day)}
                                className={`h-full transition-colors
                                    ${index % 7 !== 6 ? `border-r border-1 ${themeClasses.border}` : ''}
                                    ${Math.floor(index / 7) !== weeksCount - 1 ? `border-b border-1 ${themeClasses.border}` : ''}
                                    ${isCurrentMonthDay ? themeClasses.text : 'opacity-40'}
                                    ${isSelectedDate ? 'font-bold' : ''}
                                    ${isWeekend && isCurrentMonthDay ? 'bg-opacity-5 bg-gray-200' : ''}
                                    ${dayjs(day).isSame(selectedDate, 'day') ? `bg-t${currentTheme}-primary/20` : ''}
                                    hover:bg-t${currentTheme}-primary/10 cursor-pointer
                                `}
                            >
                                <div className="flex flex-col h-full">
                                    {/* 날짜 표시 */}
                                    <div className="text-left p-1 sm:p-2">
                                        {isSelectedDate ? (
                                            <span className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full ${themeClasses.primary} text-t${currentTheme}-card text-xs font-bold`}>
                                                {dayObj.format('D')}
                                            </span>
                                        ) : dayjs(day).isSame(selectedDate, 'day') ? (
                                            <span className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full border ${themeClasses.border} ${themeClasses.card} text-xs sm:text-sm font-bold ${dayObj.day() === 0 ? 'text-red-500' : dayObj.day() === 6 ? `text-t${currentTheme}-accent` : themeClasses.text}`}>
                                                {dayObj.format('D')}
                                            </span>
                                        ) : (
                                            <span className={`text-xs sm:text-sm ${dayObj.day() === 0 ? 'text-red-500' : dayObj.day() === 6 ? `text-t${currentTheme}-accent` : ''}`}>
                                                {dayObj.format('D')}
                                            </span>
                                        )}
                                    </div>

                                    {/* 이벤트 표시 공간 (나중에 이벤트가 추가될 경우를 위함) */}
                                    {isCurrentMonthDay && (
                                        <div className="px-1 overflow-hidden">
                                            {/* 이벤트가 있을 때만 보여질 공간 */}
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