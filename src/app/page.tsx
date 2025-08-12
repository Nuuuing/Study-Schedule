'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, subMonths, addMonths } from 'date-fns';
import useFirebaseState from '../utils/useFirebaseState';
import type { Attendance } from '@/types/types';
import { AttendanceModal, Calendar, GoalAddModal, GoalList, MiniCalendar, SectionLabel, UserList, UserStatsModal } from '@/components';

export default function Home() {

  // 테마 상태 관리
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  // 목표 유저별 필터링 상태
  const [goalFilterUser, setGoalFilterUser] = useState('');
  // 미니 달력용 상태
  const [miniDate] = useState(new Date());
  // 통계 모달 상태
  const [showStats, setShowStats] = useState(false);
  // 목표 추가 모달 상태
  const [showGoalAdd, setShowGoalAdd] = useState(false);
  // 왼쪽 사이드바 토글 상태
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  // 왼쪽 사이드바 접기 상태 (데스크톱용)
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  // 캘린더 유저별 필터 상태 추가
  const [calendarFilterUser, setCalendarFilterUser] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // 출석/시간 입력 모달용 핸들러들 (임시 기본구현)
  const handleAddUserToDate = (id: string) => {
    setAttendanceInput(prev => ({ ...prev, [id]: { present: false, start: '', end: '' } }));
  };

  const handleTogglePresent = (id: string) => {
    setAttendanceInput(prev => ({
      ...prev,
      [id]: { ...prev[id], present: !prev[id]?.present }
    }));
  };

  const handleTimeChange = (id: string, field: 'start' | 'end', value: string) => {
    setAttendanceInput(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleRemoveUserFromDate = (id: string) => {
    setAttendanceInput(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const { participants, goals, attendance, studyHours, addParticipant, removeParticipant, addGoal, toggleGoalCompletion, setAttendanceDetail, updateParticipant, updateGoal, deleteGoal } = useFirebaseState();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [attendanceInput, setAttendanceInput] = useState<Attendance[string]>({});

  // 달력 날짜 생성
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

  const handleOpenModal = (date: Date) => {
    setSelectedDate(date);
    setShowModal(true);
    const dateKey = format(date, 'yyyy-MM-dd');
    setAttendanceInput(attendance[dateKey] ? { ...attendance[dateKey] } : {});
  };

  const handleSaveAttendance = () => {
    if (!selectedDate) return;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    Object.entries(attendanceInput).forEach(([pid, detail]) => {
      setAttendanceDetail(dateKey, pid, detail);
    });
    setShowModal(false);
  };
  
  const handleToggleGoalCompletion = (goalId: string, participantId: string) => {
    toggleGoalCompletion(goalId, participantId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="flex flex-1 relative">
        {/* 왼쪽 사이드바 */}
        <aside className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col p-6 gap-8 
          lg:static lg:translate-x-0 lg:block
          ${isLeftSidebarOpen ? 'fixed inset-y-0 left-0 z-50 translate-x-0 w-80' : 'fixed inset-y-0 left-0 z-50 -translate-x-full lg:translate-x-0'}
          ${isLeftSidebarCollapsed ? 'lg:w-16' : 'lg:w-80'}
          transition-all duration-300 ease-in-out`}>

          {/* 데스크톱용 접기 버튼 */}
          <button
            onClick={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
            className="hidden lg:flex absolute -right-4 top-10 w-8 h-8 bg-gray-200 dark:bg-gray-700 shadow-lg border-none rounded-full items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-110 active:scale-95 transition-all duration-200 z-20 group cursor-pointer"
            aria-label={isLeftSidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
          >
            <svg
              className={`w-4 h-4 text-white drop-shadow transition-transform duration-300 ${isLeftSidebarCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="absolute left-full ml-2 px-2 py-1 rounded bg-black/80 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {isLeftSidebarCollapsed ? '펼치기' : '접기'}
            </span>
          </button>

          {/* 모바일용 닫기 버튼 */}
          <button
            onClick={() => setIsLeftSidebarOpen(false)}
            className="cursor-pointer lg:hidden absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {!isLeftSidebarCollapsed && (
            <>
              <MiniCalendar currentDate={miniDate}  />
              <div>
                <SectionLabel className="mb-2">이번달 목표</SectionLabel>

                <div className='flex items-center'>
                  <span className='pr-[5px] flex items-center'>
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                      <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                  <select
                    value={goalFilterUser}
                    onChange={e => setGoalFilterUser(e.target.value)}
                    className="mb-2 w-[90%] p-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">전체</option>
                    {participants.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  className="w-full mb-4 p-2 rounded-md font-semibold transition-colors cursor-pointer"
                  style={{ backgroundColor: participants.length > 0 ? '#3b82f6' : '#d1d5db', color: participants.length > 0 ? '#fff' : '#888' }}
                  onClick={() => { setShowGoalAdd(true) }}
                >
                  목표 추가
                </button>
                <GoalList
                  goals={goalFilterUser ? goals.filter(g => g.participantId === goalFilterUser) : goals}
                  participants={participants}
                  onToggle={handleToggleGoalCompletion}
                  onEdit={updateGoal}
                  onDelete={deleteGoal}
                />
              </div>
            </>
          )}
        </aside>

        {/* 모바일용 오버레이 */}
        {isLeftSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsLeftSidebarOpen(false)}
          />
        )}

        {/* 메인 달력 영역 */}
        <main className="flex-1 flex flex-col p-4 lg:p-10">
          <div
            className="
              flex flex-col sm:flex-row
              items-start sm:items-center
              justify-between
              gap-2 sm:gap-4 md:gap-6
              mb-2 sm:mb-4 lg:mb-8
              w-full
              flex-wrap
            "
          >
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* 모바일용 사이드바 토글 버튼 */}
              <button
                onClick={() => setIsLeftSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <SectionLabel className="text-lg sm:text-xl lg:text-3xl mb-0 whitespace-nowrap">{format(currentDate, 'yyyy년 MM월')}</SectionLabel>
              <select
                value={calendarFilterUser}
                onChange={e => setCalendarFilterUser(e.target.value)}
                className="ml-1 p-1.5 sm:ml-4 sm:p-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-xs sm:text-sm"
                style={{ minWidth: 80 }}
              >
                <option value="">전체</option>
                {participants.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-wrap mt-1 sm:mt-0">
              <button
                onClick={() => setCurrentDate(new Date())}
                className="p-2 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors cursor-pointer text-xs lg:text-sm"
                style={{ minWidth: 44 }}
              >
                오늘
              </button>
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button onClick={toggleTheme} className="p-2 rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                {theme === 'light' ? (
                  <svg className="w-4 h-4 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
              <button className="p-2 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors cursor-pointer text-xs sm:text-sm lg:text-base"
                onClick={() => setShowStats(true)}>
                통계
              </button>
              <button
                onClick={() => setIsSliderOpen(true)}
                className="p-2 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-colors cursor-pointer"
                title="참여자 관리 열기"
              >
                <svg className="w-4 h-4 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
          <div
            className="
              bg-white dark:bg-gray-800
              rounded-xl sm:rounded-2xl
              shadow
              p-1.5 sm:p-3 md:p-4 lg:p-6
              mt-2 mb-4
              overflow-x-auto
              w-full
              transition-all
            "
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <Calendar
              daysInMonth={daysInMonth}
              currentDate={currentDate}
              goals={goals}
              participants={calendarFilterUser ? participants.filter(p => p.id === calendarFilterUser) : participants}
              attendance={calendarFilterUser ? Object.fromEntries(Object.entries(attendance).map(([date, obj]) => [date, Object.fromEntries(Object.entries(obj).filter(([pid]) => pid === calendarFilterUser))])) : attendance}
              onDayClick={handleOpenModal}
            />
          </div>
        </main>

        {/* 오른쪽 슬라이딩 참여자 관리 창 */}
        <div
          className={`fixed inset-y-0 right-0 w-80 bg-gray-100 dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out z-50
          ${isSliderOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <SectionLabel>참여자 관리</SectionLabel>
              <button
                onClick={() => setIsSliderOpen(false)}
                className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={e => { e.preventDefault(); addParticipant(newParticipantName); setNewParticipantName(''); }} className="mb-6 flex gap-2">
              <input
                type="text"
                value={newParticipantName}
                onChange={e => setNewParticipantName(e.target.value)}
                placeholder="참여자 이름 입력"
                className="flex-1 p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="p-2 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors">
                추가
              </button>
            </form>
            <UserList
              participants={participants}
              onRemove={removeParticipant}
              onEdit={updateParticipant}
            />
          </div>
        </div>
      </div>

      {/* 모달들 */}
      {showStats && (
        <UserStatsModal
          participants={participants}
          studyHours={studyHours}
          attendance={attendance}
          goals={goals}
          onClose={() => setShowStats(false)}
        />
      )}
      <AttendanceModal
        open={showModal}
        date={selectedDate}
        participants={participants}
        attendanceInput={attendanceInput}
        onAddUser={handleAddUserToDate}
        onTogglePresent={handleTogglePresent}
        onTimeChange={handleTimeChange}
        onRemoveUser={handleRemoveUserFromDate}
        onClose={() => setShowModal(false)}
        onSave={handleSaveAttendance}
      />
      <GoalAddModal
        open={showGoalAdd}
        participants={participants}
        onAdd={(participantId, content) => {
          addGoal({ participantId, content, completed: false });
        }}
        onClose={() => setShowGoalAdd(false)}
      />
    </div>
  );

}