import React, { useState } from 'react';
import { SectionLabel } from '../Label';
import { getTextColor } from '@/utils/textUtils';
import { UserDataT } from '@/modules/types';
import { useToast } from '@/contexts/ToastContext';

interface UserListProps {
    userList: UserDataT[]|null;
    userSliderClose: () => void;
}

export const UserList = (props: UserListProps) => {
    const { userList: initialUserList, userSliderClose } = props;
    const [userList, setUserList] = useState<UserDataT[]>(initialUserList || []);
    const { showToast } = useToast();
    
    // useFirebaseState의 함수들을 로컬 함수로 대체
    const removeUser = (userId: string) => {
        setUserList((prev) => prev.filter((user) => user.id !== userId));
        return Promise.resolve();
    };
    
    const updateUser = (userId: string, data: Partial<UserDataT>) => {
        setUserList((prev) => 
            prev.map((user) => 
                user.id === userId ? { ...user, ...data } : user
            )
        );
        return Promise.resolve();
    };
    
    const addUser = (name: string) => {
        const newUser: UserDataT = {
            id: `user-${Date.now()}`,
            name,
            color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
            icon: 'default'
        };
        setUserList((prev) => [...prev, newUser]);
        return Promise.resolve();
    };

    const [newParticipantName, setNewParticipantName] = useState('');
    const [editId, setEditId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<UserDataT>>({});
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const openEdit = (p: UserDataT) => {
        setEditId(p.id);
        setEditData({ name: p.name, color: p.color, icon: p.icon });
    };
    const closeEdit = () => {
        setEditId(null);
        setEditData({});
    };
    const handleSave = () => {
        const trimmedName = editData.name?.trim();
        if (!trimmedName) {
            showToast('이름을 입력해주세요.', 'warning');
            return;
        }
        if (trimmedName.length < 1) {
            showToast('이름은 최소 1글자 이상이어야 합니다.', 'warning');
            return;
        }
        if (editId) {
            updateUser(editId, { ...editData, name: trimmedName });
            closeEdit();
            showToast('참여자 정보가 수정되었습니다.', 'success');
        }
    };

    const handleUserClick = (p: UserDataT) => {
        setSelectedId(p.id);
        openEdit(p);
    };

    return (<div>
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <SectionLabel>참여자 관리</SectionLabel>
                <button
                    onClick={() => userSliderClose()}
                    className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <form onSubmit={e => {
                e.preventDefault();
                const trimmedName = newParticipantName.trim();
                if (!trimmedName) {
                    showToast('이름을 입력해주세요.', 'warning');
                    return;
                }
                if (trimmedName.length < 1) {
                    showToast('이름은 최소 1글자 이상이어야 합니다.', 'warning');
                    return;
                }
                addUser(trimmedName);
                setNewParticipantName('');
                showToast('참여자가 추가되었습니다.', 'success');
            }} className="mb-6 flex gap-2 items-stretch">
                <input
                    type="text"
                    value={newParticipantName}
                    onChange={e => setNewParticipantName(e.target.value)}
                    placeholder="참여자 이름 입력"
                    className="flex-1 min-w-0 p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={20}
                />
                <button
                    type="submit"
                    disabled={!newParticipantName.trim()}
                    className={`px-4 py-2 rounded-md font-semibold transition-colors whitespace-nowrap flex-shrink-0 ${newParticipantName.trim()
                        ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }`}
                >
                    추가
                </button>
            </form>
            <ul className="space-y-2">
                {userList
                    ?.sort((a, b) => a.name.localeCompare(b.name, 'ko', { numeric: true }))
                    .map(p => {
                        const textColor = getTextColor(p.color || '#6366f1');
                        return (
                            <li
                                key={p.id}
                                className={`flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-full shadow-md border cursor-pointer hover:opacity-80 transition-opacity min-w-0 ${selectedId === p.id ? 'ring-2 ring-blue-400' : ''}`}
                                style={{
                                    backgroundColor: p.color || '#6366f1',
                                    borderColor: p.color || '#6366f1',
                                    color: textColor
                                }}
                                onClick={() => { handleUserClick(p) }}
                            >
                                {p.icon && <span className="text-sm flex-shrink-0">{p.icon}</span>}
                                <span className="flex-1 text-xs font-semibold min-w-0">{p.name}</span>
                                <button
                                    onClick={e => { 
                                        e.stopPropagation(); 
                                        setDeleteConfirmId(p.id);
                                    }}
                                    className="text-xs cursor-pointer bg-white/20 rounded-full w-5 h-5 flex items-center justify-center hover:bg-white/30 transition-colors flex-shrink-0"
                                    style={{ color: textColor }}
                                    title="삭제"
                                >
                                    X
                                </button>
                            </li>
                        );
                    })}
            </ul>
            {editId && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-80 shadow-xl flex flex-col gap-4">
                        <h3 className="text-lg font-bold mb-2">참여자 정보 수정</h3>
                        <label className="flex flex-col gap-1">
                            <span>이름</span>
                            <input 
                                type="text" 
                                value={editData.name || ''} 
                                onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} 
                                className="p-2 rounded border"
                                placeholder="이름을 입력하세요"
                                maxLength={20}
                            />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span>색상</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={editData.color || '#6366f1'}
                                    onChange={e => setEditData(d => ({ ...d, color: e.target.value }))}
                                    className="w-12 h-12 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={editData.color || ''}
                                    onChange={e => setEditData(d => ({ ...d, color: e.target.value }))}
                                    placeholder="#6366f1"
                                    className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </label>
                        <label className="flex flex-col gap-1">
                            <span>아이콘</span>
                            <input type="text" value={editData.icon || ''} maxLength={2} onChange={e => setEditData(d => ({ ...d, icon: e.target.value }))} className="p-2 rounded border" placeholder="😀" />
                        </label>
                        <div className="flex gap-2 justify-end mt-2">
                            <button onClick={closeEdit} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 cursor-pointer">취소</button>
                            <button
                                onClick={handleSave}
                                disabled={!editData.name?.trim()}
                                className={`px-3 py-1 rounded font-medium transition-colors ${editData.name?.trim()
                                    ? 'bg-blue-500 text-white cursor-pointer hover:bg-blue-600'
                                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* 삭제 확인 대화상자 */}
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl flex flex-col gap-4">
                        <h3 className="text-lg font-bold mb-2">사용자 삭제</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            정말 이 사용자를 삭제하시겠습니까? 사용자의 모든 데이터(목표, 참여 기록, 공부 시간)가 함께 삭제됩니다.
                        </p>
                        <div className="flex gap-3 justify-end mt-3">
                            <button 
                                onClick={() => setDeleteConfirmId(null)} 
                                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={async () => {
                                    if (deleteConfirmId) {
                                        await removeUser(deleteConfirmId);
                                        showToast('참여자가 삭제되었습니다.', 'success');
                                        setDeleteConfirmId(null);
                                    }
                                }}
                                className="px-4 py-2 rounded-lg font-medium bg-red-500 text-white cursor-pointer hover:bg-red-600 transition-colors"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    </div>)
};
