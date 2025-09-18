'use client';

import { TodoList, Tooltip, CircleButton } from "@/components";
import { CommonModal, SettingModal } from "@/components/Modals";
import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "next/navigation";
import { useUserInfo } from "@/modules/stores";

const UserInfoContainer = () => {
    const { currentTheme, theme } = useTheme();
    const themeClasses = theme.classes;
    const router = useRouter();
    
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const userInfo = useUserInfo();

    const mainBg = currentTheme === '3' ? themeClasses.primary : themeClasses.background;
    // TODO 상태 관리
    const [todos, setTodos] = useState<string[]>([
        '할 일 111111111111111111111111111111111111',
        '할 일 2222222222222',
        '할 일 333333333333333333333333333333333333333333333',
    ]);
    const [newTodo, setNewTodo] = useState("");

    const handleAddTodo = () => {
        if (newTodo && typeof newTodo === 'string' && newTodo.trim() !== '') {
            setTodos([...todos, newTodo.trim()]);
            setNewTodo("");
        }
    };

    const handleDeleteTodo = (idx: number) => {
        setTodos(todos.filter((_, i) => i !== idx));
    };

    const handleEditTodo = (idx: number, value: string) => {
        setTodos(todos.map((todo, i) => (i === idx ? value : todo)));
    };
    
    const handleCheckTodo = (idx: number, checked: boolean) => {
        console.log(`Todo ${idx} checked: ${checked}`);
    };

    return (
        <>
            <div className={`w-full h-full flex flex-col items-center justify-start p-0 ${mainBg} ${themeClasses.text} bg-[size:20px_20px] bg-[-1px_-1px] bg-fixed border-l-2 ${themeClasses.border}`}>
                <div className={`w-full h-full flex flex-col items-center justify-start flex-1 min-h-0`}>
                    <div className={`flex items-center py-4`}>
                        {/* profile image */}
                        <div className={`w-15 h-15 rounded-full flex items-center justify-center ${themeClasses.primary} border-2 border-t${currentTheme}-text`} />
                        <div className={'ml-2'}>
                            <span className={`font-bold text-lg ${themeClasses.text}`}>{userInfo?.name}</span>
                            <p className={`text-xs font-light opacity-80 ${themeClasses.text}`}>{userInfo?.email}</p>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className={`w-full px-4`}>
                        <div className={`rounded-lg shadow p-3 mb-4 border-2 ${themeClasses.border} ${themeClasses.card}`}>
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-xs opacity-80 ${themeClasses.text}`}>~~ 지수 <Tooltip content="지수 설명" placement="top"><span className="ml-1 inline-block">ⓘ</span></Tooltip></span>
                                <span className={`text-xs opacity-80 ${themeClasses.text}`}>Level. 5</span>
                                <span className={`text-xs opacity-80 ${themeClasses.text}`}>500/1000</span>
                            </div>
                            <div className={`w-full h-3 rounded-full overflow-hidden 
                                    ${(currentTheme === '3' || currentTheme === '4') ? themeClasses.primary : themeClasses.secondary} bg-opacity-30`}>
                                <div className={`h-full ${(currentTheme === '3' || currentTheme === '4') ? themeClasses.secondary : themeClasses.primary}`}
                                    style={{ width: '50%' }} />
                            </div>
                        </div>
                    </div>
                    <div className="w-full flex items-center mb-3 justify-center gap-2">
                        <Tooltip content="통계 페이지로 이동합니다" placement="bottom">
                            <button
                                onClick={() => router.push('/stats')}
                                className={`flex items-center py-1 px-2 rounded-md ${themeClasses.background} hover:bg-black/10 border-2 ${themeClasses.border} font-medium text-sm transition cursor-pointer ${themeClasses.text}`}
                            >
                                통계
                            </button>
                        </Tooltip>

                        <Tooltip content="구글 캘린더와 연동합니다" placement="bottom">
                            <button
                                className={`flex items-center py-1 px-2 rounded-md ${themeClasses.background} hover:bg-black/10 border-2 ${themeClasses.border} font-medium text-xs transition cursor-pointer ${themeClasses.text}`}
                            >
                                <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                                    <svg viewBox="0 0 24 24">
                                        <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z" />
                                        <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2970142 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z" />
                                        <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z" />
                                        <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z" />
                                    </svg>
                                </div>
                            </button>
                        </Tooltip>
                    </div>
                    {/* TODO */}
                    <div className="w-full flex flex-col items-center pb-4 px-3 flex-1 min-h-0">
                        <div className={`w-full border-t-1 ${themeClasses.border} opacity-40 mb-2 mx-2`}></div>
                        <span className={`font-bold text-base mb-1 ${themeClasses.text}`}>TODO</span>
                        <TodoList
                            themeClasses={themeClasses}
                            todos={todos}
                            onDelete={handleDeleteTodo}
                            onEdit={handleEditTodo}
                            onCheck={handleCheckTodo}
                        />
                        <div className="flex w-full mt-2 px-2">
                            <input
                                className={`flex-1 px-2.5 py-1 text-xs rounded-l-md border-2 ${themeClasses.border} ${themeClasses.card} ${themeClasses.text}`}
                                value={newTodo}
                                onChange={e => setNewTodo(e.target.value)}
                                placeholder="새 할 일 입력"
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        handleAddTodo();
                                    }
                                }}
                                style={{ 
                                    background: themeClasses.background ? undefined : '#fff',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1) inset' 
                                }}
                            />
                            <button
                                className={`px-4 py-1 text-xs rounded-r-md border-2 border-l-0 ${themeClasses.border} ${themeClasses.primary} ${themeClasses.text} font-medium transition hover:brightness-95 flex items-center justify-center min-w-[60px] cursor-pointer`}
                                onClick={handleAddTodo}
                                style={{ 
                                    textShadow: '0 1px 0 rgba(255,255,255,0.3)',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}
                            >
                                <span>추가</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 설정 */}
            <div className="fixed right-2 top-17 z-10">
                <CircleButton
                    onClick={() => setIsSettingsModalOpen(true)}
                    ariaLabel="설정"
                    tooltipContent="설정"
                    tooltipPlacement="left"
                    size="md"
                    customStyle={{ background: 'white' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </CircleButton>
            </div>
            
            {/* 설정 모달 */}
            <SettingModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
            />
        </>
    );
};

export default UserInfoContainer;