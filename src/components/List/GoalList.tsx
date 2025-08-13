import React, { useState } from 'react';
import type { Goal, Participant } from '@/types';

interface GoalListProps {
    goals: Goal[];
    participants: Participant[];
    onToggle: (goalId: string, participantId: string) => void;
    onEdit: (id: string, participantId: string, data: Partial<Goal>) => void;
    onDelete: (id: string, participantId: string) => void;
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

export const GoalList = (props: GoalListProps) => {
    const { goals, participants, onToggle, onEdit, onDelete } = props;
    
    const [editId, setEditId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    return (
        <ul className="space-y-2">
            {goals.map(goal => {
                const p = participants.find(p => p.id === goal.participantId);
                const backgroundColor = p?.color || '#6366f1';
                const textColor = getTextColor(backgroundColor);
                
                return (
                    <li
                        key={goal.id + '-' + goal.participantId}
                        className="flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-full shadow-md border cursor-pointer hover:opacity-80 transition-opacity min-w-0"
                        style={{
                            backgroundColor: backgroundColor,
                            borderColor: backgroundColor,
                            color: textColor
                        }}
                        onClick={() => onToggle(goal.id, goal.participantId)}
                    >
                        {editId === goal.id ? (
                            <div className="flex flex-row items-center gap-1 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                                <input
                                    className="flex-1 text-xs rounded-full border px-2 py-1 min-w-0 bg-white/20 text-inherit placeholder-current placeholder-opacity-60"
                                    value={editContent}
                                    onChange={e => setEditContent(e.target.value)}
                                    style={{ minWidth: 0, color: textColor }}
                                    maxLength={40}
                                    placeholder="내용을 입력하세요"
                                />
                                <button 
                                    className="px-2 py-1 whitespace-nowrap text-xs cursor-pointer bg-white/20 rounded-full hover:bg-white/30 transition-colors flex-shrink-0" 
                                    style={{ color: textColor }}
                                    onClick={(e) => { e.stopPropagation(); onEdit(goal.id, goal.participantId, { content: editContent }); setEditId(null); }}
                                >
                                    저장
                                </button>
                                <button 
                                    className="px-2 py-1 whitespace-nowrap text-xs cursor-pointer bg-white/20 rounded-full hover:bg-white/30 transition-colors flex-shrink-0" 
                                    style={{ color: textColor }}
                                    onClick={(e) => { e.stopPropagation(); setEditId(null); }}
                                >
                                    취소
                                </button>
                            </div>
                        ) : (
                            <span 
                                className={`flex-1 text-xs min-w-0 ${goal.completed ? 'line-through opacity-60' : ''}`}
                            >
                                {goal.content}
                            </span>
                        )}
                        {p && editId !== goal.id && (
                            <span className="flex items-center gap-1 text-xs font-semibold flex-shrink-0" style={{ color: textColor }}>
                                {p.icon && <span className="text-sm">{p.icon}</span>}
                                <span>{p.name}</span>
                            </span>
                        )}
                        {editId !== goal.id && (
                            <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button 
                                    className="text-xs cursor-pointer bg-white/20 rounded-full w-5 h-5 flex items-center justify-center hover:bg-white/30 transition-colors" 
                                    style={{ color: textColor }}
                                    onClick={(e) => { e.stopPropagation(); setEditId(goal.id); setEditContent(goal.content); }}
                                    title="수정"
                                >
                                    E
                                </button>
                                <button 
                                    className="text-xs cursor-pointer bg-white/20 rounded-full w-5 h-5 flex items-center justify-center hover:bg-white/30 transition-colors" 
                                    style={{ color: textColor }}
                                    onClick={(e) => { e.stopPropagation(); onDelete(goal.id, goal.participantId); }}
                                    title="삭제"
                                >
                                    X
                                </button>
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
    );
};
