import React from 'react';
import { format, isToday } from 'date-fns';
import type { Goal, Participant, Attendance } from '@/types/types';

interface CalendarProps {
    daysInMonth: Date[];
    currentDate: Date;
    goals: Goal[];
    participants: Participant[];
    attendance: Attendance;
    onDayClick: (date: Date) => void;
}

export const Calendar = (props: CalendarProps) => {
    const { daysInMonth, currentDate, participants, attendance, onDayClick } = props;
    // goals는 현재 사용하지 않으므로 제외
    return (
        <div
            className="
                grid grid-cols-7
                gap-1 sm:gap-2 md:gap-3 lg:gap-4
                w-full
                md:rounded-2xl
                min-h-[60vw] md:min-h-[400px] lg:min-h-[500px]
                text-[13px] sm:text-sm md:text-base
            "
        >
            {daysInMonth.map(day => {
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isTodayCell = isToday(day);
                const dateKey = format(day, 'yyyy-MM-dd');
                const attList = attendance[dateKey] ? Object.keys(attendance[dateKey]) : [];
                // present true/false 카운트
                const presentCount = attendance[dateKey] ? Object.values(attendance[dateKey]).filter(a => a.present).length : 0;
                const absentCount = attendance[dateKey] ? Object.values(attendance[dateKey]).filter(a => !a.present).length : 0;
                const totalCount = attList.length;
                return (
                    <div
                        key={day.toString()}
                        onClick={() => onDayClick(day)}
                        className={`
                            rounded-xl
                            min-h-[80px] sm:min-h-[60px] md:min-h-[80px] lg:min-h-[100px]
                            flex flex-col gap-1 sm:gap-2
                            cursor-pointer border transition-all px-1.5 py-1 sm:px-2 sm:py-2
                            ${isTodayCell ? 'border-blue-500 bg-blue-100 dark:bg-blue-900' : isCurrentMonth ? 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700' : 'bg-gray-50 dark:bg-gray-800 text-gray-300'}
                            hover:scale-[1.03] shadow-sm
                            active:scale-[0.98] select-none
                            justify-between
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
                                        : isCurrentMonth ? 'text-gray-700 dark:text-gray-200'
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
                        <div className="flex flex-col gap-0.5 sm:gap-1 flex-1 justify-center">
                            <span className="block sm:hidden text-[12px] text-blue-600 dark:text-blue-300 font-semibold min-h-[18px] flex items-center">
                                {presentCount > 0 ? `+${presentCount}` : ''}
                            </span>
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
                                            <div key={p.id} className="flex items-center gap-2 text-xs">
                                                {p.icon && <span className="text-lg align-middle mr-1">{p.icon}</span>}
                                                <span className="font-semibold truncate max-w-[90px]" style={{ color: p.color || '#222' }}>{p.name}</span>
                                                <span className={`rounded-full w-5 h-5 flex items-center justify-center border text-xs font-bold
                                                    ${isAttend.present ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-200 border-green-400 dark:border-green-600' : 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-200 border-red-400 dark:border-red-600'}`}
                                                >{isAttend.present ? 'O' : 'X'}</span>
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
    );
};