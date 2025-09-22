import { CommonModal } from "./CommonModal";
import { useShowDayModal } from "@/modules/stores";
import dayjs from 'dayjs';
import { useTheme } from "@/contexts";
import { useState, useEffect, FC } from "react";
import { TimeSlot, Goal } from "@/modules/types";
import { useToast } from "@/contexts/ToastContext";
import {
    useGoals,
    useSchedules,
    useStudyHours,
    useParticipation,
    ScheduleItem
} from "@/hooks";

// 타입 정의
interface ExtendedGoal extends Goal {
    // targetTime을 개별 목표에서 제거
}

interface DayModalProps {
    selectedDay: Date | null;
    onClose: () => void;
}

// 탭 정의
type TabType = 'std' | 'sch';
interface TabItemProps {
    id: TabType;
    label: string;
    activeTab: TabType;
    onClick: (id: TabType) => void;
    themeClasses: any;
}

// 시간 입력 컴포넌트
interface TimeInputProps {
    hours: number;
    minutes: number;
    setHours: (hours: number) => void;
    setMinutes: (minutes: number) => void;
    label?: string;
}

// 탭 아이템 컴포넌트
const TabItem: FC<TabItemProps> = ({ id, label, activeTab, onClick, themeClasses }) => (
    <div
        className={`flex justify-center items-center w-1/2 px-4 py-2 cursor-pointer transition-all duration-150
            border-2 rounded-t-md hover:bg-black/5
            ${activeTab === id
                ? `${themeClasses.card} ${themeClasses.border} shadow-sm`
                : `${themeClasses.border} border-opacity-40 bg-transparent opacity-70`
            }`}
        onClick={() => onClick(id)}
    >
        <span className={`text-sm font-bold ${themeClasses.text}`}>{label}</span>
    </div>
);

// 시간 입력 컴포넌트
const TimeInput: FC<TimeInputProps> = ({ hours, minutes, setHours, setMinutes, label }) => (
    <div className="flex items-center space-x-2">
        {label && <div className="text-sm font-medium mr-2">{label}</div>}
        <input
            type="number"
            value={hours || ''}
            onChange={(e) => setHours(parseInt(e.target.value) || 0)}
            min={0}
            className="w-16 px-2 py-1 rounded-md border-2 focus:outline-none text-center"
        />
        <span className="text-sm">시간</span>
        <input
            type="number"
            value={minutes || ''}
            onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
            min={0}
            max={59}
            className="w-16 px-2 py-1 rounded-md border-2 focus:outline-none text-center"
        />
        <span className="text-sm">분</span>
    </div>
);

