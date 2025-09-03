import React, { useState } from 'react';
import { SectionLabel } from '../Label';
import useFirebaseState from '@/utils/useFirebaseState';
import { getTextColor } from '@/utils/textUtils';
import { UserDataT, Goal } from '@/modules/types';
import { useToast } from '@/contexts/ToastContext';

interface GoalListProps{
    userList: UserDataT[]|null;
    onGoalAdd?: () => void;
}
export const GoalList = (props: GoalListProps) => {
    const {userList, onGoalAdd} = props;
    const { goals, toggleGoalCompletion, deleteGoal, updateGoal } = useFirebaseState();
    const { showToast } = useToast();

    const [editId, setEditId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [deleteConfirmGoal, setDeleteConfirmGoal] = useState<Goal | null>(null);

    // 목표 유저별 필터링 상태
    const [goalFilterUser, setGoalFilterUser] = useState('');

    const handleGoalDelete = (e: React.MouseEvent, goal: Goal) => {
        e.stopPropagation();
        setDeleteConfirmGoal(goal);
    };

    const handleEdit = (e: React.MouseEvent, goal: Goal) => {
        e.stopPropagation();
        updateGoal(goal.id, goal.userId, { content: editContent });
        setEditId(null);
    }

    const handleGoalToggle = (goal: Goal) => {
        toggleGoalCompletion(goal.id, goal.userId)
    };

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <SectionLabel
                className="mb-2 text-base lg:text-lg">
                이번달 목표
            </SectionLabel>

            <div
                className='flex items-center'>
                <span
                    className='pr-[5px] flex items-center'>
                    <svg
                        className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500 dark:text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                        <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </span>
                <select
                    value={goalFilterUser}
                    onChange={e => setGoalFilterUser(e.target.value)}
                    className="mb-2 w-[95%] p-2 lg:p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-500 text-sm lg:text-base"
                >
                    <option value="">전체</option>
                    {userList
                        ?.sort((a, b) => a.name.localeCompare(b.name, 'ko', { numeric: true }))
                        .map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                </select>
            </div>
            <button
                className="w-full mb-4 p-2 lg:p-3 rounded-md font-medium lg:font-semibold transition-colors cursor-pointer text-sm lg:text-base"
                style={{ backgroundColor: userList && userList.length > 0 ? '#3b82f6' : '#d1d5db', color: userList && userList.length > 0 ? '#fff' : 'rgb(136, 136, 136)' }}
                onClick={() => { onGoalAdd?.(); }}
            >
                목표 추가
            </button>
            <div
                className="overflow-y-auto overflow-x-hidden flex-1 min-h-0 custom-scrollbar">
                <ul className="space-y-2">
                    {goals
                        .filter(goal => goalFilterUser === '' || goal.userId === goalFilterUser)
                        .sort((a, b) => {
                            // 사용자 이름으로 정렬
                            const userA = userList?.find(p => p.id === a.userId);
                            const userB = userList?.find(p => p.id === b.userId);
                            const nameA = userA?.name || '';
                            const nameB = userB?.name || '';
                            return nameA.localeCompare(nameB);
                        })
                        .map(goal => {
                        const p = userList?.find(p => p.id === goal.userId);
                        const backgroundColor = p?.color || '#6366f1';
                        const textColor = getTextColor(backgroundColor);

                        return (
                            <li
                                key={goal.id + '-' + goal.userId}
                                className="flex flex-wrap items-start gap-2 px-3 py-2 rounded-lg shadow-md border cursor-pointer hover:opacity-80 transition-opacity min-w-0"
                                style={{
                                    backgroundColor: backgroundColor,
                                    borderColor: backgroundColor,
                                    color: textColor
                                }}
                                onClick={() => handleGoalToggle(goal)}
                            >
                                {editId === goal.id ? (
                                    <div
                                        className="flex flex-row items-center gap-1 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
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
                                            onClick={(e) => {
                                                handleEdit(e, goal);
                                            }}
                                        >
                                            저장
                                        </button>
                                        <button
                                            className="px-2 py-1 whitespace-nowrap text-xs cursor-pointer bg-white/20 rounded-full hover:bg-white/30 transition-colors flex-shrink-0"
                                            style={{ color: textColor }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditId(null);
                                            }}
                                        >
                                            취소
                                        </button>
                                    </div>
                                ) : (
                                    <span
                                        className={`flex-1 text-xs min-w-0 break-words leading-relaxed ${goal.completed ? 'line-through opacity-60' : ''}`}
                                        style={{ 
                                            wordBreak: 'break-word',
                                            overflowWrap: 'break-word',
                                            whiteSpace: 'normal'
                                        }}
                                    >
                                        {goal.content}
                                    </span>
                                )}
                                {p && editId !== goal.id && (
                                    <span
                                        className="flex items-center gap-1 text-xs font-semibold flex-shrink-0"
                                        style={{ color: textColor }}>
                                        {p.icon && <span
                                            className="text-sm">{p.icon}</span>}
                                        <span>{p.name}</span>
                                    </span>
                                )}
                                {editId !== goal.id && (
                                    <div
                                        className="flex items-center gap-1 flex-shrink-0"
                                        onClick={(e) => e.stopPropagation()}>
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
                                            onClick={(e) => { handleGoalDelete(e, goal) }}
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
            </div>
            
            {/* 삭제 확인 대화상자 */}
            {deleteConfirmGoal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl flex flex-col gap-4">
                        <h3 className="text-lg font-bold mb-2">목표 삭제</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            정말 이 목표를 삭제하시겠습니까?
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                삭제할 목표: {deleteConfirmGoal.content}
                            </p>
                        </div>
                        <div className="flex gap-3 justify-end mt-3">
                            <button 
                                onClick={() => setDeleteConfirmGoal(null)} 
                                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={() => {
                                    if (deleteConfirmGoal) {
                                        deleteGoal(deleteConfirmGoal.id, deleteConfirmGoal.userId);
                                        showToast('목표를 삭제했습니다.', 'success');
                                        setDeleteConfirmGoal(null);
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
    );
};
