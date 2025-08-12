import React, { useState } from 'react';
import { colorOptions, type Participant } from '@/types'

interface UserListProps {
    participants: Participant[];
    onRemove: (id: string) => void;
    onEdit: (id: string, data: Partial<Participant>) => void;
}

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
        if (editId) onEdit(editId, editData);
        closeEdit();
    };

    const handleUserClick = (p: Participant) => {
        setSelectedId(p.id); 
        openEdit(p);
    };

    return <>
        <ul className="space-y-2">
            {participants.map(p => (
                <li
                    key={p.id}
                    className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer ${selectedId === p.id ? 'ring-2 ring-blue-500' : ''}`}
                    style={{
                        background: p.color ? p.color + '22' : '#e0e7ff',
                        border: p.color ? `1.5px solid ${p.color}` : '1.5px solid #a5b4fc'
                    }}
                    onClick={() => {handleUserClick(p)}}
                >
                    {p.icon && <span className="text-2xl mr-2">{p.icon}</span>}
                    <span className="flex-1 font-semibold" style={{ color: p.color || '#222' }}>{p.name}</span>
                    <button onClick={e => { e.stopPropagation(); onRemove(p.id); }} className="p-1 text-red-500 hover:text-red-700 cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </li>
            ))}
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
                        <select value={editData.color || ''} onChange={e => setEditData(d => ({ ...d, color: e.target.value }))} className="p-2 rounded border" style={{ background: editData.color || '#e5e7eb' }}>
                            <option value="">색상 선택</option>
                            {colorOptions.map(c => <option key={c} value={c} style={{ background: c }}>{c}</option>)}
                        </select>
                    </label>
                    <label className="flex flex-col gap-1">
                        <span>아이콘</span>
                        <input type="text" value={editData.icon || ''} maxLength={2} onChange={e => setEditData(d => ({ ...d, icon: e.target.value }))} className="p-2 rounded border" placeholder="😀" />
                    </label>
                    <div className="flex gap-2 justify-end mt-2">
                        <button onClick={closeEdit} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 cursor-pointer">취소</button>
                        <button onClick={handleSave} className="px-3 py-1 rounded bg-blue-500 text-white cursor-pointer">저장</button>
                    </div>
                </div>
            </div>
        )}
    </>;
};
