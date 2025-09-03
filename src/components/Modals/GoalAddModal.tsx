import React, { useEffect, useState } from 'react';
import type { UserDataT } from '@/modules/types'

type GoalModalProps = {
    userList: UserDataT[]|null;
    open: boolean;
    onAdd: (participantId: string, content: string) => void;
    onClose: () => void;
};

export const GoalAddModal = (props: GoalModalProps) => {
    const { userList, open, onAdd, onClose } = props;
    const [selectedIdx, setSelectedIdx] = useState('');
    const [content, setContent] = useState('');
    const [addDisabled, setAddDisabled] = useState<boolean>(false);

    React.useEffect(() => {
        if (open) {
            setSelectedIdx('');
            setContent('');
        }
    }, [open]);

    useEffect(() => {
        if (selectedIdx === '' || !content || content.trim() === '') {
            setAddDisabled(true);
        } else {
            setAddDisabled(false);
        }
    }, [selectedIdx, content])

    const handleAddGoal = () => {
        if (!addDisabled && selectedIdx !== '' && content && userList) {
            const idx = parseInt(selectedIdx, 10);
            if (!isNaN(idx) && userList[idx]) {
                onAdd(userList[idx].id, content);
                onClose();
            }
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 w-[350px] shadow-2xl flex flex-col gap-4">
                <h3 className="text-lg font-bold mb-2">목표 추가</h3>
                <select
                    value={selectedIdx}
                    onChange={e => setSelectedIdx(e.target.value)}
                    className="w-full p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={userList?.length === 0}
                >
                    <option value="">참여자 선택</option>
                    {userList
                        ?.sort((a, b) => a.name.localeCompare(b.name, 'ko', { numeric: true }))
                        .map((p, idx) => (
                        <option key={p.id + '-' + idx} value={userList.indexOf(p).toString()}>{p.name}</option>
                    ))}
                </select>
                <input
                    type="text"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="목표 내용 입력"
                    className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                />
                <div className="flex gap-2 justify-end mt-4">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer">취소</button>
                    <button
                        onClick={() => handleAddGoal()}
                        className={'px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600' + (addDisabled ? ' opacity-50 cursor-not-allowed' : 'cursor-pointer')}
                        disabled={addDisabled}
                    >추가</button>
                </div>
            </div>
        </div>
    );
}
