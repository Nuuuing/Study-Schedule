import React, { useState } from 'react';
import type { Participant } from '@/types'

interface UserListProps {
    participants: Participant[];
    onRemove: (id: string) => void;
    onEdit: (id: string, data: Partial<Participant>) => void;
}

// 색상 밝기 계산하여 텍스트 색상 결정
const getTextColor = (backgroundColor: string) => {
    if (!backgroundColor) return '#222';
    
    // 헥스 색상을 RGB로 변환
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // 밝기 계산 (0-255 범위)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // 밝기가 150 이상이면 어두운 텍스트, 미만이면 밝은 텍스트
    return brightness > 150 ? '#1f2937' : '#f9fafb';
};

export const UserList = (props: UserListProps) => {
    const { participants, onRemove, onEdit } = props;
    const [editId, setEditId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<Participant>>({});
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const openEdit = (p: Participant) => {
        setEditId(p.id);
        setEditData({ name: p.name, color: p.color, icon: p.icon });
    };
    const closeEdit = () => {
        setEditId(null);
        setEditData({});
    };
    const handleSave = () => {
        if (editId && editData.name?.trim()) {
            onEdit(editId, editData);
            closeEdit();
        }
    };

    const handleUserClick = (p: Participant) => {
        setSelectedId(p.id); 
        openEdit(p);
    };

    return <>
        <ul className="space-y-2">
            {participants
                .sort((a, b) => a.name.localeCompare(b.name, 'ko', { numeric: true }))
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
                            onClick={() => {handleUserClick(p)}}
                        >
                            {p.icon && <span className="text-sm flex-shrink-0">{p.icon}</span>}
                            <span className="flex-1 text-xs font-semibold min-w-0">{p.name}</span>
                            <button 
                                onClick={e => { e.stopPropagation(); onRemove(p.id); }} 
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
                        <input type="text" value={editData.name || ''} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} className="p-2 rounded border" />
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
                            className={`px-3 py-1 rounded font-medium transition-colors ${
                                editData.name?.trim() 
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
    </>;
};
