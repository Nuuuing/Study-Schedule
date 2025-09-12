import React, { useState } from 'react';
import { CommonModal } from "./CommonModal";
import { useTheme } from '@/contexts/ThemeContext';

interface SettingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingModal: React.FC<SettingModalProps> = ({ isOpen, onClose }) => {
    const { currentTheme, theme } = useTheme();
    const themeClasses = theme.classes;

    const handleSaveSettings = () => {


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
            <div className="space-y-6">

                <div className="space-y-2">
                    <h3 className={`font-medium text-sm ${themeClasses.text}`}>계정정보</h3>
                    <div>
                        <p>이름</p>
                        <p>아이디</p>
                        <p>구글 계정</p>
                    </div>
                    <div className="flex flex-col space-y-3">
                        <button
                            className={`text-xs py-1 px-2 rounded-md border ${themeClasses.border} hover:bg-black/5 transition`}
                            onClick={() => console.log('비밀번호 변경')}
                        >
                            비밀번호 변경
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className={`font-medium text-sm ${themeClasses.text}`}>연동하기</h3>
                    <div className="flex flex-col space-y-3">
                        <button
                            className={`text-xs py-1 px-2 rounded-md border ${themeClasses.border} hover:bg-black/5 transition`}
                            onClick={() => console.log('구글')}
                        >
                            구글 캘린더
                        </button>

                    </div>
                </div>
            </div>

        </CommonModal>
    );
}