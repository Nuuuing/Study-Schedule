import { CommonModal } from "./CommonModal";
import { useShowDayModal } from "@/modules/stores";
import dayjs from 'dayjs';
import { useTheme } from "@/contexts";
import { useState, useEffect, useCallback, FC, ReactNode } from "react";
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

// 시간 입력 컴포넌트 Props
interface TimeInputProps {
    hours: number;
    minutes: number;
    setHours: (hours: number) => void;
    setMinutes: (minutes: number) => void;
    label?: string;
}

// 탭 아이템 컴포넌트 Props
interface ThemeClasses {
    text: string;
    card: string;
    border: string;
    primary: string;
    secondary: string;
}

interface TabItemProps {
    id: TabType;
    label: string;
    activeTab: TabType;
    onClick: (id: TabType) => void;
    themeClasses: ThemeClasses;
}

// 목표 아이템 컴포넌트 Props
interface GoalItemProps {
    goal: ExtendedGoal;
    onToggle: (id: string, userId: string) => void;
    onEdit: (id: string, content: string) => void;
    onDelete: (id: string, userId: string) => Promise<void>;
    userId: string;
    themeClasses: ThemeClasses;
}

// 시간 슬롯 컴포넌트 Props
interface TimeSlotItemProps {
    slot: TimeSlot;
    onUpdate: (id: string, field: 'start' | 'end', value: string) => void;
    onRemove: (id: string) => void;
    themeClasses: ThemeClasses;
}

// 일정 아이템 컴포넌트 Props
interface ScheduleItemComponentProps {
    schedule: ScheduleItem;
    index: number;
    onRemove: (index: number) => void;
    themeClasses: ThemeClasses;
}

// 섹션 컴포넌트 Props
interface SectionProps {
    title?: string;
    children: ReactNode;
    className?: string;
}

// 섹션 컴포넌트
const Section: FC<SectionProps> = ({ title, children, className = "" }) => (
    <div className={`mb-4 ${className}`}>
        {title && <h3 className="text-lg font-bold mb-3">{title}</h3>}
        {children}
    </div>
);

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

// 목표 아이템 컴포넌트
const GoalItem: FC<GoalItemProps> = ({ goal, onToggle, onEdit, onDelete, userId, themeClasses }) => (
    <div className={`p-3 rounded-md border ${themeClasses.border} flex items-center justify-between ${goal.completed ? 'bg-green-50' : ''} transition-colors`}>
        <div className="flex items-center flex-1">
            <input
                type="checkbox"
                checked={goal.completed}
                onChange={() => onToggle(goal.id, userId)}
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
                onClick={() => onEdit(goal.id, goal.content)}
                className="text-blue-500 px-2 py-1 hover:bg-blue-50 rounded"
            >
                수정
            </button>
            <button
                onClick={() => onDelete(goal.id, userId)}
                className="text-red-500 px-2 py-1 hover:bg-red-50 rounded"
            >
                삭제
            </button>
        </div>
    </div>
);

// 시간 슬롯 컴포넌트
const TimeSlotItem: FC<TimeSlotItemProps> = ({ slot, onUpdate, onRemove, themeClasses }) => (
    <div className="flex items-center space-x-2">
        <input
            type="time"
            value={slot.start}
            onChange={(e) => onUpdate(slot.id || '', 'start', e.target.value)}
            className={`px-2 py-1 rounded-md border-2 ${themeClasses.border} focus:outline-none flex-1`}
        />
        <span className="text-gray-500">~</span>
        <input
            type="time"
            value={slot.end}
            onChange={(e) => onUpdate(slot.id || '', 'end', e.target.value)}
            className={`px-2 py-1 rounded-md border-2 ${themeClasses.border} focus:outline-none flex-1`}
        />
        <button
            onClick={() => onRemove(slot.id || '')}
            className="text-red-500 px-2 py-1 hover:bg-red-50 rounded-md"
        >
            삭제
        </button>
    </div>
);

// 일정 아이템 컴포넌트
const ScheduleItemComponent: FC<ScheduleItemComponentProps> = ({ schedule, index, onRemove, themeClasses }) => (
    <div className={`p-3 rounded-md border ${themeClasses.border} flex items-center justify-between hover:bg-gray-50 transition-colors`}>
        <span className="flex-1">{schedule.content}</span>
        <button
            onClick={() => onRemove(index)}
            className="text-red-500 px-3 py-1 rounded hover:bg-red-50"
        >
            삭제
        </button>
    </div>
);

