import React from 'react';
import { TimeEditButton } from '../Button';

type AttendanceDetail = {
    present?: boolean;
    start?: string;
    end?: string;
};

type Participant = {
    id: string;
    name: string;
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
};

export const AttendanceModal = (props: AttendanceModalProps) => {
    const { open, date, participants, attendanceInput, onAddUser, onTogglePresent, onTimeChange, onRemoveUser, onClose, onSave } = props;

    if (!open || !date) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-lg w-full shadow-2xl transition-all duration-300">
                <h3 className="text-2xl font-bold mb-6">
                    {date && date instanceof Date ? date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : ''}
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <select
                            className="flex-1 p-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
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
                                    <span className="w-1/4 font-semibold">{p.name}</span>
                                    <button
                                        className={`rounded-full w-7 h-7 flex items-center justify-center border text-xs font-bold cursor-pointer
                            ${detail.present ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-200 border-green-400 dark:border-green-600' : 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-200 border-red-400 dark:border-red-600'}`}
                                        onClick={() => onTogglePresent(pid)}
                                    >{detail.present ? 'O' : 'X'}</button>
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
                <div className="mt-8 flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    >
                        닫기
                    </button>
                    <button
                        onClick={onSave}
                        className="px-4 py-2 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors cursor-pointer"
                    >
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
}
