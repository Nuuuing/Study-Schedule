import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import type { Participate, UserDataT } from '@/modules/types/types';

type ScheduleItem = {
    content: string;
    createdAt: number;
};

type Props = {
    currentDate: Date;
    participate?: Participate;
    userList?: UserDataT[];
    filterUserId?: string;
    selectedDate?: Date | null;
    onDayClick?: (date: Date) => void;
    schedules?: Record<string, ScheduleItem[]>;
};

export const MiniCalendar = ({ currentDate, participate = {}, userList = [], filterUserId, selectedDate, onDayClick, schedules = {} }: Props) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return (
        <div className="rounded-xl p-4 md:p-3 mb-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-3 md:mb-2">
                <span className="font-semibold text-base text-gray-900 dark:text-gray-100">
                    {format(currentDate, 'yyyy년 MM월')}
                </span>
            </div>
            
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 md:gap-2 text-xs text-center mb-2 md:mb-1">
                {['일', '월', '화', '수', '목', '금', '토'].map(d => 
                    <div key={d} className="font-bold text-gray-400 dark:text-gray-500 py-2 md:py-1">{d}</div>
                )}
            </div>
            
            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-1 md:gap-2 text-xs text-center">
                {days.map(day => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const dayParticipants = participate[dateKey] ? Object.keys(participate[dateKey]) : [];
                    const filteredParticipants = dayParticipants.filter(pid => 
                        !filterUserId || pid === filterUserId
                    );
                    const hasParticipants = filteredParticipants.length > 0;
                    const daySchedules = schedules[dateKey] || [];
                    const hasSchedules = daySchedules.length > 0;
                    const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === dateKey;
                    
                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => onDayClick?.(day)}
                            className={`relative w-8 md:w-9 h-12 md:h-10 md:mx-auto rounded-lg flex flex-col items-center justify-start transition-all duration-200 p-1 cursor-pointer
                                ${isToday(day) 
                                    ? 'bg-blue-500 text-white font-bold hover:bg-blue-600' 
                                    : isSelected
                                        ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300 font-semibold hover:bg-blue-200 dark:hover:bg-blue-800'
                                        : isSameMonth(day, currentDate) 
                                            ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' 
                                            : 'text-gray-400 dark:text-gray-600 opacity-50 hover:opacity-75'
                                }
                            `}
                        >
                            <span className="text-xs font-medium mb-0.5">
                                {format(day, 'd')}
                            </span>
                            
                            {/* 스케줄 표시 (체크 아이콘으로) - 셀 안 가운데 */}
                            {hasSchedules && (
                                <div className="mb-0.5">
                                    <div 
                                        className="w-3 h-3 bg-blue-700 dark:bg-blue-600 rounded-full flex items-center justify-center"
                                        title={daySchedules.length > 1 ? `${daySchedules.length}개 스케줄` : daySchedules[0].content}
                                    >
                                        <svg 
                                            className="w-2 h-2 text-white" 
                                            fill="currentColor" 
                                            viewBox="0 0 20 20"
                                        >
                                            <path 
                                                fillRule="evenodd" 
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                                                clipRule="evenodd" 
                                            />
                                        </svg>
                                    </div>
                                </div>
                            )}
                            
                            {/* 참석자 표시 (점으로) */}
                            {hasParticipants && (
                                <div className="flex gap-0.5 flex-wrap justify-center">
                                    {filteredParticipants.slice(0, 3).map(pid => {
                                        const user = userList.find(u => u.id === pid);
                                        const isAttend = participate[dateKey]?.[pid]?.present;
                                        if (!user) return null;
                                        
                                        return (
                                            <div
                                                key={pid}
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{
                                                    backgroundColor: user.color || '#6366f1',
                                                    opacity: isAttend ? 1 : 0.4,
                                                }}
                                                title={`${user.name} (${isAttend ? '참석' : '미참'})`}
                                            />
                                        );
                                    })}
                                    {filteredParticipants.length > 3 && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500" 
                                             title={`+${filteredParticipants.length - 3}명 더`} />
                                    )}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
