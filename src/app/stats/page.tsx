'use client';

import React, { useState, useMemo } from 'react';
import {
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    format,
    eachDayOfInterval,
    isToday,
    isSameMonth,
    subMonths,
    addMonths
} from 'date-fns';
import StatsCard from '@/components/Common/StatsCard';
import { ThemeToggle, LoadingOverlay } from '@/components';
import useFirebaseState from '@/utils/useFirebaseState';
import { Goal, TimeSlot } from '@/modules/types/types';
import { usePageLoading } from '@/hooks/usePageLoading';
import { getTextColor } from '@/utils/textUtils';

// 시간 문자열을 분으로 변환하는 함수
const timeStringToMinutes = (timeString: string): number => {
    try {
        const [time, period] = timeString.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let totalHours = hours;
        
        if (period === 'PM' && hours !== 12) {
            totalHours += 12;
        } else if (period === 'AM' && hours === 12) {
            totalHours = 0;
        }
        
        return totalHours * 60 + minutes;
    } catch (e) {
        console.error('Error parsing time string:', timeString, e);
        return 0;
    }
};

// participate 데이터에서 시간 계산
const calculateMinutesFromParticipate = (participate: Record<string, Record<string, { present?: boolean; timeSlots?: TimeSlot[] }>>, userId: string, dateStr: string): number => {
    const dayData = participate[dateStr];
    if (!dayData || !dayData[userId]) return 0;
    
    const userDetail = dayData[userId];
    if (!userDetail.present) return 0;
    
    // timeSlots 배열만 사용
    if (userDetail.timeSlots && Array.isArray(userDetail.timeSlots) && userDetail.timeSlots.length > 0) {
        let totalMinutes = 0;
        userDetail.timeSlots.forEach((slot: TimeSlot) => {
            if (slot.start && slot.end) {
                const startMinutes = timeStringToMinutes(slot.start);
                const endMinutes = timeStringToMinutes(slot.end);
                if (endMinutes > startMinutes) {
                    totalMinutes += endMinutes - startMinutes;
                }
            }
        });
        return totalMinutes;
    }
    
    return 0;
};

const formatStudyTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}시간 ${minutes}분`;
};

// 특정 기간의 공부시간 계산 (participate 데이터만 사용)
const calculateStudyTimeForPeriod = (
    participate: Record<string, Record<string, { present?: boolean; timeSlots?: TimeSlot[] }>>,
    userId: string,
    startDate: Date,
    endDate: Date
): number => {
    const dates = eachDayOfInterval({ start: startDate, end: endDate });
    let totalMinutes = 0;

    dates.forEach(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        totalMinutes += calculateMinutesFromParticipate(participate, userId, dateStr);
    });

    return totalMinutes;
};

// 월별 공부시간 계산 (participate 데이터만 사용)
const calculateMonthlyStudyTime = (participate: Record<string, Record<string, { present?: boolean; timeSlots?: TimeSlot[] }>>, userId: string): { [month: string]: number } => {
    const monthlyData: { [month: string]: number } = {};
    
    // participate에서 데이터 수집
    Object.keys(participate).forEach(dateStr => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return;
        
        const monthKey = format(date, 'yyyy-MM');
        if (!monthlyData[monthKey]) monthlyData[monthKey] = 0;
        
        const participateMinutes = calculateMinutesFromParticipate(participate, userId, dateStr);
        monthlyData[monthKey] += participateMinutes;
    });

    return monthlyData;
};

// 목표 완료 건수 계산
const calculateGoalCompletions = (goals: Goal[], userId: string): { [month: string]: number } => {
    const monthlyCompletions: { [month: string]: number } = {};

    // Note: 현재 Goal 타입에는 완료 날짜가 없어서 현재 상태만 확인 가능
    // 실제로는 completedAt 필드가 필요할 것 같습니다.
    const userGoals = goals.filter(goal => goal.userId === userId && goal.completed);

    // 현재 월에 완료된 것으로 가정 (실제로는 완료 날짜 필요)
    const currentMonth = format(new Date(), 'yyyy-MM');
    monthlyCompletions[currentMonth] = userGoals.length;

    return monthlyCompletions;
};

export default function Statistics() {
    const { userList, goals, participate } = useFirebaseState();
    const { isLoading, navigateWithLoading } = usePageLoading();
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [currentDate, setCurrentDate] = useState(new Date());

    // 다크모드 초기화
    React.useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = savedTheme ? savedTheme === 'dark' : systemDark;
        
        if (shouldBeDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // 선택된 유저 정보
    const selectedUser = useMemo(() => {
        return userList.find(user => user.id === selectedUserId);
    }, [userList, selectedUserId]);

    // 날짜 계산
    const today = useMemo(() => new Date(), []);
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    // 통계 데이터 계산
    const stats = useMemo(() => {
        if (!selectedUserId) return null;

        // 공부시간 계산 (participate 데이터만 사용)
        const todayMinutes = calculateStudyTimeForPeriod(participate, selectedUserId, today, today);
        const weekMinutes = calculateStudyTimeForPeriod(participate, selectedUserId, weekStart, weekEnd);
        const monthMinutes = calculateStudyTimeForPeriod(participate, selectedUserId, monthStart, monthEnd);

        // 이전 기간 비교를 위한 계산
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayMinutes = calculateStudyTimeForPeriod(participate, selectedUserId, yesterday, yesterday);
        
        const lastWeekStart = new Date(weekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        const lastWeekEnd = new Date(weekEnd);
        lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
        const lastWeekMinutes = calculateStudyTimeForPeriod(participate, selectedUserId, lastWeekStart, lastWeekEnd);
        
        const lastMonthStart = subMonths(monthStart, 1);
        const lastMonthEnd = subMonths(monthEnd, 1);
        const lastMonthMinutes = calculateStudyTimeForPeriod(participate, selectedUserId, lastMonthStart, lastMonthEnd);

        // 변화율 계산 함수
        const calculateChangeRate = (current: number, previous: number): { rate: number; trend: 'up' | 'down' | 'neutral' } => {
            if (previous === 0) {
                if (current === 0) {
                    return { rate: 0, trend: 'neutral' }; // 둘 다 0이면 변화 없음
                } else {
                    return { rate: 0, trend: 'up' }; // 이전 0에서 현재 양수면 신규 증가 (퍼센트 표시 안함)
                }
            }
            
            if (current === 0) {
                return { rate: 100, trend: 'down' }; // 이전에 있었는데 현재 0이면 100% 감소
            }
            
            const rate = ((current - previous) / previous) * 100;
            const trend = rate > 0 ? 'up' : rate < 0 ? 'down' : 'neutral';
            return { rate: Math.abs(rate), trend };
        };

        const todayChange = calculateChangeRate(todayMinutes, yesterdayMinutes);
        const weekChange = calculateChangeRate(weekMinutes, lastWeekMinutes);
        const monthChange = calculateChangeRate(monthMinutes, lastMonthMinutes);

        // 전체 공부시간 계산 (participate 데이터만 사용)
        let totalMinutes = 0;
        Object.keys(participate).forEach(dateStr => {
            totalMinutes += calculateMinutesFromParticipate(participate, selectedUserId, dateStr);
        });

        // 월별 데이터
        const monthlyStudyTime = calculateMonthlyStudyTime(participate, selectedUserId);
        const monthlyGoalCompletions = calculateGoalCompletions(goals, selectedUserId);

        // 이번달 목표 완료 건수
        const currentMonth = format(today, 'yyyy-MM');
        const thisMonthGoalCompletions = monthlyGoalCompletions[currentMonth] || 0;
        
        // 이번달 총 목표 수와 완료율 계산
        const thisMonthTotalGoals = goals.filter(goal => goal.userId === selectedUserId).length;
        const thisMonthCompletionRate = thisMonthTotalGoals > 0 ? (thisMonthGoalCompletions / thisMonthTotalGoals) * 100 : 0;
        
        // 전체 목표 완료율 계산
        const totalCompletedGoals = Object.values(monthlyGoalCompletions).reduce((a, b) => a + b, 0);
        const totalGoals = goals.filter(goal => goal.userId === selectedUserId).length;
        const overallCompletionRate = totalGoals > 0 ? (totalCompletedGoals / totalGoals) * 100 : 0;

        return {
            today: todayMinutes,
            week: weekMinutes,
            month: monthMinutes,
            total: totalMinutes,
            monthlyStudyTime,
            monthlyGoalCompletions,
            thisMonthGoalCompletions,
            thisMonthTotalGoals,
            thisMonthCompletionRate,
            totalCompletedGoals,
            totalGoals,
            overallCompletionRate,
            todayChange,
            weekChange,
            monthChange,
            yesterdayMinutes,
            lastWeekMinutes,
            lastMonthMinutes
        };
    }, [selectedUserId, participate, goals, today, weekStart, weekEnd, monthStart, monthEnd]);

    // 캘린더용 공부시간 데이터 (participate 데이터만 사용)
    const calendarStudyData = useMemo(() => {
        if (!selectedUserId) return {};

        const data: { [date: string]: number } = {};
        
        // participate에서 데이터 수집
        Object.keys(participate).forEach(dateStr => {
            const totalMinutes = calculateMinutesFromParticipate(participate, selectedUserId, dateStr);
            if (totalMinutes > 0) {
                data[dateStr] = totalMinutes;
            }
        });

        return data;
    }, [selectedUserId, participate]);

    // 에러 경계 및 로딩 상태 처리
    if (!userList || userList.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-700 dark:text-gray-300">사용자 데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="max-w-7xl mx-auto p-4 lg:p-8">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={() => navigateWithLoading('/')}
                            className="p-1.5 sm:p-2 lg:p-3 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-lg sm:text-2xl lg:text-4xl font-bold text-gray-900 dark:text-white">📊 통계</h1>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <ThemeToggle />
                        {/* 유저 선택 */}
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="p-1.5 sm:p-2 lg:p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-500 min-w-24 sm:min-w-32 text-sm sm:text-base"
                        >
                            <option value="">유저 선택</option>
                            {userList
                                .sort((a, b) => a.name.localeCompare(b.name, 'ko', { numeric: true }))
                                .map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                        </select>
                    </div>
                </div>

                {!selectedUserId ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-8 lg:p-12 shadow-xl border border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-base sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-400">
                            👆 유저를 선택해주세요
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-6 lg:space-y-8">
                        {/* 선택된 유저 정보 */}
                        {selectedUser && (
                              <span
                                        className="font-semibold px-3 py-2 rounded-full text-sm sm:text-lg inline-flex items-center gap-2"
                                        style={{
                                            backgroundColor: selectedUser.color || '#3B82F6',
                                            color: getTextColor(selectedUser.color || '#3B82F6'),
                                        }}
                                    >
                                        <span className="text-lg sm:text-xl">
                                            {selectedUser.icon || selectedUser.name.charAt(0)}
                                        </span>
                                        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                                            {selectedUser.name}
                                        </span>
                                    </span>
                        )}

                        {/* 공부시간 통계 카드 */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                            <StatsCard
                                label="오늘 공부시간"
                                value={stats ? formatStudyTime(stats.today) : '0시간 0분'}
                                icon="📚"
                                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                sub={`어제 ${stats ? formatStudyTime(stats.yesterdayMinutes) : '0시간 0분'}`}
                                trend={stats?.todayChange.trend || 'neutral'}
                                percentage={
                                    (stats?.yesterdayMinutes === 0 && (stats?.today || 0) > 0) 
                                        ? '신규' 
                                        : (stats?.todayChange.rate || 0) > 0 
                                        ? `${Math.round(stats?.todayChange.rate || 0)}%` 
                                        : '0%'
                                }
                            />
                            <StatsCard
                                label="이번주 공부시간"
                                value={stats ? formatStudyTime(stats.week) : '0시간 0분'}
                                icon="📅"
                                bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                                sub={`지난주 ${stats ? formatStudyTime(stats.lastWeekMinutes) : '0시간 0분'}`}
                                trend={stats?.weekChange.trend || 'neutral'}
                                percentage={
                                    (stats?.lastWeekMinutes === 0 && (stats?.week || 0) > 0) 
                                        ? '신규' 
                                        : (stats?.weekChange.rate || 0) > 0 
                                        ? `${Math.round(stats?.weekChange.rate || 0)}%` 
                                        : '0%'
                                }
                            />
                            <StatsCard
                                label="이번달 공부시간"
                                value={stats ? formatStudyTime(stats.month) : '0시간 0분'}
                                icon="📆"
                                bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                                sub={`지난달 ${stats ? formatStudyTime(stats.lastMonthMinutes) : '0시간 0분'}`}
                                trend={stats?.monthChange.trend || 'neutral'}
                                percentage={
                                    (stats?.lastMonthMinutes === 0 && (stats?.month || 0) > 0) 
                                        ? '신규' 
                                        : (stats?.monthChange.rate || 0) > 0 
                                        ? `${Math.round(stats?.monthChange.rate || 0)}%` 
                                        : '0%'
                                }
                            />
                            <StatsCard
                                label="총 공부시간"
                                value={stats ? formatStudyTime(stats.total) : '0시간 0분'}
                                icon="🎯"
                                bg="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                                sub="누적 학습량"
                                trend="up"
                                percentage={stats && stats.total > 0 ? "누적" : "0%"}
                            />
                        </div>

                        {/* 목표 완료 통계 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <StatsCard
                                label="이번달 목표 완료"
                                value={`${stats?.thisMonthGoalCompletions || 0}개`}
                                icon="🎯"
                                bg="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                                sub={`총 ${stats?.thisMonthTotalGoals || 0}개 중`}
                                trend={
                                    (stats?.thisMonthCompletionRate || 0) > 0 
                                        ? (stats?.thisMonthCompletionRate || 0) >= 50 ? "up" : "neutral"
                                        : "neutral"
                                }
                                percentage={
                                    (stats?.thisMonthCompletionRate || 0) > 0 
                                        ? `${Math.round(stats?.thisMonthCompletionRate || 0)}%`
                                        : "0%"
                                }
                            />
                            <StatsCard
                                label="전체 완료 목표"
                                value={`${stats?.totalCompletedGoals || 0}개`}
                                icon="✅"
                                bg="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
                                sub={`총 ${stats?.totalGoals || 0}개 중`}
                                trend={
                                    (stats?.overallCompletionRate || 0) > 0 
                                        ? (stats?.overallCompletionRate || 0) >= 50 ? "up" : "neutral"
                                        : "neutral"
                                }
                                percentage={
                                    (stats?.overallCompletionRate || 0) > 0 
                                        ? `${Math.round(stats?.overallCompletionRate || 0)}%`
                                        : "0%"
                                }
                            />
                        </div>

                        {/* 월별/일별 공부시간 표시 */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-end mb-4">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <span className="text-lg font-semibold text-gray-900 dark:text-white min-w-26 text-center">
                                        {format(currentDate, 'yyyy년 MM월')}
                                    </span>
                                    <button
                                        onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* 캘린더 표시 */}
                            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 lg:gap-2">
                                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                                    <div key={day} className="p-1 sm:p-3 text-center font-bold text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                                        {day}
                                    </div>
                                ))}

                                {eachDayOfInterval({
                                    start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 }),
                                    end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 })
                                }).map(date => {
                                    const dateStr = format(date, 'yyyy-MM-dd');
                                    const studyMinutes = calendarStudyData[dateStr] || 0;
                                    const isCurrentMonth = isSameMonth(date, currentDate);
                                    const studyHours = Math.floor(studyMinutes / 60);
                                    const remainingMinutes = studyMinutes % 60;

                                    // 공부시간에 따른 색상 강도 계산
                                    const getIntensityColor = (minutes: number) => {
                                        if (minutes === 0) return 'bg-gray-100 dark:bg-gray-800';
                                        if (minutes < 60) return 'bg-blue-100 dark:bg-blue-900'; // 1시간 미만
                                        if (minutes < 180) return 'bg-blue-200 dark:bg-blue-800'; // 3시간 미만
                                        if (minutes < 300) return 'bg-blue-400 dark:bg-blue-600'; // 5시간 미만
                                        return 'bg-blue-600 dark:bg-blue-500'; // 5시간 이상
                                    };

                                    const getTextColor = (minutes: number) => {
                                        if (minutes === 0) return 'text-gray-600 dark:text-gray-400';
                                        if (minutes < 180) return 'text-gray-700 dark:text-gray-200';
                                        return 'text-white';
                                    };

                                    return (
                                        <div
                                            key={dateStr}
                                            className={`relative p-1 sm:p-2 lg:p-3 rounded-md sm:rounded-lg text-center transition-all duration-200 hover:scale-105 min-h-[40px] sm:min-h-[60px] lg:min-h-[80px] flex flex-col justify-between
                                                ${isCurrentMonth 
                                                    ? getIntensityColor(studyMinutes)
                                                    : 'bg-gray-50 dark:bg-gray-900 opacity-40'
                                                } 
                                                ${isToday(date) ? 'ring-1 sm:ring-2 ring-orange-400 shadow-lg' : ''}
                                                ${studyMinutes > 0 && isCurrentMonth ? 'shadow-md hover:shadow-lg' : ''}`}
                                        >
                                            <div className={`text-xs sm:text-sm lg:text-base font-semibold ${getTextColor(studyMinutes)}`}>
                                                {format(date, 'd')}
                                            </div>
                                            
                                            {studyMinutes > 0 && isCurrentMonth && (
                                                <div className="flex flex-col items-center justify-center flex-1">
                                                    <div className={`text-[9px] lg:text-sm font-bold ${getTextColor(studyMinutes)}`}>
                                                        {studyHours > 0 && `${studyHours}h`}
                                                        {remainingMinutes > 0 && (studyHours > 0 ? ` ${remainingMinutes}m` : `${remainingMinutes}m`)}
                                                    </div>
                                                </div>
                                            )}

                                            {/* 오늘 표시 */}
                                            {isToday(date) && (
                                                <div className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full"></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* 범례 */}
                            <div className="mt-4 sm:mt-6">
                                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-100 dark:bg-gray-800 rounded"></div>
                                        <span className="text-gray-600 dark:text-gray-400">0시간</span>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 dark:bg-blue-900 rounded"></div>
                                        <span className="text-gray-600 dark:text-gray-400">1시간 미만</span>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-200 dark:bg-blue-800 rounded"></div>
                                        <span className="text-gray-600 dark:text-gray-400">1-3시간</span>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-400 dark:bg-blue-600 rounded"></div>
                                        <span className="text-gray-600 dark:text-gray-400">3-5시간</span>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 dark:bg-blue-500 rounded"></div>
                                        <span className="text-gray-600 dark:text-gray-400">5시간+</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Loading Overlay */}
            {isLoading && (
                <LoadingOverlay isLoading={isLoading} message="페이지를 로드하는 중..." />
            )}
        </div>
    );
}
