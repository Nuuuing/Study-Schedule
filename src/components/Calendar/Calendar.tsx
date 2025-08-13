import React from 'react';
import { format, isToday } from 'date-fns';
import type { Goal, Participant, Attendance } from '@/types/types';

interface ScheduleItem {
    content: string;
    createdAt: number;
}
type Schedules = {
    [date: string]: ScheduleItem[];
};

interface CalendarProps {
    daysInMonth: Date[];
    currentDate: Date;
    goals: Goal[];
    participants: Participant[];
    attendance: Attendance;
    schedules: Schedules;
    onDayClick: (date: Date) => void;
}

const Calendar = (props: CalendarProps) => {
    const { daysInMonth, currentDate, participants, attendance, schedules, onDayClick } = props;
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    // 색상 밝기 계산하여 텍스트 색상 결정
    const getTextColor = (backgroundColor: string) => {
        if (!backgroundColor) return '#222';

        // 헥스 색상을 RGB로 변환
        const hex = backgroundColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // 밝기 계산 (0-255 범위)
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;

        // 밝기가 150 이상이면 어두운 텍스트, 미만이면 밝은 텍스트
        return brightness > 150 ? '#1f2937' : '#f9fafb';
    };

    return (
        <>
            <div className="grid grid-cols-7 mb-1 text-center text-xs sm:text-sm font-bold text-gray-400 dark:text-gray-500 select-none">
                {weekDays.map((w, i) => (
                    <div key={i}>{w}</div>
                ))}
            </div>
            <div className="relative">
                <div
                    className="
                        relative
                        grid grid-cols-7
                        gap-1 sm:gap-2 md:gap-3 lg:gap-4
                        w-full
                        md:rounded-2xl
                        min-h-[60vw] md:min-h-[400px] lg:min-h-[500px]
                        text-[13px] sm:text-sm md:text-base
                    "
                >
                    {daysInMonth.map((day) => {
                        const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                        const isTodayCell = isToday(day);
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const attList = attendance[dateKey] ? Object.keys(attendance[dateKey]) : [];

                        const presentCount = attendance[dateKey] ? Object.values(attendance[dateKey]).filter(a => a.present).length : 0;
                        const absentCount = attendance[dateKey] ? Object.values(attendance[dateKey]).filter(a => !a.present).length : 0;
                        const totalCount = attList.length;
                        return (
                            <div
                                key={day.toString()}
                                onClick={() => onDayClick(day)}
                                className={`
                            rounded-xl min-h-[80px] sm:min-h-[60px] md:min-h-[80px] lg:min-h-[100px]
                            flex flex-col gap-1 sm:gap-2 relative z-10
                            cursor-pointer border transition-all px-1.5 py-1 sm:px-2 sm:py-2
                            ${!isCurrentMonth ? 'opacity-60' : ''}
                            shadow-sm active:scale-[0.98] select-none justify-between
                            ${isTodayCell
                                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                                    }
                        `}
                                tabIndex={0}
                                role="button"
                                aria-label={format(day, 'yyyy-MM-dd')}
                            >
                                <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                                    <span
                                        className={`font-bold text-[15px] sm:text-lg
                                    ${isTodayCell
                                                ? 'text-white bg-blue-500 sm:text-blue-600 sm:dark:text-blue-300 sm:bg-transparent'
                                                : isCurrentMonth ? 'text-gray-900 dark:text-gray-200'
                                                    : 'text-gray-300 dark:text-gray-500 opacity-60'}
                                    ${isTodayCell ? 'rounded-full w-7 h-7 flex items-center justify-center sm:w-auto sm:h-auto sm:rounded-none' : ''}
                                `}
                                        style={{
                                            minWidth: isTodayCell ? '28px' : undefined,
                                            minHeight: isTodayCell ? '28px' : undefined,
                                        }}
                                    >
                                        {format(day, 'd')}
                                    </span>
                                    {isTodayCell && <span className="hidden sm:inline text-[10px] sm:text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full ml-2">오늘</span>}
                                </div>
                                {/* 개별 스케줄 표시 */}
                                {schedules[dateKey] && schedules[dateKey].length > 0 && (
                                    <div className="mb-1 flex flex-col gap-0.5">
                                        {schedules[dateKey].map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="text-xs text-blue-700 dark:text-blue-200 bg-blue-50 dark:bg-blue-900 rounded-md px-1 py-0.5 truncate"
                                            >
                                                {item.content}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex flex-col gap-0.5 sm:gap-1 flex-1 justify-center">
                                    <div className="block sm:hidden text-[12px] font-semibold min-h-[18px] flex items-center gap-1">
                                        {presentCount > 0 && (
                                            <span className="text-blue-600 dark:text-blue-300">+{presentCount}</span>
                                        )}
                                        {absentCount > 0 && (
                                            <span className="text-red-600 dark:text-red-300">-{absentCount}</span>
                                        )}
                                    </div>
                                    <>
                                        <span className="hidden sm:block text-[11px] sm:text-xs text-blue-600 dark:text-blue-300 font-semibold min-h-[18px] flex items-center">
                                            {totalCount >= 3
                                                ? `${presentCount}명 참석${absentCount > 0 ? `, ${absentCount}명 불참` : ''}`
                                                : ''}
                                        </span>
                                        {totalCount < 3 && (
                                            <div className="hidden sm:flex flex-col gap-1">
                                                {attList.map(pid => {
                                                    const p = participants.find(u => u.id === pid);
                                                    if (!p) return null;
                                                    const isAttend = attendance[dateKey][pid];

                                                    return (
                                                        <div key={p.id} className="flex items-center gap-1 text-xs">
                                                            <span
                                                                className="font-semibold truncate max-w-[90px] px-2 py-1 rounded-full flex items-center gap-1"
                                                                style={{
                                                                    backgroundColor: p.color || '#6366f1',
                                                                    color: getTextColor(p.color || '#6366f1'),
                                                                }}
                                                            >
                                                                <span
                                                                    className={`mr-1 inline-block w-2 h-2 rounded-full ${isAttend.present ? 'bg-green-400' : 'bg-red-400'}`}
                                                                    aria-label={isAttend.present ? '참석' : '미참'}
                                                                />
                                                                {p.name}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default Calendar;