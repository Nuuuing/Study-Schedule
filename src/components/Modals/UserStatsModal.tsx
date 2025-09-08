import React, { useState, useMemo } from 'react';
import StatsCard from '../Common/StatsCard';
import useFirebaseState from '@/utils/useFirebaseState';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekday from 'dayjs/plugin/weekday';
import isBetween from 'dayjs/plugin/isBetween';

// dayjs 플러그인 설정
dayjs.extend(weekOfYear);
dayjs.extend(weekday);
dayjs.extend(isBetween);

type UserStatsModalProps = {
    participants: { id: string; name: string; color?: string; icon?: string }[];
    studyHours: Record<string, Record<string, { hours: number; minutes: number }>>;
    participate: Record<string, Record<string, { present: boolean; start?: string; end?: string }>>;
    onClose: () => void;
};

export const UserStatsModal = (props: UserStatsModalProps) => {
    const { participants, studyHours, participate, onClose } = props;
    const [selectedUser, setSelectedUser] = useState('');
    const [mode, setMode] = useState<'month' | 'week' | 'day'>('month');

    const { goals } = useFirebaseState();

    // 시간 차이 계산 함수
    function getTimeDiff(start: string, end: string) {
        if (!start || !end) return { hours: 0, minutes: 0 };
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        const startM = sh * 60 + sm;
        let endM = eh * 60 + em;
        if (endM < startM) endM += 24 * 60; // 자정 넘김 보정
        const diff = endM - startM;
        return { hours: Math.floor(diff / 60), minutes: diff % 60 };
    }

    const stats = useMemo(() => {
        if (!selectedUser) return null;
        // 날짜 합집합 구하기
        const allDates = Array.from(new Set([
            ...Object.keys(studyHours || {}),
            ...Object.keys(participate || {})
        ])).sort();
        
        const getWeek = (date: string) => {
            const d = dayjs(date);
            const weekStart = d.weekday(0); // 일요일을 주의 시작으로
            return weekStart.format('YYYY-MM-DD');
        };

        const group: Record<string, { hours: number, minutes: number, days: Set<string>, weekStart?: string, weekEnd?: string }> = {};
        
        for (const date of allDates) {
            const entry = studyHours[date]?.[selectedUser];
            const attend = participate[date]?.[selectedUser];
            let key = '';
            
            if (mode === 'month') {
                key = date.slice(0, 7);
            } else if (mode === 'week') {
                key = getWeek(date);
                // 주별일 때 주의 시작과 끝 날짜 계산
                if (!group[key]) {
                    const weekStart = dayjs(date).weekday(0); // 일요일 시작
                    const weekEnd = dayjs(date).weekday(6);   // 토요일 마지막
                    group[key] = { 
                        hours: 0, 
                        minutes: 0, 
                        days: new Set(),
                        weekStart: weekStart.format('MM/DD'),
                        weekEnd: weekEnd.format('MM/DD')
                    };
                }
            } else {
                key = date;
            }
            
            if (!group[key]) group[key] = { hours: 0, minutes: 0, days: new Set() };
            
            if (entry) {
                group[key].hours += entry.hours;
                group[key].minutes += entry.minutes;
            } else if (attend && attend.start && attend.end) {
                // studyHours가 없고 참가에 start/end가 있으면 시간 계산
                const diff = getTimeDiff(attend.start, attend.end);
                group[key].hours += diff.hours;
                group[key].minutes += diff.minutes;
            }
            if (attend && attend.present) group[key].days.add(date);
        }
        Object.values(group).forEach(g => {
            g.hours += Math.floor(g.minutes / 60);
            g.minutes = g.minutes % 60;
        });
        return group;
    }, [selectedUser, mode, studyHours, participate]);

    // 목표 통계 계산
    const userGoals = goals.filter((g) => g.userId === selectedUser);
    const completedGoals = userGoals.filter((g) => g.completed);
    const totalGoals = userGoals.length;
    const completedCount = completedGoals.length;
    // 총 공부시간 계산
    let totalStudy = { hours: 0, minutes: 0 };
    if (selectedUser && stats) {
        totalStudy = Object.values(stats).reduce((acc: { hours: number; minutes: number }, b: { hours: number; minutes: number }) => {
            acc.minutes += b.minutes;
            acc.hours += b.hours;
            return acc;
        }, { hours: 0, minutes: 0 });
        totalStudy.hours += Math.floor(totalStudy.minutes / 60);
        totalStudy.minutes = totalStudy.minutes % 60;
    }

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-[520px] shadow-2xl flex flex-col gap-6 border border-gray-200 dark:border-gray-700 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl cursor-pointer">✕</button>
                <div className="flex flex-col gap-2 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">유저 통계</h3>
                    <select
                        value={selectedUser}
                        onChange={e => setSelectedUser(e.target.value)}
                        className="cursor-pointer p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-500"
                    >
                        <option value="">유저 선택</option>
                        {participants
                            .sort((a, b) => a.name.localeCompare(b.name, 'ko', { numeric: true }))
                            .map((p) => <option key={p.id} value={p.id} >{p.name}</option>)}
                    </select>
                </div>
                <div className="flex gap-4 mb-2">
                    <button
                        onClick={() => setMode('month')}
                        className={`flex-1 px-2 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${mode === 'month' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'}`}>월별</button>
                    <button
                        onClick={() => setMode('week')}
                        className={`flex-1 px-2 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${mode === 'week' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'}`}>주별</button>
                    <button
                        onClick={() => setMode('day')}
                        className={`flex-1 px-2 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${mode === 'day' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'}`}>일별</button>
                </div>
                {selectedUser && (
                    <div className="grid grid-cols-3 gap-4 mb-2">
                        <StatsCard label="목표 완료" value={<span>{completedCount} <span className="text-base font-normal opacity-70">/ {totalGoals}</span></span>} sub="완료/총 목표" color="#fff" bg="linear-gradient(135deg, #7f53ff 60%, #3b82f6 100%)" />
                        <StatsCard label="참여일수" value={<span>{Object.values(stats || {}).reduce((a, b) => a + b.days.size, 0)}</span>} sub="출석한 일수 합계" color="#fff" bg="linear-gradient(135deg, #23244a 60%, #3b82f6 100%)" />
                        <StatsCard
                            label="총 공부시간"
                            value={<span>{totalStudy.hours}시간 {totalStudy.minutes}분</span>}
                            sub="누적 공부시간"
                            color="#fff"
                            bg="linear-gradient(135deg, #23244a 60%, #06b6d4 100%)"
                        />
                    </div>
                )}
                {selectedUser && stats && (
                    <div className="max-h-60 overflow-y-auto rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-0">
                        <table className="w-full text-sm text-gray-900 dark:text-white table-fixed">
                            <colgroup>
                                <col style={{ width: '40%' }} />
                                <col style={{ width: '30%' }} />
                                <col style={{ width: '30%' }} />
                            </colgroup>
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <th className="text-left px-4 py-2 font-semibold text-gray-600 dark:text-gray-300">구분</th>
                                    <th className="text-center px-4 py-2 font-semibold text-gray-600 dark:text-gray-300">공부시간</th>
                                    <th className="text-center px-4 py-2 font-semibold text-gray-600 dark:text-gray-300">참여일수</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(stats).map(([k, v], idx) => {
                                    // 표시할 라벨 생성
                                    let displayLabel = k;
                                    if (mode === 'week' && v.weekStart && v.weekEnd) {
                                        displayLabel = `${v.weekStart} ~ ${v.weekEnd}`;
                                    } else if (mode === 'month') {
                                        const [year, month] = k.split('-');
                                        displayLabel = `${year}년 ${parseInt(month)}월`;
                                    }
                                    
                                    return (
                                        <tr key={k} className={`group transition ${idx % 2 === 0 ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'} hover:bg-blue-50 dark:hover:bg-blue-950/60`}>
                                            <td className="px-4 py-2 rounded-l-lg font-medium align-middle">
                                                <span className="inline-block w-2 h-2 rounded-full bg-blue-400/60 group-hover:bg-blue-500/80 mr-2"></span>
                                                {displayLabel}
                                            </td>
                                            <td className="px-4 py-2 text-blue-600 dark:text-blue-200 font-bold tracking-wide text-center align-middle">
                                                {v.hours}시간 {v.minutes}분
                                            </td>
                                            <td className="px-4 py-2 rounded-r-lg text-purple-600 dark:text-purple-200 font-semibold text-center align-middle">
                                                {v.days.size}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                {!selectedUser && <div className="text-gray-500 dark:text-gray-400 text-center">유저를 선택하세요.</div>}
            </div>
        </div>
    );
}
