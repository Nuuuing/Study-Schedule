import React, { useState } from 'react';
import type { Goal, Participant } from '@/types';

interface GoalListProps {
    goals: Goal[];
    participants: Participant[];
    onToggle: (goalId: string, participantId: string) => void;
    onEdit: (id: string, participantId: string, data: Partial<Goal>) => void;
    onDelete: (id: string, participantId: string) => void;
}

export const GoalList = (props: GoalListProps) => {
    const { goals, participants, onToggle, onEdit, onDelete } = props;
    
    const [editId, setEditId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    return (
        <ul className="space-y-2">
            {goals.map(goal => (
                <li
                    key={goal.id + '-' + goal.participantId}
                    className="flex items-center gap-2 p-2 rounded-lg shadow-md border"
                    style={{
                        background: (() => {
                            const p = participants.find(p => p.id === goal.participantId);
                            return p?.color ? p.color + '22' : '#fef9c3';
                        })(),
                        borderColor: (() => {
                            const p = participants.find(p => p.id === goal.participantId);
                            return p?.color || '#fde047';
                        })(),
                        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)'
                    }}
                >
                    <input type="checkbox" checked={goal.completed} onChange={() => onToggle(goal.id, goal.participantId)} className="accent-blue-500" />
                    {editId === goal.id ? (
                        <div className="flex flex-row items-center gap-2 flex-1 min-w-0">
                            <input
                                className="flex-1 text-sm rounded border px-1 min-w-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 placeholder-gray-500 dark:placeholder-gray-400"
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
                                style={{ minWidth: 0 }}
                                maxLength={40}
                                placeholder="내용을 입력하세요"
                            />
                            <button 
                            className="text-blue-500 px-1 py-1 rounded hover:bg-blue-50 whitespace-nowrap text-sm cursor-pointer" 
                            onClick={() => { onEdit(goal.id, goal.participantId, { content: editContent }); setEditId(null); }}>저장</button>
                            <button 
                            className="text-gray-500 px-1 py-1 rounded hover:bg-gray-100 whitespace-nowrap text-sm cursor-pointer" 
                            onClick={() => setEditId(null)}>취소</button>
                        </div>
                    ) : (
                        <span className={`flex-1 text-sm ${goal.completed ? 'line-through text-gray-400' : ''}`}>{goal.content}</span>
                    )}
                    {(() => {
                        const p = participants.find(p => p.id === goal.participantId);
                        if (!p) return null;
                        return (
                            <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: p.color || '#222' }}>
                                {p.icon && <span className="text-lg align-middle">{p.icon}</span>}
                                <span>{p.name}</span>
                            </span>
                        );
                    })()}
                    {editId !== goal.id ? (
                        <>
                            <button className="text-gray-500 px-1 text-sm cursor-pointer" onClick={() => { setEditId(goal.id); setEditContent(goal.content); }}>수정</button>
                            <button className="text-red-500 px-1 text-sm cursor-pointer" onClick={() => onDelete(goal.id, goal.participantId)}>삭제</button>
                        </>
                    ) : null}
                </li>
            ))}
        </ul>
    );
};
