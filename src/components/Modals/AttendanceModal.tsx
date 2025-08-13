import React from 'react';
import { format } from 'date-fns';
import { TimeEditButton } from '../Button';

type AttendanceDetail = {
    present?: boolean;
    start?: string;
    end?: string;
};

type Participant = {
    id: string;
    name: string;
    color?: string;
};

type ScheduleItem = {
    content: string;
    createdAt: number;
};
type Schedules = {
    [date: string]: ScheduleItem[];
};
type AttendanceModalProps = {
    open: boolean;
    date: Date | null;
    participants: Participant[];
    attendanceInput: Record<string, AttendanceDetail>;
    onAddUser: (id: string) => void;
    onTogglePresent: (id: string) => void;
    onTimeChange: (id: string, field: 'start' | 'end', value: string) => void;
    onRemoveUser: (id: string) => void;
    onClose: () => void;
    onSave: () => void;
    schedules: Schedules;
    onAddSchedule: (date: string, content: string) => void;
    onRemoveSchedule: (date: string, idx: number) => void;
    onUpdateSchedule: (date: string, idx: number, newContent: string) => void;
};

export const AttendanceModal = (props: AttendanceModalProps) => {
    const { open, date, participants, attendanceInput, onAddUser, onTogglePresent, onTimeChange, onRemoveUser, onClose, onSave, schedules, onAddSchedule } = props;
    const [tab, setTab] = React.useState<'attendance' | 'schedule'>('attendance');
    const [scheduleInput, setScheduleInput] = React.useState('');
    // 스케줄 인라인 수정 상태를 컴포넌트 전체에서 관리
    const [editIdx, setEditIdx] = React.useState<number | null>(null);
    const [editValue, setEditValue] = React.useState('');
    if (!open || !date) return null;
    const dateKey = date instanceof Date ? format(date, 'yyyy-MM-dd') : '';
    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-lg w-full shadow-2xl transition-all duration-300">
                <h3 className="text-2xl font-bold mb-6">
                    {date && date instanceof Date ? format(date, 'yyyy-MM-dd') : ''}
                </h3>
                <div className="flex gap-2 mb-6">
                    <button
                        className={`flex-1 py-2 rounded-t-md font-semibold ${tab === 'attendance' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                        onClick={() => setTab('attendance')}
                    >참석자 추가</button>
                    <button
                        className={`flex-1 py-2 rounded-t-md font-semibold ${tab === 'schedule' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                        onClick={() => setTab('schedule')}
                    >스케줄 추가</button>
                </div>
                {tab === 'attendance' ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <select
                                className="flex-1 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-500"
                                defaultValue=""
                                onChange={e => {
                                    if (e.target.value) onAddUser(e.target.value);
                                }}
                            >
                                <option value="">참가자 추가</option>
                                {participants.filter(p => !attendanceInput[p.id]).map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        {Object.keys(attendanceInput).length > 0 ? (
                            Object.entries(attendanceInput).map(([pid, detail]) => {
                                const p = participants.find(u => u.id === pid);
                                if (!p) return null;
                                return (
                                    <div key={pid} className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 py-2">
                                        {/* 참석 dot */}
                                        <span
                                            className={`inline-block w-2 h-2 rounded-full mr-2 ${detail.present ? 'bg-green-400' : 'bg-red-400'}`}
                                            aria-label={detail.present ? '참석' : '미참'}
                                        />
                                        {/* 이름: GoalList 스타일 */}
                                        <span
                                            className="w-1/4 font-semibold px-2 py-1 rounded"
                                            style={{
                                                background: p.color || '#e5e7eb',
                                                color: '#222',
                                            }}
                                        >{p.name}</span>
                                        <button
                                            className={`rounded-full w-7 h-7 flex items-center justify-center border text-xs font-bold cursor-pointer
                                ${detail.present ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-200 border-green-400 dark:border-green-600' : 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-200 border-red-400 dark:border-red-600'}`}
                                            onClick={() => onTogglePresent(pid)}
                                        >{detail.present ? 'O' : 'X'}</button>
                                        {detail.present && (
                                            <>
                                                <TimeEditButton
                                                    value={detail.start}
                                                    placeholder="시작"
                                                    onChange={(val: string) => onTimeChange(pid, 'start', val)}
                                                />
                                                <TimeEditButton
                                                    value={detail.end}
                                                    placeholder="종료"
                                                    onChange={(val: string) => onTimeChange(pid, 'end', val)}
                                                />
                                            </>
                                        )}
                                        <button
                                            className="ml-2 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-xs hover:bg-red-200 dark:hover:bg-red-700 cursor-pointer color-red"
                                            onClick={() => onRemoveUser(pid)}
                                            type="button"
                                        >X</button>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">참가자를 추가하세요.</p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="mb-2">
                            <input
                                className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                                placeholder="스케줄 내용을 입력하세요"
                                value={scheduleInput}
                                onChange={e => setScheduleInput(e.target.value)}
                            />
                        </div>
                        <div>
                            <button
                                className="px-4 py-2 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors cursor-pointer"
                                onClick={() => {
                                    if (scheduleInput.trim() && dateKey) {
                                        onAddSchedule(dateKey, scheduleInput.trim());
                                        setScheduleInput('');
                                    }
                                }}
                            >스케줄 추가</button>
                        </div>
                        <div className="mt-4">
                            <div className="font-semibold mb-2">등록된 스케줄</div>
                            {schedules[dateKey] && schedules[dateKey].length > 0 ? (
                                <ul className="space-y-1">
                                    {schedules[dateKey].map((item, idx) => (
                                        <li key={idx} className="flex items-center text-sm bg-blue-50 dark:bg-blue-900 rounded px-2 py-1 truncate">
                                            {editIdx === idx ? (
                                                <>
                                                    <input
                                                        className="flex-1 p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                                                        value={editValue}
                                                        onChange={e => setEditValue(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <button
                                                        className="ml-2 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-700 text-xs text-blue-600 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800"
                                                        onClick={() => {
                                                            if (editValue.trim()) {
                                                                props.onUpdateSchedule(dateKey, idx, editValue.trim());
                                                                setEditIdx(null);
                                                            }
                                                        }}
                                                    >저장</button>
                                                    <button
                                                        className="ml-1 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800"
                                                        onClick={() => setEditIdx(null)}
                                                    >취소</button>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="flex-1 truncate">{item.content}</span>
                                                    <button
                                                        className="ml-2 px-2 py-0.5 rounded bg-green-100 dark:bg-green-700 text-xs text-green-600 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800"
                                                        onClick={() => {
                                                            setEditIdx(idx);
                                                            setEditValue(item.content);
                                                        }}
                                                        title="수정"
                                                    >수정</button>
                                                    <button
                                                        className="ml-1 px-2 py-0.5 rounded bg-red-100 dark:bg-red-700 text-xs text-red-600 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800"
                                                        onClick={() => props.onRemoveSchedule(dateKey, idx)}
                                                        title="삭제"
                                                    >삭제</button>
                                                </>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-400">스케줄이 없습니다.</p>
                            )}
                        </div>
                    </div>
                )}
                <div className="mt-8 flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    >
                        닫기
                    </button>
                    {tab === 'attendance' && (
                        <button
                            onClick={onSave}
                            className="px-4 py-2 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors cursor-pointer"
                        >
                            저장
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
