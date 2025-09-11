import React, { useState } from 'react';
import { CommonModal } from "./CommonModal";
import { useTheme } from '@/contexts/ThemeContext';

interface SettingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingModal: React.FC<SettingModalProps> = ({ isOpen, onClose }) => {
    const { currentTheme, theme, setTheme } = useTheme();
    const themeClasses = theme.classes;
    
    const [settingsState, setSettingsState] = useState({
        darkMode: currentTheme === '4', // 테마 4가 다크 모드라고 가정
        emailNotifications: true,
        pushNotifications: false
    });

    const handleSaveSettings = () => {
        // 설정 저장 로직
        console.log('설정 저장:', settingsState);

        // 다크 모드 설정 적용
        if (settingsState.darkMode && currentTheme !== '4') {
            setTheme('4'); // 다크 모드 테마로 변경
        } else if (!settingsState.darkMode && currentTheme === '4') {
            setTheme('1'); // 라이트 모드 테마로 변경
        }

        // 알림 설정 적용 (예시)
        if (settingsState.emailNotifications) {
            console.log('이메일 알림 활성화');
        }

        if (settingsState.pushNotifications) {
            console.log('푸시 알림 활성화');
        }

        // 모달 닫기
        onClose();
    };

    return (
        <CommonModal
            isOpen={isOpen}
            onClose={onClose}
            title="설정"
            animation="scale"
            width="w-[350px]"
            showCancelButton={true}
            showConfirmButton={true}
            cancelText="취소"
            confirmText="저장"
            onConfirm={handleSaveSettings}
        >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h3 className={`font-medium text-sm ${themeClasses.text}`}>테마 설정</h3>
                        <div className={`p-3 rounded-md ${themeClasses.background} border ${themeClasses.border}`}>
                            <div className="flex items-center justify-between">
                                <span className={`text-xs ${themeClasses.text}`}>다크 모드</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settingsState.darkMode}
                                        onChange={(e) => setSettingsState({ ...settingsState, darkMode: e.target.checked })}
                                    />
                                    <div className={`w-9 h-5 ${settingsState.darkMode ? themeClasses.primary : 'bg-gray-200'} rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all`}></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className={`font-medium text-sm ${themeClasses.text}`}>알림 설정</h3>
                        <div className={`p-3 rounded-md ${themeClasses.background} border ${themeClasses.border}`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-xs ${themeClasses.text}`}>이메일 알림</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settingsState.emailNotifications}
                                        onChange={(e) => setSettingsState({ ...settingsState, emailNotifications: e.target.checked })}
                                    />
                                    <div className={`w-9 h-5 ${settingsState.emailNotifications ? themeClasses.primary : 'bg-gray-200'} rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all`}></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`text-xs ${themeClasses.text}`}>푸시 알림</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settingsState.pushNotifications}
                                        onChange={(e) => setSettingsState({ ...settingsState, pushNotifications: e.target.checked })}
                                    />
                                    <div className={`w-9 h-5 ${settingsState.pushNotifications ? themeClasses.primary : 'bg-gray-200'} rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all`}></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className={`font-medium text-sm ${themeClasses.text}`}>계정 설정</h3>
                        <div className={`p-3 rounded-md ${themeClasses.background} border ${themeClasses.border}`}>
                            <div className="flex flex-col space-y-3">
                                <button 
                                    className={`text-xs py-1 px-2 rounded-md border ${themeClasses.border} hover:bg-black/5 transition`}
                                    onClick={() => console.log('비밀번호 변경')}
                                >
                                    비밀번호 변경
                                </button>
                                <button 
                                    className={`text-xs py-1 px-2 rounded-md border ${themeClasses.border} text-red-500 hover:bg-red-50 transition`}
                                    onClick={() => console.log('로그아웃')}
                                >
                                    로그아웃
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </CommonModal>
    );
}