export const DayModal: FC<DayModalProps> = ({ selectedDay, onClose }) => {
    const showDayModal = useShowDayModal();
    const { theme } = useTheme();
    const themeClasses = theme.classes;
    const { showToast } = useToast();

    // 탭 관리
    const [activeTab, setActiveTab] = useState<TabType>('std');

    // 참여 관련 상태 (그룹화하여 관리)
    const [participationState, setParticipationState] = useState({
        isParticipating: false,
        timeSlots: [{ start: '', end: '', id: Date.now().toString() }] as TimeSlot[],
        actualStudyHours: { hours: 0, minutes: 0 }
    });

    // 참여 상태 쉽게 접근하기 위한 별칭
    const { isParticipating, timeSlots } = participationState;
    
    // 참여 상태 업데이트 함수
    const updateParticipationState = (updates: Partial<typeof participationState>) => {
        setParticipationState(prev => ({ ...prev, ...updates }));
    };

    // 목표 관련 상태 (그룹화하여 관리)
    const [goalState, setGoalState] = useState({
        newGoal: "",
        editingGoalId: null as string | null,
        showNewGoalInput: false,
        hasGoals: false,
        dailyGoalHours: 0,
        dailyGoalMinutes: 0
    });

    // 목표 상태 쉽게 접근하기 위한 별칭
    const { 
        newGoal, 
        editingGoalId, 
        showNewGoalInput, 
        hasGoals, 
        dailyGoalHours, 
        dailyGoalMinutes 
    } = goalState;
    
    // 목표 상태 업데이트 함수 - 최적화된 버전
    const updateGoalState = useCallback((updates: Partial<typeof goalState>) => {
        setGoalState(prev => {
            // 이전 상태와 업데이트가 다른 경우에만 상태 업데이트
            const shouldUpdate = Object.entries(updates).some(
                ([key, value]) => prev[key as keyof typeof prev] !== value
            );
            
            if (shouldUpdate) {
                return { ...prev, ...updates };
            }
            return prev;
        });
    }, []);

    // 일정 입력 관련 상태
    const [scheduleContent, setScheduleContent] = useState("");

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
            const newTimeSlots = userParticipation.timeSlots && userParticipation.timeSlots.length > 0 
                ? userParticipation.timeSlots 
                : [{ start: '', end: '', id: Date.now().toString() }];
            
            let actualHours = { hours: 0, minutes: 0 };
            
            // 실제 공부 시간 계산
            if (userParticipation.timeSlots && userParticipation.timeSlots.length > 0) {
                const totalMinutes = calculateTotalStudyTime(userParticipation.timeSlots);
                actualHours = {
                    hours: Math.floor(totalMinutes / 60),
                    minutes: totalMinutes % 60
                };
            }
            
            updateParticipationState({
                isParticipating: userParticipation.present || false,
                timeSlots: newTimeSlots,
                actualStudyHours: actualHours
            });
        } else if (dateStr) {
            // 참여 정보가 없는 경우 초기화
            updateParticipationState({
                isParticipating: false,
                timeSlots: [{ start: '', end: '', id: Date.now().toString() }],
                actualStudyHours: { hours: 0, minutes: 0 }
            });
        }
    }, [dateStr, userParticipation]);
    
    // 목표가 있는지 확인하는 useEffect
    useEffect(() => {
        // 이전 hasGoals 상태와 현재 dateGoals 길이 비교해서 변경되었을 때만 업데이트
        const currentHasGoals = dateGoals && dateGoals.length > 0;
        if (goalState.hasGoals !== currentHasGoals) {
            updateGoalState({
                hasGoals: currentHasGoals
            });
        }
    }, [dateGoals, goalState.hasGoals]);
    
    // 모달이 열릴 때 상태 초기화 - selectedDay가 변경될 때만 실행
    useEffect(() => {
        if (!selectedDay) return;
        
        // 일정 관련 입력 필드 초기화
        setScheduleContent("");
        
        // 목표 관련 입력 필드 초기화 - 초기화가 필요한 경우에만
        if (goalState.newGoal || goalState.editingGoalId || goalState.showNewGoalInput) {
            updateGoalState({
                newGoal: "",
                editingGoalId: null,
                showNewGoalInput: false,
                dailyGoalHours: 0,
                dailyGoalMinutes: 0
            });
        }
        
        // 다른 상태값들은 참여 정보 확인 useEffect에서 처리
    }, [selectedDay, goalState.newGoal, goalState.editingGoalId, goalState.showNewGoalInput]);

    // 시간 슬롯 추가
    const addTimeSlot = () => {
        updateParticipationState({
            timeSlots: [...timeSlots, { start: '', end: '', id: Date.now().toString() }]
        });
    };

    // 시간 슬롯 삭제
    const removeTimeSlot = (id: string) => {
        if (timeSlots.length <= 1) {
            showToast("최소 하나의 시간 슬롯이 필요합니다.", "error");
            return;
        }
        updateParticipationState({
            timeSlots: timeSlots.filter(slot => slot.id !== id)
        });
    };

    // 시간 슬롯 업데이트
    const updateTimeSlot = (id: string, field: 'start' | 'end', value: string) => {
        updateParticipationState({
            timeSlots: timeSlots.map(slot =>
                slot.id === id ? { ...slot, [field]: value } : slot
            )
        });
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
    
    // 시간 슬롯 유효성 검사 함수
    const validateTimeSlots = (slots: TimeSlot[]): { isValid: boolean, validSlots: TimeSlot[], message?: string } => {
        // 빈 시간 슬롯 필터링
        const validTimeSlots = slots.filter(slot => slot.start && slot.end);
        
        if (validTimeSlots.length === 0) {
            return { 
                isValid: false, 
                validSlots: [], 
                message: "최소 하나의 유효한 시간 슬롯이 필요합니다." 
            };
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
            return {
                isValid: false,
                validSlots: validTimeSlots,
                message: "종료 시간은 시작 시간보다 늦어야 합니다."
            };
        }
        
        return { isValid: true, validSlots: validTimeSlots };
    };

    // 모든 정보를 한 번에 저장하는 함수
    const saveAllData = async () => {
        if (!dateStr) {
            showToast("날짜 정보가 없습니다.", "error");
            return;
        }
        
        try {
            // 1. 참여 정보 저장 로직 검증
            if (isParticipating) {
                const validation = validateTimeSlots(timeSlots);
                
                if (!validation.isValid) {
                    showToast(validation.message || "시간 슬롯 형식이 올바르지 않습니다.", "error");
                    return;
                }
                
                const validTimeSlots = validation.validSlots;
                
                // 2. 실제 공부 시간 계산
                const totalStudyMinutes = calculateTotalStudyTime(timeSlots);
                const hours = Math.floor(totalStudyMinutes / 60);
                const minutes = totalStudyMinutes % 60;
                
                console.log('저장할 데이터:', {
                    참여여부: isParticipating,
                    공부시간: { hours, minutes },
                    타임슬롯: validTimeSlots,
                    목표시간: { hours: dailyGoalHours, minutes: dailyGoalMinutes },
                    목표목록: dateGoals
                });
                
                // TODO: 실제 데이터 저장 구현
                // await setStudyHoursForDate(dateStr, activeUserId, hours, minutes);
                
                // 3. 참여 정보 저장
                // await setParticipateDetail(dateStr, activeUserId, {
                //     present: isParticipating,
                //     timeSlots: isParticipating ? validTimeSlots : undefined
                // });
                
                // 4. 목표 시간 저장
                // TODO: 목표 시간 저장 로직 구현
            }
            
            // 5. 일정 저장
            // TODO: 일정 저장 로직 구현
            
            showToast("모든 정보가 저장되었습니다.", "success");
            onClose(); // 저장 후 모달 닫기
        } catch (error) {
            console.error("데이터 저장 실패:", error);
            showToast("데이터 저장에 실패했습니다.", "error");
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
                
                // 편집 모드 종료 및 입력 필드 초기화
                updateGoalState({
                    showNewGoalInput: false,
                    editingGoalId: null,
                    newGoal: ""
                });
            } else {
                // 새 목표 추가
                addNewGoal(goalData);
                showToast("새 목표가 추가되었습니다.", "success");
                
                // 목표 추가 후에도 폼은 유지하고 입력 필드만 초기화
                // 사용자가 여러 목표를 연속해서 추가할 수 있도록 함
                updateGoalState({
                    hasGoals: true,  // 목표 있음으로 설정
                    newGoal: ""      // 입력 필드 초기화
                    // showNewGoalInput은 true 유지 (폼 계속 표시)
                });
            }
        } catch (error) {
            console.error("목표 저장 실패:", error);
            showToast("목표 저장에 실패했습니다.", "error");
        }
    };
    
    // 목표 수정 시작 함수
    const startEditGoal = (id: string, content: string) => {
        updateGoalState({
            editingGoalId: id,
            newGoal: content
        });
    };
    
    // 일정 추가 함수
    const addSchedule = () => {
        if (!scheduleContent.trim()) {
            showToast("일정 내용을 입력해주세요.", "error");
            return;
        }

        if (!dateStr) return;
        
        addNewSchedule(dateStr, scheduleContent);
        setScheduleContent("");
    };

    // 공부 탭 렌더링 컴포넌트
    const renderStudyTab = () => (
        <div className="p-4 space-y-4">
            {/* 공부 참여 여부 */}
            <Section>
                {!isParticipating ? (
                    <div className="flex justify-center items-center mt-6">
                        <button
                            onClick={() => updateParticipationState({ isParticipating: true })}
                            className={`cursor-pointer px-6 py-3 rounded-md transition-colors ${themeClasses.primary} text-white font-bold`}
                        >
                            공부 참여하기
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <h4 className="text-md font-medium">공부 시간 기록</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {timeSlots.map((slot) => (
                                <TimeSlotItem 
                                    key={slot.id} 
                                    slot={slot} 
                                    onUpdate={updateTimeSlot} 
                                    onRemove={removeTimeSlot} 
                                    themeClasses={themeClasses} 
                                />
                            ))}
                        </div>
                        <div className="flex justify-start pt-2">
                            <button
                                onClick={addTimeSlot}
                                className={`px-3 py-1 rounded-md ${themeClasses.secondary} bg-opacity-30 text-sm`}
                            >
                                + 시간 추가
                            </button>
                        </div>
                    </div>
                )}
            </Section>

            {isParticipating ? (
                <>
                    {/* 목표 추가 영역 - 목표가 없을 경우 중앙에 크게 표시 */}
                    {!hasGoals && (
                        <div className="pt-4 flex justify-center">
                            <button
                                onClick={() => {
                                    // 목표 추가하기 버튼을 클릭하면 상태를 초기화하고 입력 폼 표시
                                    updateGoalState({
                                        hasGoals: true,
                                        showNewGoalInput: true,
                                        newGoal: "",
                                        editingGoalId: null
                                    });
                                }}
                                className={`cursor-pointer px-4 py-2 rounded-md transition-colors ${themeClasses.primary} text-white font-bold`}
                            >
                                목표 추가하기
                            </button>
                        </div>
                    )}

                    {/* 목표가 있을 경우 표시되는 영역 */}
                    {hasGoals && !showNewGoalInput && (
                        <>
                            {/* 목표 달성률 표시 영역 */}
                            <Section className="border-b pb-4">
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
                            </Section>

                            {/* 목표 추가 버튼 */}
                            <Section>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-lg font-bold">공부 목표 관리</h3>
                                    <button
                                        className={`px-3 py-1 rounded-md ${themeClasses.primary} text-sm font-medium`}
                                        onClick={() => {
                                            updateGoalState({
                                                showNewGoalInput: true,
                                                newGoal: "",
                                                editingGoalId: null
                                            });
                                        }}
                                    >
                                        목표 추가하기
                                    </button>
                                </div>
                            </Section>
                            
                            {/* 목표 시간 설정 영역 */}
                            <Section>
                                <div className="p-3 border rounded-md">
                                    <h4 className="text-sm font-medium mb-2">오늘의 목표 시간</h4>
                                    <div className="flex items-center">
                                        <TimeInput
                                            hours={dailyGoalHours}
                                            minutes={dailyGoalMinutes}
                                            setHours={(hours) => updateGoalState({ dailyGoalHours: hours })}
                                            setMinutes={(minutes) => updateGoalState({ dailyGoalMinutes: minutes })}
                                        />
                                    </div>
                                </div>
                            </Section>
                        </>
                    )}

                    {/* 목표 추가/수정 입력 폼 */}
                    {(showNewGoalInput || editingGoalId) && (
                        <Section>
                            <div className={`p-4 border ${themeClasses.border} rounded-lg shadow-sm`}>
                                <h3 className="text-md font-bold mb-3">
                                    {editingGoalId ? "목표 수정하기" : "새로운 목표 추가하기"}
                                </h3>
                                
                                {/* 목표 시간 입력 부분 - 항상 표시 */}
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium mb-2">오늘의 목표 시간</h4>
                                    <div className="flex items-center">
                                        <TimeInput
                                            hours={dailyGoalHours}
                                            minutes={dailyGoalMinutes}
                                            setHours={(hours) => updateGoalState({ dailyGoalHours: hours })}
                                            setMinutes={(minutes) => updateGoalState({ dailyGoalMinutes: minutes })}
                                        />
                                    </div>
                                </div>

                                {/* 목표 체크리스트 입력 부분 */}
                                <div className="mb-3">
                                    <h4 className="text-sm font-medium mb-2">목표 내용</h4>
                                    <input
                                        type="text"
                                        value={newGoal}
                                        onChange={(e) => updateGoalState({ newGoal: e.target.value })}
                                        placeholder="목표를 입력하세요"
                                        className={`w-full px-3 py-2 rounded-md border ${themeClasses.border} focus:outline-none focus:ring-2 ring-opacity-50 focus:${themeClasses.primary}`}
                                    />
                                </div>

                                {/* 버튼 영역 */}
                                <div className="flex items-center justify-end">
                                    <div className="space-x-2">
                                        <button
                                            onClick={() => {
                                                updateGoalState({
                                                    showNewGoalInput: false,
                                                    editingGoalId: null
                                                });
                                            }}
                                            className="px-3 py-1.5 rounded-md bg-gray-200 text-gray-700 text-sm font-medium"
                                        >
                                            취소
                                        </button>
                                        <button
                                            onClick={handleGoalAction}
                                            className={`px-3 py-1.5 rounded-md ${themeClasses.primary} text-white text-sm font-medium`}
                                        >
                                            {editingGoalId ? "수정 완료" : "목표 추가"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Section>
                    )}
                    
                    {/* 목표 목록 */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {dateGoals.length > 0 ? (
                            dateGoals.map((goal) => (
                                <GoalItem 
                                    key={goal.id} 
                                    goal={goal} 
                                    onToggle={toggleGoalStatus}
                                    onEdit={startEditGoal}
                                    onDelete={removeGoal}
                                    userId={activeUserId}
                                    themeClasses={themeClasses}
                                />
                            ))
                        ) : (
                            hasGoals && (
                                <div className="text-center text-gray-500 py-4">
                                    등록된 목표가 없습니다.
                                </div>
                            )
                        )}
                    </div>
                </>
            ) : (
                <div className="flex justify-center items-center py-10">
                    <div className="text-center text-gray-500 bg-gray-50 p-6 rounded-lg w-full">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        <p className="text-xl font-medium mb-2">공부에 참여하지 않았습니다</p>
                        <p>목표 설정과 시간 기록을 하려면 먼저 공부에 참여해주세요.</p>
                    </div>
                </div>
            )}
        </div>
    );

    // 일정 탭 렌더링 컴포넌트
    const renderScheduleTab = () => (
        <div className="p-4">
            {/* 일정 추가 영역 */}
            <Section title="일정 추가" className="mb-6">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={scheduleContent}
                        onChange={(e) => setScheduleContent(e.target.value)}
                        placeholder="일정을 입력하세요"
                        className={`flex-1 px-3 py-2 rounded-md ${themeClasses.border} border focus:outline-none`}
                    />
                    <button
                        onClick={addSchedule}
                        className={`px-4 py-2 rounded-md ${themeClasses.primary} text-white`}
                    >
                        추가
                    </button>
                </div>
            </Section>

            {/* 일정 리스트 */}
            <Section title="일정 목록">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {dateSchedules.length > 0 ? (
                        dateSchedules.map((schedule, index) => (
                            <ScheduleItemComponent 
                                key={index}
                                schedule={schedule} 
                                index={index} 
                                onRemove={(index) => {
                                    if (!dateStr) return;
                                    removeScheduleItem(dateStr, index);
                                }} 
                                themeClasses={themeClasses} 
                            />
                        ))
                    ) : (
                        <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
                            일정이 없습니다. 위에서 일정을 추가해보세요!
                        </div>
                    )}
                </div>
            </Section>
        </div>
    );

    return (
        <CommonModal
            isOpen={showDayModal}
            onClose={onClose}
            title={selectedDay ? dayjs(selectedDay).format('YYYY년 MM월 DD일') : '-'}
            animation="scale"
            width="w-[520px]"
            showCancelButton={true}
            cancelText="닫기"
            showConfirmButton={true}
            confirmText="저장"
            onConfirm={saveAllData}
        >
            <div className="flex flex-row items-center justify-center">
                {[
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
                ))}
            </div>

            {activeTab === 'std' ? renderStudyTab() : renderScheduleTab()}
        </CommonModal>
    );
}