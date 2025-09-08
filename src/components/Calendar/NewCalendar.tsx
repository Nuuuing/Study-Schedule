"use client";

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import weekday from 'dayjs/plugin/weekday';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isToday from 'dayjs/plugin/isToday';
import type { Participate, TimeSlot } from '@/modules/types/types';

// dayjs 플러그인 설정
dayjs.extend(weekday);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isToday);
dayjs.locale('ko');

interface NewCalendarProps {
    onDayClick?: (date: Date) => void;
    participate?: Participate;
    userList?: Array<{ id: string; name: string; color?: string; icon?: string }>;
    schedules?: Record<string, { id: string; content: string; color?: string }[]>;
}

const NewCalendar: React.FC<NewCalendarProps> = ({
    onDayClick,
    participate = {},
    userList = [],
    schedules = {},
}) => {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [calendarDays, setCalendarDays] = useState<Date[]>([]);

    // 요일 헤더
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    useEffect(() => {
        // 현재 달의 시작일과 마지막일
        const monthStart = dayjs(currentDate).startOf('month');
        const monthEnd = dayjs(currentDate).endOf('month');

        // 달력에 표시할 전체 기간 (이전 달의 마지막 주 + 현재 달 + 다음 달의 첫 주)
        const calendarStart = monthStart.startOf('week');
        const calendarEnd = monthEnd.endOf('week');

        // 해당 기간의 모든 날짜 배열 생성
        const daysArray: Date[] = [];
        let day = calendarStart;

        while (day.isSameOrBefore(calendarEnd)) {
            daysArray.push(day.toDate());
            day = day.add(1, 'day');
        }

        setCalendarDays(daysArray);
    }, [currentDate]);

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

    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors">
            {/* 캘린더 헤더 */}
            <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                    <button
                        onClick={prevMonth}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="이전 달"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h2 className="text-lg font-semibold mx-4 text-gray-800 dark:text-gray-100">
                        {dayjs(currentDate).format('YYYY년 MM월')}
                    </h2>
                    <button
                        onClick={nextMonth}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="다음 달"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <button
                    onClick={goToToday}
                    className="px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors text-sm"
                >
                    오늘
                </button>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
                {weekDays.map((day, index) => (
                    <div
                        key={index}
                        className={`py-2 text-center text-sm font-medium
                                    ${index === 0 ? 'text-red-500 dark:text-red-400' : ''}
                                    ${index === 6 ? 'text-blue-500 dark:text-blue-400' : ''}
                                    ${index !== 0 && index !== 6 ? 'text-gray-500 dark:text-gray-400' : ''}
                                `}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* 캘린더 그리드 */}
            <div className="grid grid-cols-7 border-gray-200 dark:border-gray-700">
                {calendarDays.map((day, index) => {
                    const dayObj = dayjs(day);
                    const dateKey = dayObj.format('YYYY-MM-DD');
                    const isCurrentMonthDay = dayObj.month() === dayjs(currentDate).month();
                    const isSelectedDate = dayObj.isToday();
                    const daySchedules = schedules[dateKey] || [];
                    const hasAttendees = participate[dateKey] && Object.keys(participate[dateKey]).length > 0;

                    return (
                        <div
                            key={index}
                            onClick={() => onDayClick && onDayClick(day)}
                            className={`min-h-[100px] border-b border-r border-gray-200 dark:border-gray-700 p-1 overflow-hidden transition-colors
                ${index % 7 === 6 ? 'border-r-0' : ''}
                ${isCurrentMonthDay
                                    ? 'bg-white dark:bg-gray-800'
                                    : 'bg-gray-50 dark:bg-gray-900/30 text-gray-400 dark:text-gray-600'}
                ${isSelectedDate ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer
              `}
                        >
                            <div className="flex flex-col h-full">
                                {/* 날짜 표시 */}
                                <div className={`
                                        text-right p-1
                                        ${!isCurrentMonthDay ? 'text-gray-400 dark:text-gray-600' : ''}
                                        ${isSelectedDate ? 'font-bold' : ''}
                                    `}>
                                    {isSelectedDate ? (
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-sm">
                                            {dayObj.format('D')}
                                        </span>
                                    ) : (
                                        <span className={`text-sm ${isCurrentMonthDay ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}`}>
                                            {dayObj.format('D')}
                                        </span>
                                    )}
                                </div>

                                {/* 일정 표시 */}
                                <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                                    {daySchedules.slice(0, 3).map((schedule, idx) => (
                                        <div
                                            key={idx}
                                            className="text-xs truncate px-1 py-0.5 rounded"
                                            style={{
                                                backgroundColor: schedule.color || '#93c5fd',
                                                color: getContrastColor(schedule.color || '#93c5fd')
                                            }}
                                        >
                                            {schedule.content}
                                        </div>
                                    ))}

                                    {/* 참여자 표시 */}
                                    {hasAttendees && (
                                        <div className="flex flex-wrap gap-0.5 mt-auto">
                                            {Object.keys(participate[dateKey] || {}).slice(0, 5).map(userId => {
                                                const user = userList.find(u => u.id === userId);
                                                if (!user) return null;

                                                const attendance = participate[dateKey][userId];
                                                return (
                                                    <div
                                                        key={userId}
                                                        className="w-2 h-2 rounded-full"
                                                        style={{
                                                            backgroundColor: user.color || '#6366f1',
                                                            opacity: attendance.present ? 1 : 0.5
                                                        }}
                                                    />
                                                );
                                            })}

                                            {Object.keys(participate[dateKey] || {}).length > 5 && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400">+{Object.keys(participate[dateKey]).length - 5}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// 배경색에 따른 대비 텍스트 색상 계산 함수
function getContrastColor(hexColor: string): string {
    // 헥스 색상을 RGB로 변환
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // 밝기 계산 (YIQ 공식)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    // 밝기에 따라 검정색 또는 흰색 반환
    return (yiq >= 128) ? '#000000' : '#ffffff';
}

export default NewCalendar;
