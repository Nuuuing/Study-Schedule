import React from 'react';
import { format, isToday } from 'date-fns';
import type { Participate } from '@/modules/types/types';
import useFirebaseState from '@/utils/useFirebaseState';
import { NameTag } from '../Common';

interface CalendarProps {
    daysInMonth: Date[];
    currentDate: Date;
    onDayClick: (date: Date) => void;
    participate: Participate; // 외부에서 전달받는 participate 데이터
    userList: Array<{ id: string; name: string; color?: string; icon?: string }>; // 외부에서 전달받는 userList
    filterUserId?: string; // 필터링할 사용자 ID
}
const Calendar = (props: CalendarProps) => {
    const { daysInMonth, currentDate, onDayClick, participate, userList, filterUserId } = props;
    const { schedules } = useFirebaseState();

    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    return (
        <div
            className=" bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-[#e9e9e9] dark:border-gray-700
                p-2 sm:p-3 md:p-4 lg:p-6 mt-2 mb-4 overflow-x-auto w-full transition-all"
            style={{ WebkitOverflowScrolling: 'touch' }}
        >
            <div className="grid grid-cols-7 mb-2 text-center text-sm sm:text-sm font-bold text-gray-400 dark:text-gray-500 select-none">
                {weekDays.map((w: string, index: number) => (
                    <div key={index} className="py-1">{w}</div>
                ))}
            </div>
            <div className="relative">
                <div
                    className="
                        relative
                        grid grid-cols-7
                        gap-1.5 sm:gap-2 md:gap-3 lg:gap-4
                        w-full
                        md:rounded-2xl
                        min-h-[70vh] sm:min-h-[60vw] md:min-h-[400px] lg:min-h-[500px]
                        text-sm sm:text-sm md:text-base
                    "
                >
                    {daysInMonth.map((day) => {
                        const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                        const isTodayCell = isToday(day);
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const attList = participate[dateKey] ? Object.keys(participate[dateKey]) : [];

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => onDayClick(day)}
                                className={`rounded-lg sm:rounded-xl min-h-[100px] sm:min-h-[80px] md:min-h-[90px] lg:min-h-[100px] flex flex-col gap-1 sm:gap-2 relative z-10
                                cursor-pointer border transition-all px-2 py-2 sm:px-2 sm:py-2 ${!isCurrentMonth ? 'opacity-60' : ''}
                                shadow-sm active:scale-[0.98] select-none justify-between 
                                ${isTodayCell
                                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-200 dark:hover:border-gray-600'
                                    }`}
                                tabIndex={0}
                                role="button"
                                aria-label={format(day, 'yyyy-MM-dd')}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span
                                        className={`font-bold text-lg sm:text-lg
                                    ${isTodayCell
                                                ? 'text-white bg-blue-500 sm:text-blue-600 sm:dark:text-blue-300 sm:bg-transparent'
                                                : isCurrentMonth ? 'text-gray-900 dark:text-gray-200'
                                                    : 'text-gray-300 dark:text-gray-500 opacity-60'}
                                    ${isTodayCell ? 'rounded-full w-8 h-8 flex items-center justify-center sm:w-auto sm:h-auto sm:rounded-none' : ''}
                                `}
                                        style={{
                                            minWidth: isTodayCell ? '32px' : undefined,
                                            minHeight: isTodayCell ? '32px' : undefined,
                                        }}
                                    >
                                        {format(day, 'd')}
                                    </span>
                                    {isTodayCell && <span className="hidden sm:inline text-xs bg-blue-500 text-white px-2 py-1 rounded-full ml-2">오늘</span>}
                                </div>
                                {/* 개별 스케줄 표시 */}
                                {schedules[dateKey] && schedules[dateKey].length > 0 && (
                                    <div className="mb-1 flex flex-col gap-1">
                                        {schedules[dateKey].map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="text-xs text-blue-700 dark:text-blue-200 bg-blue-50 dark:bg-blue-900 rounded-md px-1.5 py-1 truncate"
                                            >
                                                {item.content}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex flex-col gap-1 sm:gap-1 flex-1 justify-center overflow-hidden">
                                    <div className="flex flex-wrap gap-0.5 w-full text-xs justify-start items-start overflow-hidden">
                                        {attList
                                            .filter(pid => !filterUserId || pid === filterUserId) // 필터링 로직 추가
                                            .map(pid => {
                                                const p = userList.find(u => u.id === pid);
                                                if (!p) return null;
                                                const isAttend = participate[dateKey][pid];
                                                
                                                // 모바일에서는 단순히 점으로만 표시
                                                return (
                                                    <div key={p.id} className="block">
                                                        {/* 모바일용 - 점만 표시 */}
                                                        <span
                                                            className="md:hidden inline-block w-3 h-3 rounded-full border-2 border-white shadow-sm"
                                                            style={{
                                                                backgroundColor: p.color || '#6366f1',
                                                                opacity: isAttend.present ? 1 : 0.4,
                                                            }}
                                                            title={`${p.name} (${isAttend.present ? '참석' : '미참'})`}
                                                        />
                                                        
                                                        {/* 데스크톱용 - 기존 태그 형태 */}
                                                        <NameTag
                                                            name={p.name}
                                                            color={p.color}
                                                            present={isAttend.present}
                                                        />
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Calendar;