export const DayModal: FC<DayModalProps> = ({ selectedDay, onClose }) => {
    const showDayModal = useShowDayModal();
    const { theme } = useTheme();
    const themeClasses = theme.classes;
    const { showToast } = useToast();

    // 탭 관리
    const [activeTab, setActiveTab] = useState<TabType>('std');

    // 참여 관련 상태
    const [isParticipating, setIsParticipating] = useState(false);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([{ start: '', end: '', id: Date.now().toString() }]);

    // 목표 관련 상태
    const [newGoal, setNewGoal] = useState("");
    const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
    const [showNewGoalInput, setShowNewGoalInput] = useState(false);
    
    // 하루 전체 목표 시간
    const [dailyGoalHours, setDailyGoalHours] = useState(0);
    const [dailyGoalMinutes, setDailyGoalMinutes] = useState(0);

    // 일정 입력 관련 상태
    const [scheduleContent, setScheduleContent] = useState("");
    const [actualStudyHours, setActualStudyHours] = useState<{ hours: number, minutes: number }>({ hours: 0, minutes: 0 });

    // 현재 활성 사용자 ID
    const activeUserId = "local-user-1";

    // 날짜 문자열 포맷
    const dateStr = selectedDay ? dayjs(selectedDay).format('YYYY-MM-DD') : '';

    // 커스텀 훅 사용
    const {
        goals,
        addGoal: addNewGoal,
        updateGoal: updateGoalData,
        deleteGoal: removeGoal,
        toggleGoalCompletion: toggleGoalStatus
    } = useGoals([]);

    const {
        schedules,
        addSchedule: addNewSchedule,
        removeSchedule: removeScheduleItem,
        updateSchedule: updateScheduleItem
    } = useSchedules({});

    const {
        studyHours,
        setStudyHoursForDate
    } = useStudyHours({});

    const {
        participation,
        setParticipateDetail
    } = useParticipation({});

    // 현재 날짜의 목표 및 일정
    const dateGoals = goals.filter(goal => goal.userId === activeUserId) as ExtendedGoal[];
    const dateSchedules: ScheduleItem[] = dateStr && schedules[dateStr] ? schedules[dateStr] : [];

    // 현재 사용자의 참여 정보
    const userParticipation = dateStr && participation[dateStr] && participation[dateStr][activeUserId];
    
    // 시간 슬롯에서 총 공부 시간(분) 계산 함수
    const calculateTotalStudyTime = (slots: TimeSlot[]): number => {
        return slots.reduce((total, slot) => {
            if (!slot.start || !slot.end) return total;
            
            const [startHour, startMinute] = slot.start.split(':').map(Number);
            const [endHour, endMinute] = slot.end.split(':').map(Number);
            
            if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
                return total;
            }
            
            const startMinutes = (startHour * 60) + startMinute;
            const endMinutes = (endHour * 60) + endMinute;
            
            // 종료 시간이 시작 시간보다 이전인 경우 (다음날로 넘어가는 경우) 처리
            const duration = endMinutes >= startMinutes 
                ? endMinutes - startMinutes 
                : (24 * 60 - startMinutes) + endMinutes;
                
            return total + duration;
        }, 0);
    };

    // 컴포넌트 마운트 시 참여 정보 확인 및 초기화
    useEffect(() => {
        if (dateStr && userParticipation) {
            setIsParticipating(userParticipation.present || false);
            setTimeSlots(
                userParticipation.timeSlots && userParticipation.timeSlots.length > 0 
                ? userParticipation.timeSlots 
                : [{ start: '', end: '', id: Date.now().toString() }]
            );
            
            // 실제 공부 시간 계산
            if (userParticipation.timeSlots && userParticipation.timeSlots.length > 0) {
                const totalMinutes = calculateTotalStudyTime(userParticipation.timeSlots);
                setActualStudyHours({
                    hours: Math.floor(totalMinutes / 60),
                    minutes: totalMinutes % 60
                });
            }
        } else if (dateStr) {
            // 참여 정보가 없는 경우 초기화
            setIsParticipating(false);
            setTimeSlots([{ start: '', end: '', id: Date.now().toString() }]);
            setActualStudyHours({ hours: 0, minutes: 0 });
        }
    }, [dateStr, userParticipation]);
    
    // 모달이 열릴 때 상태 초기화
    useEffect(() => {
        if (!selectedDay) return;
        
        // 일정 관련 입력 필드 초기화
        setScheduleContent("");
        
        // 목표 관련 입력 필드 초기화
        setNewGoal("");
        setEditingGoalId(null);
        setShowNewGoalInput(false);
        
        // TODO: API에서 날짜에 해당하는 목표 시간 정보를 가져오는 로직 구현
        // 임시로 0으로 초기화
        setDailyGoalHours(0);
        setDailyGoalMinutes(0);
        
        // 다른 상태값들은 참여 정보 확인 useEffect에서 처리
    }, [selectedDay]);

    // 시간 슬롯 추가
    const addTimeSlot = () => {
        setTimeSlots([...timeSlots, { start: '', end: '', id: Date.now().toString() }]);
    };

    // 시간 슬롯 삭제
    const removeTimeSlot = (id: string) => {
        if (timeSlots.length <= 1) {
            showToast("최소 하나의 시간 슬롯이 필요합니다.", "error");
            return;
        }
        setTimeSlots(timeSlots.filter(slot => slot.id !== id));
    };

    // 시간 슬롯 업데이트
    const updateTimeSlot = (id: string, field: 'start' | 'end', value: string) => {
        setTimeSlots(timeSlots.map(slot =>
            slot.id === id ? { ...slot, [field]: value } : slot
        ));
    };

    // 참여 상태 저장
    const saveParticipation = async () => {
        if (!dateStr) {
            showToast("날짜 정보가 없습니다.", "error");
            return;
        }

        // 시간 슬롯 유효성 검사
        if (isParticipating) {
            // 빈 시간 슬롯 필터링
            const validTimeSlots = timeSlots.filter(slot => slot.start && slot.end);
            
            if (validTimeSlots.length === 0) {
                showToast("최소 하나의 유효한 시간 슬롯이 필요합니다.", "error");
                return;
            }
            
            // 시간 순서 확인 (시작 시간이 종료 시간보다 늦은 경우)
            const invalidTimeSlots = validTimeSlots.filter(slot => {
                const [startHour, startMinute] = slot.start.split(':').map(Number);
                const [endHour, endMinute] = slot.end.split(':').map(Number);
                
                // 24시간을 넘어가는 경우(다음날) 유효하다고 처리
                if (startHour > endHour) return false;
                if (startHour === endHour && startMinute >= endMinute) return true;
                return false;
            });
            
            if (invalidTimeSlots.length > 0) {
                showToast("종료 시간은 시작 시간보다 늦어야 합니다.", "error");
                return;
            }
        }

        try {
            // 실제 공부 시간 계산 및 저장
            if (isParticipating) {
                const totalStudyMinutes = calculateTotalStudyTime(timeSlots);
                const hours = Math.floor(totalStudyMinutes / 60);
                const minutes = totalStudyMinutes % 60;
                await setStudyHoursForDate(dateStr, activeUserId, hours, minutes);
            }
            
            // 참여 정보 저장
            await setParticipateDetail(dateStr, activeUserId, {
                present: isParticipating,
                timeSlots: isParticipating ? timeSlots.filter(slot => slot.start && slot.end) : undefined
            });
            
            showToast("참여 상태가 저장되었습니다.", "success");
        } catch (error) {
            console.error("참여 상태 저장 실패:", error);
            showToast("참여 상태 저장에 실패했습니다.", "error");
        }
    };

    // 목표 달성률 계산
    const calculateGoalPercentage = (): number => {
        if (!dateGoals || dateGoals.length === 0) {
            return 0;
        }

        // 현재 공부한 총 시간(분)
        const totalStudyMinutes = calculateTotalStudyTime(timeSlots);
        
        // 목표 시간 가중치 (70%)
        let timeWeight = 0;
        
        // 하루 전체 목표 시간 (분)
        const dailyGoalTotalMinutes = (dailyGoalHours * 60) + dailyGoalMinutes;

        if (dailyGoalTotalMinutes > 0) {
            // 실제 공부 시간이 목표 시간보다 많으면 100%, 아니면 비율에 따라 계산
            timeWeight = Math.min(totalStudyMinutes / dailyGoalTotalMinutes, 1) * 70;
        }

        // 체크리스트 완료 가중치 (30%)
        const totalGoals = dateGoals.length;
        const completedGoals = dateGoals.filter(goal => goal.completed).length;
        const checklistWeight = totalGoals > 0 ? (completedGoals / totalGoals) * 30 : 0;

        // 전체 가중치 합산 (소수점 반올림)
        return Math.round(timeWeight + checklistWeight);
    };

    // 하루 목표 시간 저장 함수
    const saveDailyGoalTime = () => {
        try {
            
            showToast("목표 시간이 저장되었습니다.", "success");
        } catch (error) {
            console.error("목표 시간 저장 실패:", error);
            showToast("목표 시간 저장에 실패했습니다.", "error");
        }
    };

    // 목표 추가/수정 함수
    const handleGoalAction = () => {
        // 입력 검증
        if (!newGoal.trim()) {
            showToast("목표 내용을 입력해주세요.", "error");
            return;
        }
        
        const goalData = {
            id: editingGoalId || Date.now().toString(),
            userId: activeUserId,
            content: newGoal,
            completed: editingGoalId ? dateGoals.find(g => g.id === editingGoalId)?.completed || false : false
        } as ExtendedGoal;
        
        try {
            if (editingGoalId) {
                // 목표 수정
                updateGoalData(editingGoalId, activeUserId, goalData);
                showToast("목표가 수정되었습니다.", "success");
            } else {
                // 새 목표 추가
                addNewGoal(goalData);
                showToast("새 목표가 추가되었습니다.", "success");
            }
            
            // 입력 필드 초기화 및 폼 닫기
            setShowNewGoalInput(false);
            setEditingGoalId(null);
            setNewGoal("");
        } catch (error) {
            console.error("목표 저장 실패:", error);
            showToast("목표 저장에 실패했습니다.", "error");
        }
    };

    return (
        <CommonModal
            isOpen={showDayModal}
            onClose={onClose}
            title={selectedDay ? dayjs(selectedDay).format('YYYY년 MM월 DD일') : '-'}
            animation="scale"
            width="w-[520px]"
            showCancelButton={true}
            cancelText="닫기"
        >
            <div className="flex flex-row items-center justify-center">
                {
                    [
                        { id: 'std' as TabType, label: '공부 관리' },
                        { id: 'sch' as TabType, label: '스케줄 관리' }
                    ].map((tab) => (
                        <TabItem
                            key={tab.id}
                            id={tab.id}
                            label={tab.label}
                            activeTab={activeTab}
                            onClick={setActiveTab}
                            themeClasses={themeClasses}
                        />
                    ))
                }
            </div>

            {
                activeTab === 'std' ? (
                    <div className="p-4 space-y-4">
                        {/* 공부 참여 여부 */}
                        <div className="border-b-2 pb-4 mb-4">
                            <h3 className="text-lg font-bold mb-3">공부 참여 여부</h3>
                            <div className="flex items-center space-x-3 mb-4">
                                <button
                                    onClick={() => setIsParticipating(true)}
                                    className={`flex-1 px-4 py-2 rounded-md transition-colors ${isParticipating 
                                        ? `${themeClasses.primary} text-white` 
                                        : `${themeClasses.border} bg-white`}`}
                                >
                                    참여함
                                </button>
                                <button
                                    onClick={() => setIsParticipating(false)}
                                    className={`flex-1 px-4 py-2 rounded-md transition-colors ${!isParticipating 
                                        ? `${themeClasses.primary} text-white` 
                                        : `${themeClasses.border} bg-white`}`}
                                >
                                    참여안함
                                </button>
                            </div>

                            {isParticipating && (
                                <div className="space-y-3">
                                    <h4 className="text-md font-medium">공부 시간 기록</h4>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {timeSlots.map((slot) => (
                                            <div key={slot.id} className="flex items-center space-x-2">
                                                <input
                                                    type="time"
                                                    value={slot.start}
                                                    onChange={(e) => updateTimeSlot(slot.id || '', 'start', e.target.value)}
                                                    className={`px-2 py-1 rounded-md border-2 ${themeClasses.border} focus:outline-none flex-1`}
                                                />
                                                <span className="text-gray-500">~</span>
                                                <input
                                                    type="time"
                                                    value={slot.end}
                                                    onChange={(e) => updateTimeSlot(slot.id || '', 'end', e.target.value)}
                                                    className={`px-2 py-1 rounded-md border-2 ${themeClasses.border} focus:outline-none flex-1`}
                                                />
                                                <button
                                                    onClick={() => removeTimeSlot(slot.id || '')}
                                                    className="text-red-500 px-2 py-1 hover:bg-red-50 rounded-md"
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between pt-2">
                                        <button
                                            onClick={addTimeSlot}
                                            className={`px-3 py-1 rounded-md ${themeClasses.secondary} bg-opacity-30 text-sm`}
                                        >
                                            + 시간 추가
                                        </button>
                                        <button
                                            onClick={saveParticipation}
                                            className={`px-3 py-1 rounded-md ${themeClasses.primary} text-white text-sm`}
                                        >
                                            참여 상태 저장
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        {isParticipating ? (
                            <>
                                {/* 목표 달성률 표시 영역 */}
                                <div className="mb-5 border-b pb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-lg font-bold">목표 달성률</h3>
                                        <div className={`text-xl font-bold ${themeClasses.text}`}>
                                            {calculateGoalPercentage()}%
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                        <div
                                            className={`${themeClasses.primary} h-4 rounded-full transition-all duration-500 ease-out`}
                                            style={{ width: `${calculateGoalPercentage()}%` }}
                                        >
                                        </div>
                                    </div>
                                </div>

                                {/* 목표 달성 체크 영역 */}
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-lg font-bold">공부 목표 관리</h3>
                                        <button
                                            className={`px-3 py-1 rounded-md ${themeClasses.secondary} text-sm`}
                                            onClick={() => {
                                                setShowNewGoalInput(true);
                                                setNewGoal("");
                                                setEditingGoalId(null);
                                            }}
                                        >
                                            새 목표 추가
                                        </button>
                                    </div>
                                    
                                    {/* 목표 시간 설정 영역 */}
                                    <div className="mb-4 p-3 border rounded-md">
                                        <h4 className="text-sm font-medium mb-2">오늘의 목표 시간</h4>
                                        <div className="flex items-center justify-between">
                                            <TimeInput
                                                hours={dailyGoalHours}
                                                minutes={dailyGoalMinutes}
                                                setHours={setDailyGoalHours}
                                                setMinutes={setDailyGoalMinutes}
                                            />
                                            <button
                                                onClick={saveDailyGoalTime}
                                                className={`px-3 py-1 rounded-md ${themeClasses.primary} text-white text-sm`}
                                            >
                                                저장
                                            </button>
                                        </div>
                                    </div>

                                    {/* 목표 추가/수정 입력 폼 */}
                                    {(showNewGoalInput || editingGoalId) && (
                                        <div className="mb-4 p-3 border border-dashed rounded-md">
                                            <div className="mb-2">
                                                <input
                                                    type="text"
                                                    value={newGoal}
                                                    onChange={(e) => setNewGoal(e.target.value)}
                                                    placeholder="목표를 입력하세요"
                                                    className={`w-full px-3 py-2 rounded-md ${themeClasses.border} border focus:outline-none mb-2`}
                                                />
                                                <div className="flex items-center justify-end">
                                                    <div className="space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setShowNewGoalInput(false);
                                                                setEditingGoalId(null);
                                                            }}
                                                            className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 text-sm"
                                                        >
                                                            취소
                                                        </button>
                                                        <button
                                                            onClick={handleGoalAction}
                                                            className={`px-3 py-1 rounded-md ${themeClasses.primary} text-white text-sm`}
                                                        >
                                                            {editingGoalId ? "수정" : "추가"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {dateGoals.length > 0 ? (
                                            dateGoals.map((goal) => (
                                                <div
                                                    key={goal.id}
                                                    className={`p-3 rounded-md border ${themeClasses.border} flex items-center justify-between ${goal.completed ? 'bg-green-50' : ''} transition-colors`}
                                                >
                                                    <div className="flex items-center flex-1">
                                                        <input
                                                            type="checkbox"
                                                            checked={goal.completed}
                                                            onChange={() => toggleGoalStatus(goal.id, activeUserId)}
                                                            className="mr-3 h-5 w-5 accent-green-600 cursor-pointer"
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className={`font-medium ${goal.completed ? 'line-through text-gray-500' : ''}`}>
                                                                {goal.content}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-1 ml-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingGoalId(goal.id);
                                                                setNewGoal(goal.content);
                                                            }}
                                                            className="text-blue-500 px-2 py-1 hover:bg-blue-50 rounded"
                                                        >
                                                            수정
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                removeGoal(goal.id, activeUserId)
                                                                    .catch(error => {
                                                                        console.error("목표 삭제 실패:", error);
                                                                        showToast("목표 삭제에 실패했습니다.", "error");
                                                                    });
                                                            }}
                                                            className="text-red-500 px-2 py-1 hover:bg-red-50 rounded"
                                                        >
                                                            삭제
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center text-gray-500 py-5 bg-gray-50 rounded-lg">
                                                목표가 없습니다. '새 목표 추가' 버튼을 클릭하여 목표를 추가하세요!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex justify-center items-center py-10">
                                <div className="text-center text-gray-500 bg-gray-50 p-6 rounded-lg w-full">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                    </svg>
                                    <p className="text-xl font-medium mb-2">공부에 참여하지 않았습니다</p>
                                    <p>목표 설정과 시간 기록을 하려면 먼저 공부 참여 여부를 '참여함'으로 선택해주세요.</p>
                                </div>
                            </div>
                        )}

                    </div>
                ) : (
                    <div className="p-4">
                        {/* 일정 추가 영역 */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold mb-3">일정 추가</h3>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={scheduleContent}
                                    onChange={(e) => setScheduleContent(e.target.value)}
                                    placeholder="일정을 입력하세요"
                                    className={`flex-1 px-3 py-2 rounded-md ${themeClasses.border} border focus:outline-none`}
                                />
                                <button
                                    onClick={() => {
                                        if (!scheduleContent.trim()) {
                                            showToast("일정 내용을 입력해주세요.", "error");
                                            return;
                                        }

                                        if (!dateStr) return;

                                        addNewSchedule(dateStr, scheduleContent)
                                            .then(() => {
                                                setScheduleContent("");
                                                showToast("일정이 추가되었습니다.", "success");
                                            })
                                            .catch(error => {
                                                console.error("일정 추가 실패:", error);
                                                showToast("일정 추가에 실패했습니다.", "error");
                                            });
                                    }}
                                    className={`px-4 py-2 rounded-md ${themeClasses.primary} text-white`}
                                >
                                    추가
                                </button>
                            </div>
                        </div>

                        {/* 일정 리스트 */}
                        <div>
                            <h3 className="text-lg font-bold mb-3">일정 목록</h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {dateSchedules.length > 0 ? (
                                    dateSchedules.map((schedule, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 rounded-md border ${themeClasses.border} flex items-center justify-between hover:bg-gray-50 transition-colors`}
                                        >
                                            <span className="flex-1">{schedule.content}</span>
                                            <button
                                                onClick={() => {
                                                    if (!dateStr) return;
                                                    removeScheduleItem(dateStr, index)
                                                        .then(() => {
                                                            showToast("일정이 삭제되었습니다.", "success");
                                                        })
                                                        .catch(error => {
                                                            console.error("일정 삭제 실패:", error);
                                                            showToast("일정 삭제에 실패했습니다.", "error");
                                                        });
                                                }}
                                                className="text-red-500 px-3 py-1 rounded hover:bg-red-50"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
                                        일정이 없습니다. 위에서 일정을 추가해보세요!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </CommonModal>
    )
}