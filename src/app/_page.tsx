'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, subMonths, addMonths } from 'date-fns';
import { Calendar, GoalAddModal, GoalList, MiniCalendar, ParticipateModal, SectionLabel, ThemeEditButton, UserList, LoadingOverlay } from '@/components';
import { TimeSlot } from '@/modules/types/types';
import { usePageLoading } from '@/hooks/usePageLoading';
import useFirebaseState from '@/utils/useFirebaseState';
import { getTextColor } from '@/utils/textUtils';

export default function Home() {
  const { userList, participate: firebaseParticipate, addGoal, setParticipateDetail, removeParticipateForDate, schedules } = useFirebaseState();
  const { isLoading, navigateWithLoading } = usePageLoading();

  const [localParticipate, setLocalParticipate] = useState<typeof firebaseParticipate>({});
  
  useEffect(() => {
    setLocalParticipate(firebaseParticipate);
  }, [firebaseParticipate]);

  //오늘 날짜
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  //선택 날짜
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [miniDate, setMiniDate] = useState<Date | null>(null);

  //-----------------filter
  // 캘린더 유저 필터 상태
  const [calendarFilterUser, setCalendarFilterUser] = useState('');

  //-----------------modal
  // 일정 모달 상태
  const [showParticipateModal, setShowParticipateModal] = useState(false);

  
  const [showGoalAddModal, setShowGoalAddModal] = useState(false);
  
  // Participate input 상태
  const [participateInput, setParticipateInput] = useState<Record<string, { present?: boolean; timeSlots?: TimeSlot[]; }>>({});

  //-----------------layout
  // 왼쪽 사이드바 토글 상태
  const [isLeftAreaOpen, setIsLeftAreaOpen] = useState(false);
  //오른쪽 유저 추가 사이드바 상태
  const [isUserAddOpen, setIsUserAddOpen] = useState(false);

  //-----------------Data
  // 달력 날짜 생성
  const monthStart = currentDate ? startOfMonth(currentDate) : null;
  const monthEnd = currentDate ? endOfMonth(currentDate) : null;
  const startDate = monthStart ? startOfWeek(monthStart) : null;
  const endDate = monthEnd ? endOfWeek(monthEnd) : null;
  const daysInMonth = (startDate && endDate) ? eachDayOfInterval({ start: startDate, end: endDate }) : [];

  // UI 업데이트 콜백 함수
  const handleParticipateUpdate = (dateKey: string, updatedData: Record<string, { present?: boolean; start?: string; end?: string; timeSlots?: Array<{ start?: string; end?: string }> }>) => {
    setLocalParticipate(prev => {
      const convertedData: { [userId: string]: { present: boolean; start?: string; end?: string; timeSlots?: TimeSlot[] } } = {};
      Object.entries(updatedData).forEach(([userId, detail]) => {
        // timeSlots 변환 - 필수 필드 확인 후 변환
        const validTimeSlots: TimeSlot[] = (detail.timeSlots || [])
          .filter(slot => slot.start && slot.end) 
          .map(slot => ({
            start: slot.start!,
            end: slot.end!,
            id: Math.random().toString(36).substr(2, 9)
          }));

        convertedData[userId] = {
          present: detail.present ?? false,
          start: detail.start,
          end: detail.end,
          timeSlots: validTimeSlots
        };
      });

      return {
        ...prev,
        [dateKey]: convertedData
      };
    });
  };

  useEffect(() => {
    setMiniDate(new Date());
    setCurrentDate(new Date());
  }, []);


  if (!miniDate || !currentDate) return null;

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div
        className="flex flex-1 relative">
        {/* 데스크톱 사이드바 */}
        <aside
          className={`hidden lg:flex bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col p-6 gap-2 w-80
          fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out ${isLeftAreaOpen ? 'translate-x-0' : '-translate-x-full'}`}>

          {miniDate && <MiniCalendar currentDate={miniDate} />}
          <GoalList
            userList={userList}
            onGoalAdd={() => setShowGoalAddModal(true)}
          />
        </aside>

        {/* 모바일 사이드바 */}
        <aside
          className={`lg:hidden bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col p-6 gap-8 
          fixed inset-y-0 left-0 z-50 w-80 transition-all duration-300 ease-in-out ${isLeftAreaOpen ? 'translate-x-0' : '-translate-x-full'}`}>

          {/* 모바일 닫기 버튼 */}
          <button
            onClick={() => setIsLeftAreaOpen(false)}
            className="cursor-pointer absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {miniDate && <MiniCalendar currentDate={miniDate} />}
          <GoalList
            userList={userList}
          />
        </aside>

        {/* 모바일 사이드바 */}
        <aside
          className={`lg:hidden bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col p-6 gap-8 
          fixed inset-y-0 left-0 z-50 w-80 transition-all duration-300 ease-in-out ${isLeftAreaOpen ? 'translate-x-0' : '-translate-x-full'}`}>

          <GoalList
            userList={userList}
            onGoalAdd={() => setShowGoalAddModal(true)}
          />
        </aside>

        {/* 모바일 오버레이 */}
        {isLeftAreaOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-transparent z-40"
            onClick={() => setIsLeftAreaOpen(false)}
          />
        )}

        {/* 메인 달력 영역 */}
        <main
          className={`flex-1 flex flex-col p-4 lg:p-10 transition-all duration-300 ease-in-out
          ${isLeftAreaOpen ? 'lg:ml-80' : 'lg:ml-0'}`}>
          <div
            className="flex flex-col  items-start mb-2 w-full flex-wrap justify-between gap-2
              sm:gap-4 sm:items-center  sm:mb-4 sm:flex-row md:gap-6 lg:mb-8"
          >
            <div
              className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* 사이드바 토글 버튼 */}
              <button
                onClick={() => setIsLeftAreaOpen(!isLeftAreaOpen)}
                className="p-2 rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
              >
                <svg
                  className={`w-6 h-6 transition-transform duration-300 ${isLeftAreaOpen ?  '' : 'rotate-180' }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {currentDate &&
                <SectionLabel>
                  {format(currentDate, 'yyyy년 MM월')}
                </SectionLabel>}
              <select
                value={calendarFilterUser}
                onChange={e => setCalendarFilterUser(e.target.value)}
                className="ml-1 p-2 sm:ml-4 sm:p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-500 text-xs sm:text-sm"
                style={{ minWidth: 80 }}
              >
                <option value="">전체</option>
                {userList
                  .sort((a, b) => a.name.localeCompare(b.name, 'ko', { numeric: true }))
                  .map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
              </select>
            </div>

            <div
              className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-wrap mt-1 sm:mt-0">
              <button
                onClick={() => setCurrentDate(new Date())}
                className="p-2 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors cursor-pointer text-xs lg:text-sm"
                style={{ minWidth: 44 }}
              >
                오늘
              </button>
              <button
                onClick={() => currentDate && setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <svg
                  className="w-4 h-4 lg:w-6 lg:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => currentDate && setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <svg
                  className="w-4 h-4 lg:w-6 lg:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <ThemeEditButton />
              <button
                className="p-2 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors cursor-pointer text-xs sm:text-sm lg:text-base"
                onClick={() => navigateWithLoading('/stats')}
              >
                📊 통계
              </button>
              <button
                onClick={() => setIsUserAddOpen(true)}
                className="p-2 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-colors cursor-pointer"
                title="참여자 관리 열기"
              >
                <svg
                  className="w-4 h-4 lg:w-6 lg:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
          {/* 모바일 캘린더 */}
          <div className="md:hidden">
            <MiniCalendar 
              currentDate={currentDate || new Date()}
              participate={localParticipate}
              userList={userList}
              filterUserId={calendarFilterUser}
              selectedDate={selectedDate}
              schedules={schedules}
              onDayClick={(date: Date) => {
                setSelectedDate(date);
              }}
            />
            
            {/* 모바일용 일정 요약 */}
            {selectedDate && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {format(selectedDate, 'M월 d일')} 일정
                </h3>
                <div className="space-y-3">
                  {(() => {
                    const dateKey = format(selectedDate, 'yyyy-MM-dd');
                    const dayParticipants = localParticipate[dateKey] ? Object.keys(localParticipate[dateKey]) : [];
                    const filteredParticipants = dayParticipants.filter(pid => 
                      !calendarFilterUser || pid === calendarFilterUser
                    );
                    
                    // 스케줄 정보 가져오기
                    const daySchedules = schedules[dateKey] || [];
                    
                    // 참석자와 스케줄이 모두 없는 경우
                    if (filteredParticipants.length === 0 && daySchedules.length === 0) {
                      return <p className="text-gray-500 dark:text-gray-400 text-sm">일정이 없습니다.</p>;
                    }
                    
                    return (
                      <>
                        {/* 스케줄 표시 */}
                        {daySchedules.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              📋 스케줄 ({daySchedules.length}개)
                            </h4>
                            {daySchedules.map((schedule, index) => (
                              <div key={index} className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700">
                                <div className="text-sm text-blue-700 dark:text-blue-200">
                                  {schedule.content}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* 참석자 표시 */}
                        {filteredParticipants.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              👥 참석자 ({filteredParticipants.length}명)
                            </h4>
                            {filteredParticipants.map(pid => {
                              const user = userList.find(u => u.id === pid);
                              const participateInfo = localParticipate[dateKey][pid];
                              if (!user) return null;
                              
                              return (
                                <div key={pid} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className="font-semibold px-2 py-1 rounded-full text-xs inline-flex items-center gap-1"
                                        style={{
                                          backgroundColor: user.color || '#6366f1',
                                          color: getTextColor(user.color || '#6366f1'),
                                        }}
                                      >
                                        <span
                                          className={`inline-block w-1 h-1 rounded-full ${participateInfo.present ? 'bg-green-400' : 'bg-red-400'}`}
                                        />
                                        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                                          {user.name}
                                        </span>
                                      </span>
                                    </div>
                                    <div className={`text-xs font-medium ${participateInfo.present ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                      {participateInfo.present ? '참석' : '미참'}
                                    </div>
                                  </div>
                                  
                                  {/* 참석 시간 정보 */}
                                  {participateInfo.present && participateInfo.timeSlots && participateInfo.timeSlots.length > 0 && (
                                    <div className="space-y-1 mt-2">
                                      {participateInfo.timeSlots.map((timeSlot, index) => (
                                        <div key={index} className="text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 px-2 py-1 rounded">
                                          {timeSlot.start} - {timeSlot.end}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
                <button
                  onClick={() => {
                    if (selectedDate) {
                      const dateKey = format(selectedDate, 'yyyy-MM-dd');
                      const existingParticipate = localParticipate[dateKey] || {};
                      setParticipateInput(existingParticipate);
                      setShowParticipateModal(true);
                    }
                  }}
                  className="w-full mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  일정 편집
                </button>
              </div>
            )}
          </div>

          {/* 데스크톱 캘린더 */}
          <div className="hidden md:block">
            <Calendar
              daysInMonth={daysInMonth}
              currentDate={currentDate}
              participate={localParticipate}
              userList={userList}
              filterUserId={calendarFilterUser}
              onDayClick={(date: Date) => {
                setSelectedDate(date);
                const dateKey = format(date, 'yyyy-MM-dd');
                const existingParticipate = localParticipate[dateKey] || {};
                setParticipateInput(existingParticipate);
                setShowParticipateModal(true);
              }}
            />
          </div>
        </main>

        {/* 유저관리 */}
        <div
          className={`fixed inset-y-0 right-0 w-80 bg-gray-100 dark:bg-gray-800 shadow-xl transform transition-transform 
            duration-300 ease-in-out z-50 ${isUserAddOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <UserList
            userList={userList}
            userSliderClose={() => setIsUserAddOpen(false)}
          />
        </div>

        {/* Modals */}
        <ParticipateModal
          open={showParticipateModal}
          date={selectedDate}
          userList={userList}
          initialParticipateInput={participateInput}
          setParticipateDetail={setParticipateDetail}
          removeParticipateForDate={removeParticipateForDate}
          onClose={() => setShowParticipateModal(false)}
          onParticipateUpdate={handleParticipateUpdate}
        />

        <GoalAddModal
          open={showGoalAddModal}
          userList={userList}
          onAdd={(userId, content) => {
            addGoal({ userId, content, completed: false });
          }}
          onClose={() => setShowGoalAddModal(false)}
        />
        
        {/* Loading Overlay */}
        {isLoading && (
          <LoadingOverlay isLoading={isLoading} message="페이지를 로드하는 중..." />
        )}
      </div>
    </div>
  );
}