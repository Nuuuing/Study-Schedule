import React from 'react';
import { TimePicker } from '../Button';
import { NameTag } from '../Common';
import { UserDataT, TimeSlot } from '@/modules/types';
import { useToast } from '@/contexts/ToastContext';
import dayjs from 'dayjs';

type ParticipateDetail = {
    present?: boolean;
    timeSlots?: TimeSlot[];
};

type ScheduleItem = {
    content: string;
    createdAt: number;
};

type ParticipateModalProps = {
    userList: UserDataT[];
    open: boolean;
    date: Date | null;
    initialParticipateInput: Record<string, ParticipateDetail>;
    setParticipateDetail: (dateKey: string, userId: string, detail: { present: boolean; timeSlots?: TimeSlot[]; }) => Promise<void>;
    removeParticipateForDate: (userId: string, dateKey: string) => Promise<void>;
    onClose: () => void;
    onParticipateUpdate?: (dateKey: string, updatedData: Record<string, ParticipateDetail>) => void; // 즉시 UI 업데이트용
};

export const ParticipateModal = (props: ParticipateModalProps) => {
    const { open, date, userList, initialParticipateInput, setParticipateDetail, removeParticipateForDate, onClose, onParticipateUpdate } = props;

    const { showToast } = useToast();

    const [tab, setTab] = React.useState<'participate' | 'schedule'>('participate');
    const [scheduleInput, setScheduleInput] = React.useState('');
    const [editIdx, setEditIdx] = React.useState<number | null>(null);
    const [editValue, setEditValue] = React.useState('');
    const [schedules, setSchedules] = React.useState<Record<string, ScheduleItem[]>>({});
    
    // useFirebaseState의 함수들을 로컬 함수로 대체
    const addSchedule = async (dateKey: string, content: string) => {
        if (!content.trim()) return;
        
        try {
            const newSchedule: ScheduleItem = {
                content,
                createdAt: Date.now()
            };
            
            const updatedSchedules = { ...schedules };
            if (!updatedSchedules[dateKey]) {
                updatedSchedules[dateKey] = [];
            }
            updatedSchedules[dateKey] = [...updatedSchedules[dateKey], newSchedule];
            
            setSchedules(updatedSchedules);
            return true;
        } catch (error) {
            console.error("스케줄 추가 오류:", error);
            return false;
        }
    };
    
    const removeSchedule = async (dateKey: string, index: number) => {
        try {
            const updatedSchedules = { ...schedules };
            if (updatedSchedules[dateKey] && updatedSchedules[dateKey].length > index) {
                updatedSchedules[dateKey] = updatedSchedules[dateKey].filter((_, i) => i !== index);
                if (updatedSchedules[dateKey].length === 0) {
                    delete updatedSchedules[dateKey];
                }
                setSchedules(updatedSchedules);
                return true;
            }
            return false;
        } catch (error) {
            console.error("스케줄 제거 오류:", error);
            return false;
        }
    };
    
    const updateSchedule = async (dateKey: string, index: number, newContent: string) => {
        if (!newContent.trim()) return false;
        
        try {
            const updatedSchedules = { ...schedules };
            if (updatedSchedules[dateKey] && updatedSchedules[dateKey].length > index) {
                updatedSchedules[dateKey][index] = {
                    ...updatedSchedules[dateKey][index],
                    content: newContent
                };
                setSchedules(updatedSchedules);
                return true;
            }
            return false;
        } catch (error) {
            console.error("스케줄 업데이트 오류:", error);
            return false;
        }
    };
    const [selectedUserId, setSelectedUserId] = React.useState('');
    const [participateInput, setParticipateInput] = React.useState<Record<string, ParticipateDetail>>(initialParticipateInput);

    // 확인 대화상자 상태
    const [confirmDialog, setConfirmDialog] = React.useState<{
        type: 'user' | 'timeSlot' | 'schedule';
        userId?: string;
        slotId?: string;
        scheduleIdx?: number;
        userName?: string;
        scheduleContent?: string;
    } | null>(null);

    // 모달이 열리거나 날짜가 변경되면 상태 초기화
    React.useEffect(() => {
        if (open) {
            setParticipateInput(initialParticipateInput);
            setTab('participate');
            setEditIdx(null);
            setEditValue('');
            setScheduleInput('');
            setSelectedUserId('');
            setConfirmDialog(null);

            // 모달이 열리면 배경 스크롤 방지
            document.body.style.overflow = 'hidden';
        } else {
            // 모달이 닫히면 스크롤 다시 활성화
            document.body.style.overflow = '';
        }

        // 컴포넌트 언마운트 시 스크롤 복원
        return () => {
            document.body.style.overflow = '';
        };
    }, [open, date, initialParticipateInput]);

    // 시간 유효성 검증 함수
    const validateTimeSlot = (start: string, end: string): boolean => {
        if (!start || !end) return true; // 빈 값은 유효함

        // 시간을 24시간 형식으로 변환하여 비교
        const parseTimeToMinutes = (timeStr: string): number => {
            const [time, period] = timeStr.split(' ');
            const [hour, minute] = time.split(':').map(Number);

            let hours24 = hour;
            if (period === 'PM' && hour !== 12) hours24 += 12;
            if (period === 'AM' && hour === 12) hours24 = 0;

            return hours24 * 60 + minute;
        };

        return parseTimeToMinutes(start) < parseTimeToMinutes(end);
    };

    // 실시간 저장 함수
    const saveUserData = async (userId: string, detail: ParticipateDetail) => {
        if (!date) return;

        const dateKey = dayjs(date).format('YYYY-MM-DD');

        try {
            // 즉시 UI 업데이트
            if (onParticipateUpdate) {
                const updatedData = { ...participateInput, [userId]: detail };
                onParticipateUpdate(dateKey, updatedData);
            }

            // Firebase에 저장
            const participateDetail = {
                present: detail.present ?? false,
                timeSlots: detail.timeSlots || []
            };
            await setParticipateDetail(dateKey, userId, participateDetail);
        } catch {
            showToast('저장 중 오류가 발생했습니다.', 'error');
        }
    };

    // 참여자 추가 함수
    const handleAddUser = async (id: string) => {
        const newDetail = {
            present: false,
            timeSlots: [{ start: '', end: '', id: Date.now().toString() }]
        };

        setParticipateInput(prev => ({
            ...prev,
            [id]: newDetail
        }));

        // 즉시 저장
        await saveUserData(id, newDetail);
        showToast('참가자가 추가되었습니다.', 'success');
    };

    // 참석 여부 토글 함수
    const handleTogglePresent = async (id: string) => {
        const currentDetail = participateInput[id];
        const updatedDetail = { ...currentDetail, present: !currentDetail?.present };

        setParticipateInput(prev => ({
            ...prev,
            [id]: updatedDetail
        }));

        // 즉시 저장
        await saveUserData(id, updatedDetail);
    };

    // 시간대 추가 함수
    const handleAddTimeSlot = async (userId: string) => {
        const userDetail = participateInput[userId];
        const timeSlots = userDetail?.timeSlots || [];

        const newSlot: TimeSlot = {
            start: '',
            end: '',
            id: Date.now().toString()
        };

        const updatedDetail = {
            ...userDetail,
            timeSlots: [...timeSlots, newSlot]
        };

        setParticipateInput(prev => ({
            ...prev,
            [userId]: updatedDetail
        }));

        // 즉시 저장
        await saveUserData(userId, updatedDetail);
    };

    // 현재 시간을 기본값으로 가져오는 함수
    const getCurrentTimeDefault = () => {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';

        if (hours === 0) hours = 12;
        else if (hours > 12) hours -= 12;

        return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    // 시간대별 시간 변경 함수
    const handleTimeSlotChange = async (userId: string, slotId: string, field: 'start' | 'end', value: string) => {
        const userDetail = participateInput[userId];
        const timeSlots = userDetail?.timeSlots || [];

        const updatedSlots = timeSlots.map(slot => {
            if (slot.id === slotId) {
                const updatedSlot = { ...slot, [field]: value };

                // 시간 검증 로직
                if (field === 'end' && slot.start && value) {
                    // 시작시간과 종료시간이 같은지 확인
                    if (slot.start === value) {
                        showToast(`시작 시간과 종료 시간이 같습니다. 다른 시간으로 설정해주세요.`, 'warning');
                        return slot; // 변경하지 않고 원래 slot 반환
                    }

                    // end 시간이 start보다 빠른지 확인
                    if (!validateTimeSlot(slot.start, value)) {
                        showToast(`종료 시간이 시작 시간보다 이르거나 같습니다. 올바른 시간을 설정해주세요.`, 'warning');
                        return slot; // 변경하지 않고 원래 slot 반환
                    }
                }

                // start 시간 변경 시에도 기존 end 시간과 비교
                if (field === 'start' && slot.end && value) {
                    // 시작시간과 종료시간이 같은지 확인
                    if (value === slot.end) {
                        showToast(`시작 시간과 종료 시간이 같습니다. 다른 시간으로 설정해주세요.`, 'warning');
                        return slot; // 변경하지 않고 원래 slot 반환
                    }

                    // start 시간이 end보다 늦은지 확인
                    if (!validateTimeSlot(value, slot.end)) {
                        showToast(`시작 시간이 종료 시간보다 늦거나 같습니다. 올바른 시간을 설정해주세요.`, 'warning');
                        return slot; // 변경하지 않고 원래 slot 반환
                    }
                }

                return updatedSlot;
            }
            return slot;
        });

        const updatedDetail = {
            ...userDetail,
            timeSlots: updatedSlots
        };

        setParticipateInput(prev => ({
            ...prev,
            [userId]: updatedDetail
        }));

        // 즉시 저장
        await saveUserData(userId, updatedDetail);
    };

    // 시간대 삭제 함수
    const handleRemoveTimeSlot = async (userId: string, slotId: string) => {
        const userDetail = participateInput[userId];
        const timeSlots = userDetail?.timeSlots || [];
        const filteredSlots = timeSlots.filter(slot => slot.id !== slotId);

        const updatedDetail = {
            ...userDetail,
            timeSlots: filteredSlots
        };

        setParticipateInput(prev => ({
            ...prev,
            [userId]: updatedDetail
        }));

        // 즉시 저장
        await saveUserData(userId, updatedDetail);
        setConfirmDialog(null);
    };

    // 시간대 삭제 확인
    const confirmRemoveTimeSlot = (userId: string, slotId: string) => {
        const user = userList.find(u => u.id === userId);
        setConfirmDialog({
            type: 'timeSlot',
            userId,
            slotId,
            userName: user?.name || '사용자'
        });
    };

    // 참여자 삭제 함수
    const handleRemoveUser = async (id: string) => {
        if (!date) return;

        const dateKey = dayjs(date).format('YYYY-MM-DD');

        try {
            // 로컬 상태에서 제거
            const updatedInput = { ...participateInput };
            delete updatedInput[id];
            setParticipateInput(updatedInput);

            // 즉시 UI 업데이트
            if (onParticipateUpdate) {
                onParticipateUpdate(dateKey, updatedInput);
            }

            // Firebase에서 제거
            await removeParticipateForDate(id, dateKey);
            showToast('참가자가 삭제되었습니다.', 'success');
            setConfirmDialog(null);
        } catch {
            showToast('삭제 중 오류가 발생했습니다.', 'error');
        }
    };

    // 참여자 삭제 확인
    const confirmRemoveUser = (id: string) => {
        const user = userList.find(u => u.id === id);
        setConfirmDialog({
            type: 'user',
            userId: id,
            userName: user?.name || '사용자'
        });
    };

    if (!open || !date) return null;
    const dateKey = date instanceof Date ? dayjs(date).format('YYYY-MM-DD') : '';

    // 스케줄 관련 함수들
    const handleAddSchedule = async (dateKey: string, content: string) => {
        try {
            await addSchedule(dateKey, content);
            showToast('스케줄이 추가되었습니다.', 'success');
        } catch {
            showToast('스케줄 추가 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleRemoveSchedule = async (dateKey: string, idx: number) => {
        try {
            await removeSchedule(dateKey, idx);
            showToast('스케줄이 삭제되었습니다.', 'success');
            setConfirmDialog(null);
        } catch {
            showToast('스케줄 삭제 중 오류가 발생했습니다.', 'error');
        }
    };

    // 스케줄 삭제 확인
    const confirmRemoveSchedule = (dateKey: string, idx: number, scheduleContent: string) => {
        setConfirmDialog({
            type: 'schedule',
            scheduleIdx: idx,
            scheduleContent
        });
    };

    const handleUpdateSchedule = async (dateKey: string, idx: number, newContent: string) => {
        try {
            await updateSchedule(dateKey, idx, newContent);
            setEditIdx(null); // 수정 완료 후 편집 상태 해제
            setEditValue(''); // 편집 값 초기화
            showToast('스케줄이 수정되었습니다.', 'success');
        } catch {
            showToast('스케줄 수정 중 오류가 발생했습니다.', 'error');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-[30rem] sm:max-w-2xl h-[90vh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-3 sm:px-6 py-2 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
                            📅 {date && date instanceof Date ? dayjs(date).format('YYYY년 M월 D일') : ''}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 탭 */}
                <div className="px-3 sm:px-6 pt-2 sm:pt-4">
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                            className={`flex-1 py-2 px-2 sm:px-4 rounded-md font-medium transition-all duration-200 cursor-pointer text-xs sm:text-base ${tab === 'participate'
                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            onClick={() => setTab('participate')}
                        >
                            👥 참석자 관리
                        </button>
                        <button
                            className={`flex-1 py-2 px-2 sm:px-4 rounded-md font-medium transition-all duration-200 cursor-pointer text-xs sm:text-base ${tab === 'schedule'
                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            onClick={() => setTab('schedule')}
                        >
                            📋 스케줄 관리
                        </button>
                    </div>
                </div>

                <div className="flex-1 px-3 sm:px-6 py-2 sm:py-4 overflow-y-auto custom-scrollbar">
                    {tab === 'participate' ? (
                        <div className="space-y-2 sm:space-y-6">
                            {/* 참가자 추가 */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-3">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">➕ 참가자 추가</h3>
                                <div className="flex items-center gap-2">
                                    <select
                                        className="flex-1 p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0 outline-none transition-all text-sm"
                                        value={selectedUserId}
                                        onChange={e => setSelectedUserId(e.target.value)}
                                    >
                                        <option value="">참가자를 선택하세요</option>
                                        {userList
                                            .filter(p => !participateInput[p.id])
                                            .sort((a, b) => a.name.localeCompare(b.name))
                                            .map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                    </select>
                                    <button
                                        className="px-3 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 text-sm cursor-pointer"
                                        disabled={!selectedUserId}
                                        onClick={() => {
                                            if (selectedUserId) {
                                                handleAddUser(selectedUserId);
                                                setSelectedUserId('');
                                            }
                                        }}
                                    >
                                        추가
                                    </button>
                                </div>
                            </div>

                            {/* 참가자 목록 */}
                            {Object.keys(participateInput).length > 0 ? (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                        👥 참가자 목록
                                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full">
                                            {Object.keys(participateInput).length}명
                                        </span>
                                    </h3>
                                    {Object.entries(participateInput)
                                        .sort(([pidA, detailA], [pidB, detailB]) => {
                                            if (detailA.present !== detailB.present) {
                                                return detailB.present ? 1 : -1;
                                            }
                                            const userA = userList.find(u => u.id === pidA);
                                            const userB = userList.find(u => u.id === pidB);
                                            return (userA?.name || '').localeCompare(userB?.name || '');
                                        })
                                        .map(([pid, detail]) => {
                                            const p = userList.find(u => u.id === pid);
                                            if (!p) return null;
                                            return (
                                                <div
                                                    key={pid}
                                                    className={`p-2 rounded-lg border transition-all duration-200 ${detail.present
                                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                                                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                                                        }`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center justify-between pr-[6px]">
                                                            <NameTag
                                                                name={p.name}
                                                                color={p.color}
                                                                present={detail.present}
                                                            />
                                                            <button
                                                                className={`w-5 h-5 rounded-full font-bold text-xs transition-all duration-200 ml-1 flex-shrink-0 cursor-pointer ${detail.present
                                                                    ? 'bg-green-500 hover:bg-green-600 text-white'
                                                                    : 'bg-red-500 hover:bg-red-600 text-white'
                                                                    }`}
                                                                onClick={() => handleTogglePresent(pid)}
                                                                title={detail.present ? '미참석으로 변경' : '참석으로 변경'}
                                                            >
                                                                {detail.present ? '✓' : '✗'}
                                                            </button>
                                                        </div>

                                                        {detail.present && (
                                                            <div className="flex flex-col gap-1 mt-2 mr-[2px]">
                                                                {(detail.timeSlots || []).length > 0 ? (
                                                                    (detail.timeSlots || []).map((slot, index) => (
                                                                        <div key={slot.id || index} className="flex gap-1 items-center">
                                                                            <TimePicker
                                                                                value={slot.start || ''}
                                                                                onChange={(val: string) => handleTimeSlotChange(pid, slot.id || index.toString(), 'start', val)}
                                                                                defaultTime={!slot.start ? getCurrentTimeDefault() : undefined}
                                                                                placeholder="시작"
                                                                            />
                                                                            <span className="text-gray-400 text-xs">~</span>
                                                                            <TimePicker
                                                                                value={slot.end || ''}
                                                                                onChange={(val: string) => {
                                                                                    if (!slot.start) {
                                                                                        showToast('시작 시간을 먼저 추가해주세요.', 'warning');
                                                                                        return;
                                                                                    }
                                                                                    handleTimeSlotChange(pid, slot.id || index.toString(), 'end', val);
                                                                                }}
                                                                                defaultTime={participateInput[pid]?.timeSlots?.find(s => s.id === (slot.id || index.toString()))?.start || undefined}
                                                                                placeholder="종료"
                                                                                disabled={!slot.start}
                                                                            />

                                                                            <button
                                                                                className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900 transition-colors flex items-center justify-center cursor-pointer"
                                                                                onClick={() => confirmRemoveTimeSlot(pid, slot.id || index.toString())}
                                                                                title="시간대 삭제"
                                                                            >
                                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm text-gray-500 dark:text-gray-400">시간대가 없습니다.</span>
                                                                    </div>
                                                                )}

                                                                {/* 시간대 추가 버튼 - 참석자인 경우 항상 표시 */}
                                                                <button
                                                                    className="self-start p-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors cursor-pointer"
                                                                    onClick={() => handleAddTimeSlot(pid)}
                                                                    title="시간대 추가"
                                                                >
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        )}

                                                        <button
                                                            className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900 transition-colors cursor-pointer flex items-center justify-center"
                                                            onClick={() => confirmRemoveUser(pid)}
                                                            title="참가자 삭제"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>


                                                    </div>


                                                </div>
                                            );
                                        })}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">👤</div>
                                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">아직 참가자가 없습니다</h3>
                                    <p className="text-gray-500 dark:text-gray-500">위에서 참가자를 선택하고 추가해보세요</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-6">
                            {/* 스케줄 */}
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                <h3 className="text-sm sm:text-lg font-medium sm:font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">📋 스케줄 추가</h3>
                                <div className="flex gap-2 sm:gap-3">
                                    <input
                                        className="flex-1 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 sm:border-2 text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:ring-0 outline-none transition-all duration-200 text-sm sm:text-base"
                                        placeholder="스케줄 내용을 입력하세요"
                                        value={scheduleInput}
                                        onChange={e => setScheduleInput(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && scheduleInput.trim() && dateKey) {
                                                handleAddSchedule(dateKey, scheduleInput.trim());
                                                setScheduleInput('');
                                            }
                                        }}
                                    />
                                    <button
                                        className="px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium sm:font-semibold hover:from-purple-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer text-sm sm:text-base"
                                        disabled={!scheduleInput.trim()}
                                        onClick={() => {
                                            if (scheduleInput.trim() && dateKey) {
                                                handleAddSchedule(dateKey, scheduleInput.trim());
                                                setScheduleInput('');
                                            }
                                        }}
                                    >
                                        추가
                                    </button>
                                </div>
                            </div>

                            {/* Schedule List */}
                            {schedules[dateKey] && schedules[dateKey].length > 0 ? (
                                <div className="space-y-2 sm:space-y-3">
                                    <h3 className="text-sm sm:text-lg font-medium sm:font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        📅 등록된 스케줄
                                        <span className="text-xs sm:text-sm bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-full">
                                            {schedules[dateKey].length}개
                                        </span>
                                    </h3>
                                    {schedules[dateKey].map((item: ScheduleItem, idx: number) => (
                                        <div key={idx} className="p-2 sm:p-4 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 sm:border-2 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200">
                                            {editIdx === idx ? (
                                                <div className="flex gap-2 sm:gap-3">
                                                    <input
                                                        className="flex-1 p-2 rounded-lg border border-purple-300 dark:border-purple-600 sm:border-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-0 outline-none text-sm sm:text-base"
                                                        value={editValue}
                                                        onChange={e => setEditValue(e.target.value)}
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter' && editValue.trim()) {
                                                                handleUpdateSchedule(dateKey, idx, editValue.trim());
                                                                setEditIdx(null);
                                                            }
                                                        }}
                                                        autoFocus
                                                    />
                                                    <button
                                                        className="px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors text-sm sm:text-base"
                                                        onClick={() => {
                                                            if (editValue.trim()) {
                                                                handleUpdateSchedule(dateKey, idx, editValue.trim());
                                                                setEditIdx(null);
                                                            }
                                                        }}
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        className="px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-colors text-sm sm:text-base"
                                                        onClick={() => setEditIdx(null)}
                                                    >
                                                        ✗
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <span className="flex-1 text-gray-900 dark:text-white font-medium text-sm sm:text-base">{item.content}</span>
                                                    <div className="flex gap-1 sm:gap-2">
                                                        <button
                                                            className="w-6 h-6 sm:w-8 sm:h-8 sm:p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors flex items-center justify-center"
                                                            onClick={() => {
                                                                setEditIdx(idx);
                                                                setEditValue(item.content);
                                                            }}
                                                            title="수정"
                                                        >
                                                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900 transition-colors flex items-center justify-center"
                                                            onClick={() => confirmRemoveSchedule(dateKey, idx, item.content)}
                                                            title="삭제"
                                                        >
                                                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 sm:py-12">
                                    <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">📝</div>
                                    <h3 className="text-base sm:text-lg font-medium sm:font-semibold text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">아직 스케줄이 없습니다</h3>
                                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-500">위에서 스케줄을 추가해보세요</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="px-3 sm:px-6 py-2 sm:py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                        <button
                            onClick={onClose}
                            className="px-3 sm:px-6 py-2 sm:py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer text-sm sm:text-base"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </div>

            {/* 확인 대화상자 */}
            {confirmDialog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
                        {/* 디버그 정보 */}
                        <div className="text-xs text-gray-500 mb-2">
                            Debug: {JSON.stringify(confirmDialog)}
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            {confirmDialog.type === 'user' && '참가자 삭제'}
                            {confirmDialog.type === 'timeSlot' && '시간대 삭제'}
                            {confirmDialog.type === 'schedule' && '스케줄 삭제'}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-6">
                            {confirmDialog.type === 'user' && 
                                `"${confirmDialog.userName || '알 수 없는 사용자'}"님을 이 날짜의 참가자에서 삭제하시겠습니까?`
                            }
                            {confirmDialog.type === 'timeSlot' && 
                                `"${confirmDialog.userName || '알 수 없는 사용자'}"님의 시간대를 삭제하시겠습니까?`
                            }
                            {confirmDialog.type === 'schedule' && 
                                `"${confirmDialog.scheduleContent}" 스케줄을 삭제하시겠습니까?`
                            }
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setConfirmDialog(null)}
                                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                            >
                                취소
                            </button>
                            <button
                                onClick={() => {
                                    if (confirmDialog.type === 'user' && confirmDialog.userId) {
                                        handleRemoveUser(confirmDialog.userId);
                                    } else if (confirmDialog.type === 'timeSlot' && confirmDialog.userId && confirmDialog.slotId) {
                                        handleRemoveTimeSlot(confirmDialog.userId, confirmDialog.slotId);
                                    } else if (confirmDialog.type === 'schedule' && confirmDialog.scheduleIdx !== undefined) {
                                        handleRemoveSchedule(dateKey, confirmDialog.scheduleIdx);
                                    }
                                }}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
